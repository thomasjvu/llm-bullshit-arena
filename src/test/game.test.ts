import { describe, it, expect, beforeEach } from 'vitest';
import { createDeck, shuffleDeck, dealCards, parseCard, cardToString, countRank } from '../engine/deck.js';
import {
  createGameState,
  getNextRank,
  getCurrentPlayer,
  processPlay,
  processChallenge,
  checkWinner,
} from '../engine/game-state.js';
import { combinations, generateMatchups } from '../tournament/matchup-generator.js';
import { calculatePlayerStats, calculateParanoia } from '../metrics/player-stats.js';
import { parsePlayResponse, parseChallengeResponse, extractJSON } from '../llm/response-parser.js';
import { RANKS, Card, GameLog, Turn } from '../types/game.js';

describe('Deck', () => {
  it('should create a 52-card deck', () => {
    const deck = createDeck();
    expect(deck.length).toBe(52);
  });

  it('should have 4 of each rank', () => {
    const deck = createDeck();
    for (const rank of RANKS) {
      const count = deck.filter((c) => c.rank === rank).length;
      expect(count).toBe(4);
    }
  });

  it('should shuffle deterministically with seed', () => {
    const deck1 = shuffleDeck(createDeck(), 42);
    const deck2 = shuffleDeck(createDeck(), 42);
    expect(deck1).toEqual(deck2);
  });

  it('should shuffle differently with different seeds', () => {
    const deck1 = shuffleDeck(createDeck(), 42);
    const deck2 = shuffleDeck(createDeck(), 123);
    expect(deck1).not.toEqual(deck2);
  });

  it('should deal 13 cards to 4 players', () => {
    const deck = createDeck();
    const hands = dealCards(deck, 4);

    expect(hands.length).toBe(4);
    for (const hand of hands) {
      expect(hand.length).toBe(13);
    }
  });

  it('should parse card strings correctly', () => {
    expect(parseCard('AS')).toEqual({ rank: 'A', suit: 'S' });
    expect(parseCard('10H')).toEqual({ rank: '10', suit: 'H' });
    expect(parseCard('KD')).toEqual({ rank: 'K', suit: 'D' });
    expect(parseCard('invalid')).toBeNull();
  });

  it('should convert cards to strings', () => {
    expect(cardToString({ rank: 'A', suit: 'S' })).toBe('AS');
    expect(cardToString({ rank: '10', suit: 'H' })).toBe('10H');
  });

  it('should count cards of a rank', () => {
    const hand: Card[] = [
      { rank: 'A', suit: 'S' },
      { rank: 'A', suit: 'H' },
      { rank: 'K', suit: 'D' },
    ];
    expect(countRank(hand, 'A')).toBe(2);
    expect(countRank(hand, 'K')).toBe(1);
    expect(countRank(hand, 'Q')).toBe(0);
  });
});

describe('GameState', () => {
  it('should create game state with 4 players', () => {
    const models = ['model1', 'model2', 'model3', 'model4'];
    const state = createGameState('test-game', 1, models);

    expect(state.players.length).toBe(4);
    expect(state.currentRank).toBe('A');
    expect(state.pile.length).toBe(0);
    expect(state.winner).toBeNull();
  });

  it('should deal 13 cards to each player', () => {
    const models = ['model1', 'model2', 'model3', 'model4'];
    const state = createGameState('test-game', 1, models);

    for (const player of state.players) {
      expect(player.hand.length).toBe(13);
    }
  });

  it('should cycle ranks correctly', () => {
    expect(getNextRank('A')).toBe('2');
    expect(getNextRank('K')).toBe('A');
    expect(getNextRank('10')).toBe('J');
  });

  it('should detect win when hand is empty', () => {
    const models = ['model1', 'model2', 'model3', 'model4'];
    const state = createGameState('test-game', 1, models);

    // Manually empty a player's hand
    state.players[0].hand = [];

    const winner = checkWinner(state);
    expect(winner).toBe('player_0');
  });

  it('should process a play correctly', () => {
    const models = ['model1', 'model2', 'model3', 'model4'];
    const state = createGameState('test-game', 1, models, 42);

    const player = getCurrentPlayer(state);
    const cardToPlay = player.hand[0];
    const initialHandSize = player.hand.length;

    const turn = processPlay(state, player.id, [cardToPlay], 1, 'Test reasoning');

    expect(player.hand.length).toBe(initialHandSize - 1);
    expect(state.pile.length).toBe(1);
    expect(turn.actualCards).toContainEqual(cardToPlay);
  });

  it('should resolve challenge correctly when player lied', () => {
    const models = ['model1', 'model2', 'model3', 'model4'];
    const state = createGameState('test-game', 1, models, 42);

    // Play a card that doesn't match current rank (force a lie)
    const player = state.players[0];
    const wrongCard = player.hand.find((c) => c.rank !== state.currentRank);

    if (wrongCard) {
      const turn = processPlay(state, player.id, [wrongCard], 1, 'Lying');
      expect(turn.wasLie).toBe(true);

      const challenger = state.players[1];
      const pileSize = state.pile.length;

      processChallenge(state, turn, challenger.id, 'Calling bullshit');

      expect(turn.challenged).toBe(true);
      expect(turn.challengeCorrect).toBe(true);
      // Liar picks up pile
      expect(player.hand.length).toBeGreaterThan(12);
      expect(state.pile.length).toBe(0);
    }
  });
});

