import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import { GameState, ExperimentId, MODELS, Card, Turn } from './types/game.js';
import { createGameState, getCurrentPlayer, getOtherPlayers, processPlay, processChallenge, advanceTurn, checkWinner, finalizeGame, getNextRank } from './engine/game-state.js';
import { TurnManager, LLMAdapter } from './engine/turn-manager.js';
import { FeatherlessLLMAdapter, MockLLMAdapter } from './llm/llm-adapter.js';
import { createFeatherlessClient } from './llm/featherless-api.js';
import { GameLogger } from './logging/game-logger.js';
import { calculateAllStats } from './metrics/player-stats.js';
import { parseCard } from './engine/deck.js';

const PORT = 3001;
const UI_DIR = path.join(process.cwd(), 'ui');
const LOGS_DIR = path.join(process.cwd(), 'logs/games');

// Active games with step-by-step execution
interface ActiveGame {
  state: GameState;
  adapter: LLMAdapter;
  pendingTurn: Turn | null;
  challengeQueue: string[]; // Player IDs who can still challenge
  phase: 'waiting' | 'playing' | 'challenging' | 'finished';
  lastUpdate: number;
  stepInProgress: boolean; // Lock to prevent concurrent step calls
}

const activeGames = new Map<string, ActiveGame>();

// MIME types
const mimeTypes: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
};

// Create LLM adapter
function createAdapter(): LLMAdapter {
  if (process.env.MOCK || !process.env.FEATHERLESS_API_KEY) {
    return new MockLLMAdapter(0.4, 0.25);
  }
  return new FeatherlessLLMAdapter(createFeatherlessClient());
}

const logger = new GameLogger(LOGS_DIR);

// Parse JSON body
async function parseBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
}

// Send JSON response
function sendJSON(res: http.ServerResponse, data: any, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(data));
}

// Serve static files
function serveStatic(res: http.ServerResponse, filepath: string) {
  const ext = path.extname(filepath);
  const mimeType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filepath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(data);
  });
}

// Format card for sending to client
function formatCard(card: Card): string {
  return `${card.rank}${card.suit}`;
}

// Get visible state for UI (shows all hands for spectator view)
function getFullGameState(game: ActiveGame) {
  const state = game.state;

  // Determine who is currently "thinking" (next to be queried by the server)
  let thinkingPlayerId: string | null = null;
  if (game.phase === 'waiting') {
    thinkingPlayerId = getCurrentPlayer(state).id;
  } else if (game.phase === 'challenging' && game.challengeQueue.length > 0) {
    thinkingPlayerId = game.challengeQueue[0];
  }

  return {
    gameId: state.gameId,
    experimentId: state.experimentId,
    phase: game.phase,
    players: state.players.map((p, i) => ({
      id: p.id,
      modelId: p.modelId,
      hand: p.hand.map(formatCard),
      handSize: p.hand.length,
      isActive: i === state.currentPlayerIndex,
      isEliminated: p.isEliminated,
    })),
    currentPlayerIndex: state.currentPlayerIndex,
    currentRank: state.currentRank,
    pile: state.pile.map(formatCard),
    pileSize: state.pile.length,
    turns: state.turns,
    pendingTurn: game.pendingTurn,
    winner: state.winner,
    winnerModel: state.winner ? state.players.find(p => p.id === state.winner)?.modelId : null,
    thinkingPlayerId,
  };
}

// Start a new game
async function handleStartGame(req: http.IncomingMessage, res: http.ServerResponse) {
  const body = await parseBody(req);
  const experimentId = (body.experimentId || 1) as ExperimentId;

  // Pick 4 random models
  const shuffled = [...MODELS].sort(() => Math.random() - 0.5);
  const players = shuffled.slice(0, 4);

  const gameId = `game_${Date.now()}`;
  const state = createGameState(gameId, experimentId, players);
  const adapter = createAdapter();

  const isMock = process.env.MOCK || !process.env.FEATHERLESS_API_KEY;
  console.log(`\n[game] New game ${gameId} (experiment ${experimentId}, adapter: ${isMock ? 'MOCK' : 'Featherless API'})`);
  console.log(`[game] Players: ${players.join(', ')}`);

  const game: ActiveGame = {
    state,
    adapter,
    pendingTurn: null,
    challengeQueue: [],
    phase: 'waiting',
    lastUpdate: Date.now(),
    stepInProgress: false,
  };

  activeGames.set(gameId, game);

  sendJSON(res, getFullGameState(game));
}

