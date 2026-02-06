// Card types
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
export type Suit = 'H' | 'D' | 'C' | 'S';

export interface Card {
  rank: Rank;
  suit: Suit;
}

// Player types
export interface Player {
  id: string;
  modelId: string;
  hand: Card[];
  isEliminated: boolean;
}

// Turn types
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface Turn {
  turnNumber: number;
  playerId: string;
  claimedRank: Rank;
  claimedCount: number;
  actualCards: Card[];
  wasLie: boolean;
  challenged: boolean;
  challengerId?: string;
  challengeCorrect?: boolean;
  reasoning: string;
  challengeReasoning?: string;
  pileAfterTurn: number;
  handSizesAfterTurn: Record<string, number>;
  playResponseTimeMs?: number;
  playTokenUsage?: TokenUsage;
  challengeResponseTimeMs?: number;
  challengeTokenUsage?: TokenUsage;
}

// Game state types
export type ExperimentId = 1 | 2 | 3;

export interface GameState {
  gameId: string;
  experimentId: ExperimentId;
  players: Player[];
  currentPlayerIndex: number;
  currentRank: Rank;
  pile: Card[];
  turns: Turn[];
  winner: string | null;
  startTime: Date;
  endTime?: Date;
}

// LLM response types
export interface PlayTurnResponse {
  reasoning: string;
  cards_to_play: string[]; // e.g., ["AS", "2H"]
  claim_count: number;
  responseTimeMs?: number;
  tokenUsage?: TokenUsage;
}

export interface ChallengeResponse {
  reasoning: string;
  challenge: boolean;
  responseTimeMs?: number;
  tokenUsage?: TokenUsage;
}

// Metrics types
export interface PlayerStats {
  modelId: string;
  gamesPlayed: number;
  wins: number;
  winRate: number;
  totalPlays: number;
  totalLies: number;
  lieFrequency: number;
  successfulLies: number;
  lieSuccessRate: number;
  challengesMade: number;
  challengeOpportunities: number;
  paranoiaFrequency: number;
  correctChallenges: number;
  challengeAccuracy: number;
  instructionViolations?: number; // For experiment 3
  instructionViolationRate?: number;
}

// Tournament types
export interface Matchup {
  players: string[]; // 4 model IDs
  games: number;
}

export interface TournamentConfig {
  experimentId: ExperimentId;
  models: string[];
  gamesPerMatchup: number;
  outputDir: string;
}

export interface GameLog {
  gameId: string;
  experimentId: ExperimentId;
  players: { id: string; modelId: string }[];
  turns: Turn[];
  winner: string | null;
  totalTurns: number;
  startTime: string;
  endTime: string;
  durationMs: number;
}

// Configuration
export interface FeatherlessConfig {
  apiKey: string;
  baseUrl: string;
  temperature: number;
  seed: number;
  maxRetries: number;
  retryDelayMs: number;
  rateLimitDelayMs: number;
}

export const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
export const SUITS: Suit[] = ['H', 'D', 'C', 'S'];

export const MODELS = [
  'zai-org/GLM-4.7',
  'deepseek-ai/DeepSeek-V3.2',
  'moonshotai/Kimi-K2.5',
  'MiniMaxAI/MiniMax-M2',
  'XiaomiMiMo/MiMo-V2-Flash',
  'openai/gpt-oss-120b',
] as const;

export type ModelId = typeof MODELS[number];