describe('Matchup Generator', () => {
  it('should generate correct number of combinations', () => {
    const items = [1, 2, 3, 4, 5];
    const combs = combinations(items, 2);
    // C(5,2) = 10
    expect(combs.length).toBe(10);
  });

  it('should generate 210 matchups for 10 models', () => {
    const models = Array.from({ length: 10 }, (_, i) => `model${i}`);
    const matchups = generateMatchups(models, 1);
    // C(10,4) = 210
    expect(matchups.length).toBe(210);
  });

  it('should include all 4 models in each matchup', () => {
    const models = ['a', 'b', 'c', 'd', 'e'];
    const matchups = generateMatchups(models, 5);

    for (const matchup of matchups) {
      expect(matchup.players.length).toBe(4);
      expect(matchup.games).toBe(5);
    }
  });
});

describe('Response Parser', () => {
  it('should extract JSON from code fence', () => {
    const response = 'Here is my response:\n```json\n{"key": "value"}\n```';
    const json = extractJSON(response);
    expect(json).toBe('{"key": "value"}');
  });

  it('should extract raw JSON', () => {
    const response = 'Some text {"key": "value"} more text';
    const json = extractJSON(response);
    expect(json).toBe('{"key": "value"}');
  });

  it('should parse play response', () => {
    const response = '{"reasoning": "Test", "cards_to_play": ["AS", "AH"], "claim_count": 2}';
    const parsed = parsePlayResponse(response);

    expect(parsed).not.toBeNull();
    expect(parsed?.reasoning).toBe('Test');
    expect(parsed?.cards_to_play).toEqual(['AS', 'AH']);
    expect(parsed?.claim_count).toBe(2);
  });

  it('should parse challenge response', () => {
    const response = '{"reasoning": "Suspicious", "challenge": true}';
    const parsed = parseChallengeResponse(response);

    expect(parsed).not.toBeNull();
    expect(parsed?.reasoning).toBe('Suspicious');
    expect(parsed?.challenge).toBe(true);
  });

  it('should handle malformed JSON gracefully', () => {
    const response = 'Not valid JSON at all';
    expect(parsePlayResponse(response)).toBeNull();
    expect(parseChallengeResponse(response)).toBeNull();
  });
});

describe('Metrics', () => {
  const mockGameLog: GameLog = {
    gameId: 'test-game',
    experimentId: 1,
    players: [
      { id: 'player_0', modelId: 'model-a' },
      { id: 'player_1', modelId: 'model-b' },
      { id: 'player_2', modelId: 'model-c' },
      { id: 'player_3', modelId: 'model-d' },
    ],
    turns: [
      {
        turnNumber: 1,
        playerId: 'player_0',
        claimedRank: 'A',
        claimedCount: 2,
        actualCards: [{ rank: 'A', suit: 'S' }, { rank: 'K', suit: 'H' }],
        wasLie: true,
        challenged: false,
        reasoning: 'Test',
        pileAfterTurn: 2,
        handSizesAfterTurn: {},
      },
      {
        turnNumber: 2,
        playerId: 'player_1',
        claimedRank: '2',
        claimedCount: 1,
        actualCards: [{ rank: '2', suit: 'D' }],
        wasLie: false,
        challenged: true,
        challengerId: 'player_0',
        challengeCorrect: false,
        reasoning: 'Test',
        pileAfterTurn: 3,
        handSizesAfterTurn: {},
      },
    ],
    winner: 'player_0',
    totalTurns: 2,
    startTime: '2024-01-01T00:00:00Z',
    endTime: '2024-01-01T00:01:00Z',
    durationMs: 60000,
  };

  it('should calculate player stats correctly', () => {
    const stats = calculatePlayerStats('model-a', [mockGameLog]);

    expect(stats.gamesPlayed).toBe(1);
    expect(stats.wins).toBe(1);
    expect(stats.winRate).toBe(1);
    expect(stats.totalPlays).toBe(1);
    expect(stats.totalLies).toBe(1);
    expect(stats.lieFrequency).toBe(1);
    expect(stats.challengesMade).toBe(1);
    expect(stats.correctChallenges).toBe(0);
  });

  it('should calculate paranoia correctly', () => {
    const paranoia = calculateParanoia('model-a', [mockGameLog]);

    // model-a had 1 opportunity to challenge (turn 2) and did challenge
    expect(paranoia).toBe(1);
  });

  it('should handle models with no games', () => {
    const stats = calculatePlayerStats('model-unknown', [mockGameLog]);

    expect(stats.gamesPlayed).toBe(0);
    expect(stats.winRate).toBe(0);
    expect(stats.lieFrequency).toBe(0);
  });
});