// Advance the game by one step
async function handleNextStep(res: http.ServerResponse, gameId: string) {
  const game = activeGames.get(gameId);
  if (!game) {
    sendJSON(res, { error: 'Game not found' }, 404);
    return;
  }

  if (game.phase === 'finished') {
    sendJSON(res, getFullGameState(game));
    return;
  }

  if (game.stepInProgress) {
    console.log(`[step] BLOCKED — step already in progress for ${gameId}`);
    sendJSON(res, { ...getFullGameState(game), stepInProgress: true });
    return;
  }

  game.stepInProgress = true;

  try {
    // Phase: waiting -> playing (get play decision)
    if (game.phase === 'waiting') {
      const currentPlayer = getCurrentPlayer(game.state);
      console.log(`[step] Turn ${game.state.turns.length + 1} — ${currentPlayer.modelId} is playing (rank: ${game.state.currentRank}, hand: ${currentPlayer.hand.length} cards)`);

      const visibleState = {
        hand: currentPlayer.hand,
        currentRank: game.state.currentRank,
        pileSize: game.state.pile.length,
        otherPlayersCounts: Object.fromEntries(
          game.state.players
            .filter(p => p.id !== currentPlayer.id && !p.isEliminated)
            .map(p => [p.modelId, p.hand.length])
        ),
        recentTurns: game.state.turns.slice(-5),
      };

      console.log(`[step]   Calling ${currentPlayer.modelId} for play decision...`);
      const startTime = Date.now();
      const playResponse = await game.adapter.getPlayDecision(
        currentPlayer.id,
        currentPlayer.modelId,
        visibleState,
        game.state.experimentId
      );
      console.log(`[step]   Response in ${Date.now() - startTime}ms — plays ${playResponse.cards_to_play.join(', ')} (claims ${playResponse.claim_count})`);

      // Parse cards
      const actualCards: Card[] = [];
      for (const cardStr of playResponse.cards_to_play) {
        const parsed = parseCard(cardStr);
        if (parsed && currentPlayer.hand.some(c => c.rank === parsed.rank && c.suit === parsed.suit)) {
          actualCards.push(parsed);
        }
      }
      if (actualCards.length === 0 && currentPlayer.hand.length > 0) {
        console.log(`[step]   WARNING: No valid cards parsed from response, using fallback card`);
        actualCards.push(currentPlayer.hand[0]);
      }

      // Process the play
      const turn = processPlay(
        game.state,
        currentPlayer.id,
        actualCards,
        playResponse.claim_count || actualCards.length,
        playResponse.reasoning
      );

      const lieStr = turn.wasLie ? 'LIE' : 'TRUTH';
      console.log(`[step]   Play processed: ${turn.claimedCount}× ${turn.claimedRank} (${lieStr})`);

      // Attach token usage to the turn
      turn.playResponseTimeMs = playResponse.responseTimeMs;
      turn.playTokenUsage = playResponse.tokenUsage;

      game.pendingTurn = turn;
      game.challengeQueue = getOtherPlayers(game.state).map(p => p.id);
      game.phase = 'challenging';
      game.lastUpdate = Date.now();
    }
    // Phase: challenging -> check each challenger
    else if (game.phase === 'challenging' && game.pendingTurn) {
      if (game.challengeQueue.length === 0) {
        // No one challenged, advance turn
        console.log(`[step]   No challenge — turn accepted`);
        advanceTurn(game.state, game.pendingTurn);
        game.pendingTurn = null;
        game.phase = 'waiting';

        // Check for winner
        const winner = checkWinner(game.state);
        if (winner) {
          const winnerPlayer = game.state.players.find(p => p.id === winner);
          console.log(`[step] 🏆 WINNER: ${winnerPlayer?.modelId} after ${game.state.turns.length} turns`);
          finalizeGame(game.state, winner);
          game.phase = 'finished';

          // Save game log
          const log = logger.stateToLog(game.state);
          logger.saveGameLog(log);
        }
      } else {
        // Get next challenger's decision
        const challengerId = game.challengeQueue.shift()!;
        const challenger = game.state.players.find(p => p.id === challengerId)!;
        const currentPlayer = getCurrentPlayer(game.state);

        console.log(`[step]   Asking ${challenger.modelId} whether to challenge...`);

        const visibleState = {
          hand: challenger.hand,
          currentRank: game.state.currentRank,
          pileSize: game.state.pile.length - game.pendingTurn.actualCards.length,
          otherPlayersCounts: Object.fromEntries(
            game.state.players
              .filter(p => p.id !== challenger.id && !p.isEliminated)
              .map(p => [p.modelId, p.hand.length])
          ),
          recentTurns: game.state.turns.slice(-5),
        };

        const startTime = Date.now();
        const challengeResponse = await game.adapter.getChallengeDecision(
          challenger.id,
          challenger.modelId,
          visibleState,
          {
            playerId: currentPlayer.modelId,
            claimedCount: game.pendingTurn.claimedCount,
            claimedRank: game.pendingTurn.claimedRank,
          },
          game.state.experimentId
        );
        console.log(`[step]   Response in ${Date.now() - startTime}ms — ${challengeResponse.challenge ? 'CHALLENGE!' : 'pass'}`);

        if (challengeResponse.challenge) {
          // Challenge happened!
          const correct = game.pendingTurn.wasLie;
          console.log(`[step]   Challenge ${correct ? 'CORRECT (was a lie)' : 'WRONG (was truthful)'}`);
          // Attach challenge token usage
          game.pendingTurn.challengeResponseTimeMs = challengeResponse.responseTimeMs;
          game.pendingTurn.challengeTokenUsage = challengeResponse.tokenUsage;
          processChallenge(game.state, game.pendingTurn, challenger.id, challengeResponse.reasoning);
          advanceTurn(game.state, game.pendingTurn);
          game.pendingTurn = null;
          game.challengeQueue = [];
          game.phase = 'waiting';

          // Check for winner
          const winner = checkWinner(game.state);
          if (winner) {
            const winnerPlayer = game.state.players.find(p => p.id === winner);
            console.log(`[step] 🏆 WINNER: ${winnerPlayer?.modelId} after ${game.state.turns.length} turns`);
            finalizeGame(game.state, winner);
            game.phase = 'finished';
            const log = logger.stateToLog(game.state);
            logger.saveGameLog(log);
          }
        }
        // If no challenge, continue to next potential challenger (loop continues)
      }

      game.lastUpdate = Date.now();
    }

    game.stepInProgress = false;
    sendJSON(res, getFullGameState(game));
  } catch (error) {
    game.stepInProgress = false;
    console.error('[step] ERROR:', error);
    sendJSON(res, { error: 'Step failed', details: String(error) }, 500);
  }
}

