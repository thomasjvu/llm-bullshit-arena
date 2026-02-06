import { PlayTurnResponse, ChallengeResponse, Card } from '../types/game.js';
import { FeatherlessClient } from './featherless-api.js';
import {
  buildSystemPrompt,
  buildPlayPrompt,
  buildChallengePrompt,
  buildRetryPrompt,
} from './prompt-builder.js';
import {
  parsePlayResponse,
  parseChallengeResponse,
  createFallbackPlayResponse,
  createFallbackChallengeResponse,
} from './response-parser.js';
import { formatHand } from '../engine/deck.js';
import { LLMAdapter } from '../engine/turn-manager.js';
import { Turn, Rank } from '../types/game.js';

interface VisibleState {
  hand: Card[];
  currentRank: Rank;
  pileSize: number;
  otherPlayersCounts: Record<string, number>;
  recentTurns: Turn[];
}

/**
 * Adapter that connects the game engine to the Featherless API
 */
export class FeatherlessLLMAdapter implements LLMAdapter {
  private client: FeatherlessClient;
  private maxRetries: number;

  constructor(client: FeatherlessClient, maxRetries: number = 2) {
    this.client = client;
    this.maxRetries = maxRetries;
  }

  async getPlayDecision(
    playerId: string,
    modelId: string,
    visibleState: VisibleState,
    experimentId: number
  ): Promise<PlayTurnResponse> {
    const systemPrompt = buildSystemPrompt(experimentId as 1 | 2 | 3);
    const userPrompt = buildPlayPrompt(
      visibleState.hand,
      visibleState.currentRank,
      visibleState.pileSize,
      visibleState.otherPlayersCounts,
      visibleState.recentTurns
    );

    let lastResponse = '';
    let lastTruncated = false;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      const prompt = attempt === 0 ? userPrompt : buildRetryPrompt(userPrompt, lastResponse, lastTruncated);

      const result = await this.client.chatCompletion(modelId, [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ]);

      lastResponse = result.content;
      lastTruncated = result.finishReason === 'length';
      const parsed = parsePlayResponse(result.content);

      if (parsed) {
        parsed.responseTimeMs = result.responseTimeMs;
        parsed.tokenUsage = result.tokenUsage;
        return parsed;
      }

      if (lastTruncated) {
        console.warn(`[${modelId}] Response truncated (hit token limit), retrying with brevity hint...`);
      }
    }

    // Fallback: play first card in hand
    console.warn(`[${modelId}] Failed to parse play response, using fallback`);
    return createFallbackPlayResponse(
      visibleState.hand.map((c) => `${c.rank}${c.suit}`),
      visibleState.currentRank
    );
  }

  async getChallengeDecision(
    challengerId: string,
    modelId: string,
    visibleState: VisibleState,
    lastPlay: { playerId: string; claimedCount: number; claimedRank: string },
    experimentId: number
  ): Promise<ChallengeResponse> {
    const systemPrompt = buildSystemPrompt(experimentId as 1 | 2 | 3);
    const userPrompt = buildChallengePrompt(
      visibleState.hand,
      visibleState.currentRank,
      visibleState.pileSize,
      visibleState.otherPlayersCounts,
      lastPlay,
      visibleState.recentTurns
    );

    let lastResponse = '';
    let lastTruncated = false;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      const prompt = attempt === 0 ? userPrompt : buildRetryPrompt(userPrompt, lastResponse, lastTruncated);

      const result = await this.client.chatCompletion(modelId, [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ]);

      lastResponse = result.content;
      lastTruncated = result.finishReason === 'length';
      const parsed = parseChallengeResponse(result.content);

      if (parsed) {
        parsed.responseTimeMs = result.responseTimeMs;
        parsed.tokenUsage = result.tokenUsage;
        return parsed;
      }

      if (lastTruncated) {
        console.warn(`[${modelId}] Response truncated (hit token limit), retrying with brevity hint...`);
      }
    }

    // Fallback: don't challenge
    console.warn(`[${modelId}] Failed to parse challenge response, using fallback`);
    return createFallbackChallengeResponse();
  }
}

/**
 * Mock adapter for testing without API calls
 */
export class MockLLMAdapter implements LLMAdapter {
  private lieChance: number;
  private challengeChance: number;

  constructor(lieChance: number = 0.3, challengeChance: number = 0.2) {
    this.lieChance = lieChance;
    this.challengeChance = challengeChance;
  }

  async getPlayDecision(
    playerId: string,
    modelId: string,
    visibleState: VisibleState,
    experimentId: number
  ): Promise<PlayTurnResponse> {
    const hand = visibleState.hand;
    const requiredRank = visibleState.currentRank;

    // Find cards of the required rank
    const matchingCards = hand.filter((c) => c.rank === requiredRank);

    let cardsToPlay: string[];
    let wasLie = false;

    if (matchingCards.length > 0 && Math.random() > this.lieChance) {
      // Play honest
      cardsToPlay = matchingCards.slice(0, Math.min(matchingCards.length, 2)).map((c) => `${c.rank}${c.suit}`);
    } else {
      // Lie - play random cards
      const randomCard = hand[Math.floor(Math.random() * hand.length)];
      cardsToPlay = [`${randomCard.rank}${randomCard.suit}`];
      wasLie = randomCard.rank !== requiredRank;
    }

    return {
      reasoning: wasLie ? 'Playing a bluff' : 'Playing honestly',
      cards_to_play: cardsToPlay,
      claim_count: cardsToPlay.length,
    };
  }

  async getChallengeDecision(
    challengerId: string,
    modelId: string,
    visibleState: VisibleState,
    lastPlay: { playerId: string; claimedCount: number; claimedRank: string },
    experimentId: number
  ): Promise<ChallengeResponse> {
    // Simple heuristic: challenge more often if claim is large
    const adjustedChance = this.challengeChance + (lastPlay.claimedCount - 1) * 0.1;
    const shouldChallenge = Math.random() < adjustedChance;

    return {
      reasoning: shouldChallenge ? 'Suspicious claim, challenging' : 'Seems reasonable, not challenging',
      challenge: shouldChallenge,
    };
  }
}
