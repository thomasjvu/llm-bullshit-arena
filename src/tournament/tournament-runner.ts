import * as fs from 'fs';
import * as path from 'path';
import { GameState, GameLog, TournamentConfig, ExperimentId, Matchup } from '../types/game.js';
import { createGameState } from '../engine/game-state.js';
import { TurnManager, LLMAdapter } from '../engine/turn-manager.js';
import {
  generateMatchups,
  shuffleSeating,
  generateGameId,
  calculateProgress,
  TournamentProgress,
} from './matchup-generator.js';

interface Checkpoint {
  experimentId: ExperimentId;
  matchupIndex: number;
  gameIndex: number;
  completedGames: string[];
  timestamp: string;
}

/**
 * Orchestrates tournament execution with checkpointing
 */
export class TournamentRunner {
  private config: TournamentConfig;
  private llmAdapter: LLMAdapter;
  private turnManager: TurnManager;
  private checkpointPath: string;
  private logsDir: string;

  constructor(config: TournamentConfig, llmAdapter: LLMAdapter) {
    this.config = config;
    this.llmAdapter = llmAdapter;
    this.turnManager = new TurnManager({ maxTurns: 100 });
    this.logsDir = path.join(config.outputDir, 'games');
    this.checkpointPath = path.join(config.outputDir, `checkpoint_exp${config.experimentId}.json`);

    // Ensure directories exist
    fs.mkdirSync(this.logsDir, { recursive: true });
  }

  /**
   * Runs the full tournament with checkpoint/resume support
   */
  async run(onProgress?: (progress: TournamentProgress) => void): Promise<void> {
    const matchups = generateMatchups(this.config.models, this.config.gamesPerMatchup);
    const checkpoint = this.loadCheckpoint();

    let startMatchup = checkpoint?.matchupIndex || 0;
    let startGame = checkpoint?.gameIndex || 0;

    console.log(`Starting experiment ${this.config.experimentId}`);
    console.log(`Total matchups: ${matchups.length}`);
    console.log(`Games per matchup: ${this.config.gamesPerMatchup}`);
    console.log(`Total games: ${matchups.length * this.config.gamesPerMatchup}`);

    if (checkpoint) {
      console.log(`Resuming from matchup ${startMatchup}, game ${startGame}`);
    }

    for (let m = startMatchup; m < matchups.length; m++) {
      const matchup = matchups[m];
      const gameStart = m === startMatchup ? startGame : 0;

      for (let g = gameStart; g < matchup.games; g++) {
        const gameId = generateGameId(this.config.experimentId, m, g);

        try {
          const gameLog = await this.runSingleGame(matchup, gameId);
          this.saveGameLog(gameLog);

          // Update checkpoint
          this.saveCheckpoint({
            experimentId: this.config.experimentId,
            matchupIndex: m,
            gameIndex: g + 1,
            completedGames: [...(checkpoint?.completedGames || []), gameId],
            timestamp: new Date().toISOString(),
          });

          // Report progress
          if (onProgress) {
            const progress = calculateProgress(m, g + 1, matchups.length, this.config.gamesPerMatchup);
            onProgress(progress);
          }

          console.log(
            `Game ${gameId} completed. Winner: ${gameLog.winner}. ` +
              `Turns: ${gameLog.totalTurns}. Progress: ${((m * matchup.games + g + 1) / (matchups.length * matchup.games) * 100).toFixed(1)}%`
          );
        } catch (error) {
          console.error(`Error in game ${gameId}:`, error);
          // Continue to next game
        }
      }
    }

    console.log(`Experiment ${this.config.experimentId} completed!`);
  }

  /**
   * Runs a single game
   */
  async runSingleGame(matchup: Matchup, gameId: string): Promise<GameLog> {
    // Randomize seating order
    const players = shuffleSeating(matchup.players);

    // Create game state
    const seed = hashString(gameId);
    const state = createGameState(gameId, this.config.experimentId, players, seed);

    // Run the game
    const startTime = Date.now();
    const finalState = await this.turnManager.runGame(state, this.llmAdapter);
    const endTime = Date.now();

    // Convert to log format
    return this.stateToLog(finalState, startTime, endTime);
  }

  /**
   * Converts game state to log format
   */
  private stateToLog(state: GameState, startTime: number, endTime: number): GameLog {
    return {
      gameId: state.gameId,
      experimentId: state.experimentId,
      players: state.players.map((p) => ({ id: p.id, modelId: p.modelId })),
      turns: state.turns,
      winner: state.winner,
      totalTurns: state.turns.length,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      durationMs: endTime - startTime,
    };
  }

  /**
   * Saves a game log to disk
   */
  private saveGameLog(log: GameLog): void {
    const filename = `${log.gameId}.json`;
    const filepath = path.join(this.logsDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(log, null, 2));
  }

  /**
   * Loads checkpoint if it exists
   */
  private loadCheckpoint(): Checkpoint | null {
    if (fs.existsSync(this.checkpointPath)) {
      const data = fs.readFileSync(this.checkpointPath, 'utf-8');
      return JSON.parse(data);
    }
    return null;
  }

  /**
   * Saves checkpoint to disk
   */
  private saveCheckpoint(checkpoint: Checkpoint): void {
    fs.writeFileSync(this.checkpointPath, JSON.stringify(checkpoint, null, 2));
  }
}

/**
 * Simple hash function for seeding
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}