// Get current game state
function handleGetGameState(res: http.ServerResponse, gameId: string) {
  const game = activeGames.get(gameId);
  if (!game) {
    sendJSON(res, { error: 'Game not found' }, 404);
    return;
  }
  sendJSON(res, getFullGameState(game));
}

// Auto-play: run until game ends or N steps
async function handleAutoPlay(res: http.ServerResponse, gameId: string, steps: number = 1) {
  const game = activeGames.get(gameId);
  if (!game) {
    sendJSON(res, { error: 'Game not found' }, 404);
    return;
  }

  for (let i = 0; i < steps && game.phase !== 'finished'; i++) {
    await handleNextStepInternal(game);
  }

  sendJSON(res, getFullGameState(game));
}

async function handleNextStepInternal(game: ActiveGame) {
  if (game.phase === 'finished') return;

  if (game.phase === 'waiting') {
    const currentPlayer = getCurrentPlayer(game.state);
    console.log(`[auto] Turn ${game.state.turns.length + 1} — ${currentPlayer.modelId} playing (rank: ${game.state.currentRank})`);

    const visibleState = {
      hand: currentPlayer.hand,
      currentRank: game.state.currentRank,
      pileSize: game.state.pile.length,
      otherPlayersCounts: Object.fromEntries(
        game.state.players
          .filter(p => p.id !== currentPlayer.id && !p.isEliminated)
          .map(p => [p.modelId, p.hand.length])
      ),
      recentTurns: game.state.turns.slice(-5),
    };

    const startTime = Date.now();
    const playResponse = await game.adapter.getPlayDecision(
      currentPlayer.id,
      currentPlayer.modelId,
      visibleState,
      game.state.experimentId
    );
    console.log(`[auto]   Play response in ${Date.now() - startTime}ms`);

    const actualCards: Card[] = [];
    for (const cardStr of playResponse.cards_to_play) {
      const parsed = parseCard(cardStr);
      if (parsed && currentPlayer.hand.some(c => c.rank === parsed.rank && c.suit === parsed.suit)) {
        actualCards.push(parsed);
      }
    }
    if (actualCards.length === 0 && currentPlayer.hand.length > 0) {
      console.log(`[auto]   WARNING: No valid cards parsed, using fallback`);
      actualCards.push(currentPlayer.hand[0]);
    }

    const turn = processPlay(
      game.state,
      currentPlayer.id,
      actualCards,
      playResponse.claim_count || actualCards.length,
      playResponse.reasoning
    );
    turn.playResponseTimeMs = playResponse.responseTimeMs;
    turn.playTokenUsage = playResponse.tokenUsage;
    console.log(`[auto]   ${turn.claimedCount}× ${turn.claimedRank} (${turn.wasLie ? 'LIE' : 'TRUTH'})`);

    game.pendingTurn = turn;
    game.challengeQueue = getOtherPlayers(game.state).map(p => p.id);
    game.phase = 'challenging';
  }

  // Process all challenges
  while (game.phase === 'challenging' && game.pendingTurn && game.challengeQueue.length > 0) {
    const challengerId = game.challengeQueue.shift()!;
    const challenger = game.state.players.find(p => p.id === challengerId)!;
    const currentPlayer = getCurrentPlayer(game.state);

    console.log(`[auto]   Asking ${challenger.modelId} to challenge...`);

    const visibleState = {
      hand: challenger.hand,
      currentRank: game.state.currentRank,
      pileSize: game.state.pile.length - game.pendingTurn.actualCards.length,
      otherPlayersCounts: Object.fromEntries(
        game.state.players
          .filter(p => p.id !== challenger.id && !p.isEliminated)
          .map(p => [p.modelId, p.hand.length])
      ),
      recentTurns: game.state.turns.slice(-5),
    };

    const startTime = Date.now();
    const challengeResponse = await game.adapter.getChallengeDecision(
      challenger.id,
      challenger.modelId,
      visibleState,
      {
        playerId: currentPlayer.modelId,
        claimedCount: game.pendingTurn.claimedCount,
        claimedRank: game.pendingTurn.claimedRank,
      },
      game.state.experimentId
    );
    console.log(`[auto]   Response in ${Date.now() - startTime}ms — ${challengeResponse.challenge ? 'CHALLENGE!' : 'pass'}`);

    if (challengeResponse.challenge) {
      const correct = game.pendingTurn.wasLie;
      console.log(`[auto]   Challenge ${correct ? 'CORRECT' : 'WRONG'}`);
      game.pendingTurn.challengeResponseTimeMs = challengeResponse.responseTimeMs;
      game.pendingTurn.challengeTokenUsage = challengeResponse.tokenUsage;
      processChallenge(game.state, game.pendingTurn, challenger.id, challengeResponse.reasoning);
      game.challengeQueue = [];
      break;
    }
  }

  if (game.phase === 'challenging' && game.pendingTurn) {
    console.log(`[auto]   No challenge — accepted`);
    advanceTurn(game.state, game.pendingTurn);
    game.pendingTurn = null;
    game.phase = 'waiting';

    const winner = checkWinner(game.state);
    if (winner) {
      const winnerPlayer = game.state.players.find(p => p.id === winner);
      console.log(`[auto] 🏆 WINNER: ${winnerPlayer?.modelId} after ${game.state.turns.length} turns`);
      finalizeGame(game.state, winner);
      game.phase = 'finished';
      const log = logger.stateToLog(game.state);
      logger.saveGameLog(log);
    }
  }

  game.lastUpdate = Date.now();
}

