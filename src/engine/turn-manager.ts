import { GameState, Turn, Card, PlayTurnResponse, ChallengeResponse } from '../types/game.js';
import {
  getCurrentPlayer,
  getOtherPlayers,
  processPlay,
  processChallenge,
  advanceTurn,
  checkWinner,
  finalizeGame,
  getVisibleState,
} from './game-state.js';
import { parseCard } from './deck.js';

export interface LLMAdapter {
  getPlayDecision(
    playerId: string,
    modelId: string,
    visibleState: ReturnType<typeof getVisibleState>,
    experimentId: number
  ): Promise<PlayTurnResponse>;

  getChallengeDecision(
    challengerId: string,
    modelId: string,
    visibleState: ReturnType<typeof getVisibleState>,
    lastPlay: { playerId: string; claimedCount: number; claimedRank: string },
    experimentId: number
  ): Promise<ChallengeResponse>;
}

export interface TurnManagerConfig {
  maxTurns: number; // Cap to prevent infinite games
  challengeOrder: 'sequential' | 'random';
}

const DEFAULT_CONFIG: TurnManagerConfig = {
  maxTurns: 100,
  challengeOrder: 'sequential',
};

/**
 * Manages the turn flow of a Bullshit game
 */
export class TurnManager {
  private config: TurnManagerConfig;

  constructor(config: Partial<TurnManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Runs a complete game until someone wins or max turns reached
   */
  async runGame(state: GameState, llm: LLMAdapter): Promise<GameState> {
    while (!state.winner && state.turns.length < this.config.maxTurns) {
      await this.executeTurn(state, llm);

      const winner = checkWinner(state);
      if (winner) {
        finalizeGame(state, winner);
        break;
      }
    }

    // Handle draw (max turns reached)
    if (!state.winner) {
      // Winner is player with fewest cards
      const sortedPlayers = [...state.players]
        .filter((p) => !p.isEliminated)
        .sort((a, b) => a.hand.length - b.hand.length);
      finalizeGame(state, sortedPlayers[0].id);
    }

    return state;
  }

  /**
   * Executes a single turn including challenge window
   */
  async executeTurn(state: GameState, llm: LLMAdapter): Promise<Turn> {
    const currentPlayer = getCurrentPlayer(state);
    const visibleState = getVisibleState(state, currentPlayer.id);

    // Get play decision from LLM
    const playResponse = await llm.getPlayDecision(
      currentPlayer.id,
      currentPlayer.modelId,
      visibleState,
      state.experimentId
    );

    // Parse cards from response
    const actualCards = this.parseCardsFromResponse(playResponse.cards_to_play, currentPlayer.hand);

    // Validate play (must play at least 1 card)
    if (actualCards.length === 0) {
      // Force playing one card if LLM fails
      actualCards.push(currentPlayer.hand[0]);
    }

    // Create turn
    const turn = processPlay(state, currentPlayer.id, actualCards, playResponse.claim_count, playResponse.reasoning);

    // Challenge window - each other player gets a chance
    const otherPlayers = getOtherPlayers(state);
    const challengeOrder =
      this.config.challengeOrder === 'random' ? this.shuffleArray(otherPlayers) : otherPlayers;

    for (const challenger of challengeOrder) {
      const challengerVisibleState = getVisibleState(state, challenger.id);

      const challengeResponse = await llm.getChallengeDecision(
        challenger.id,
        challenger.modelId,
        challengerVisibleState,
        {
          playerId: currentPlayer.modelId,
          claimedCount: turn.claimedCount,
          claimedRank: turn.claimedRank,
        },
        state.experimentId
      );

      if (challengeResponse.challenge) {
        processChallenge(state, turn, challenger.id, challengeResponse.reasoning);
        break; // Only one challenge per turn
      }
    }

    advanceTurn(state, turn);
    return turn;
  }

  /**
   * Parses card strings from LLM response, filtering to valid cards in hand
   */
  private parseCardsFromResponse(cardStrings: string[], hand: Card[]): Card[] {
    const cards: Card[] = [];

    for (const cardStr of cardStrings) {
      const parsed = parseCard(cardStr);
      if (parsed) {
        // Check if card is in hand and not already used
        const handIndex = hand.findIndex(
          (c) => c.rank === parsed.rank && c.suit === parsed.suit && !cards.some((used) => used.rank === c.rank && used.suit === c.suit)
        );
        if (handIndex !== -1) {
          cards.push(parsed);
        }
      }
    }

    return cards;
  }

  /**
   * Fisher-Yates shuffle for challenge order randomization
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