function handleGetGames(res: http.ServerResponse) {
  try {
    const games = logger.loadAllLogs().map(g => ({
      gameId: g.gameId,
      experimentId: g.experimentId,
      totalTurns: g.totalTurns,
      winner: g.winner,
    }));
    sendJSON(res, games);
  } catch (e) {
    sendJSON(res, []);
  }
}

function handleGetGame(res: http.ServerResponse, gameId: string) {
  const log = logger.loadGameLog(gameId);
  if (!log) {
    sendJSON(res, { error: 'Game not found' }, 404);
    return;
  }
  sendJSON(res, log);
}

function handleGetStats(res: http.ServerResponse, experiment?: string) {
  try {
    const expId = experiment ? parseInt(experiment) : undefined;
    const games = logger.loadAllLogs(expId);
    const counts = logger.getGameCounts();

    if (games.length === 0) {
      const placeholderStats: Record<string, any> = {};
      MODELS.forEach(m => {
        placeholderStats[m] = {
          gamesPlayed: 0, wins: 0, winRate: 0,
          lieFrequency: 0, lieSuccessRate: 0,
          paranoiaFrequency: 0, challengeAccuracy: 0,
        };
      });
      sendJSON(res, { stats: placeholderStats, counts: { total: 0, 1: 0, 2: 0, 3: 0 } });
      return;
    }

    const stats = calculateAllStats([...MODELS], games, expId);
    const statsObj: Record<string, any> = {};
    stats.forEach((v, k) => statsObj[k] = v);

    sendJSON(res, {
      stats: statsObj,
      counts: { ...counts, total: Object.values(counts).reduce((a, b) => a + b, 0) },
    });
  } catch (e) {
    sendJSON(res, { error: 'Failed to load stats' }, 500);
  }
}

// Request handler
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url || '', true);
  const pathname = parsedUrl.pathname || '/';

  // CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  // API routes
  if (pathname.startsWith('/api/')) {
    const apiPath = pathname.slice(4);

    try {
      if (apiPath === '/game/start' && req.method === 'POST') {
        await handleStartGame(req, res);
      } else if (apiPath.match(/^\/game\/[^/]+\/state$/) && req.method === 'GET') {
        const gameId = apiPath.split('/')[2];
        handleGetGameState(res, gameId);
      } else if (apiPath.match(/^\/game\/[^/]+\/step$/) && req.method === 'POST') {
        const gameId = apiPath.split('/')[2];
        await handleNextStep(res, gameId);
      } else if (apiPath.match(/^\/game\/[^/]+\/auto$/) && req.method === 'POST') {
        const gameId = apiPath.split('/')[2];
        const steps = parseInt(parsedUrl.query.steps as string) || 1;
        await handleAutoPlay(res, gameId, steps);
      } else if (apiPath === '/games' && req.method === 'GET') {
        handleGetGames(res);
      } else if (apiPath.match(/^\/games\/[^/]+$/) && req.method === 'GET') {
        const gameId = apiPath.split('/')[2];
        handleGetGame(res, gameId);
      } else if (apiPath === '/stats' && req.method === 'GET') {
        handleGetStats(res, parsedUrl.query.experiment as string);
      } else {
        sendJSON(res, { error: 'Not found' }, 404);
      }
    } catch (e) {
      console.error('API error:', e);
      sendJSON(res, { error: 'Internal server error' }, 500);
    }
    return;
  }

  // Static files
  let filepath = pathname === '/' ? '/index.html' : pathname;
  filepath = path.join(UI_DIR, filepath);

  if (!filepath.startsWith(UI_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  serveStatic(res, filepath);
});

server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║         🃏 LLM Bullshit - Game Visualizer 🃏          ║
╠═══════════════════════════════════════════════════════╣
║  Server running at http://localhost:${PORT}              ║
║                                                       ║
║  • Watch games play out turn by turn                  ║
║  • See each player's cards                            ║
║  • Read the LLMs' thoughts as they decide             ║
║                                                       ║
║  Mode: ${process.env.FEATHERLESS_API_KEY ? 'Featherless API' : 'Mock LLM'}
╚═══════════════════════════════════════════════════════╝
  `);
});
