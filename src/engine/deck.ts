import { Card, Rank, Suit, RANKS, SUITS } from '../types/game.js';

/**
 * Creates a standard 52-card deck
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

/**
 * Fisher-Yates shuffle with optional seed for reproducibility
 */
export function shuffleDeck(deck: Card[], seed?: number): Card[] {
  const shuffled = [...deck];
  const random = seed !== undefined ? seededRandom(seed) : Math.random;

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Simple seeded random number generator (mulberry32)
 */
function seededRandom(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deals cards evenly to players
 * For 4 players with 52 cards, each gets 13 cards
 */
export function dealCards(deck: Card[], numPlayers: number): Card[][] {
  if (numPlayers < 2 || numPlayers > 8) {
    throw new Error('Number of players must be between 2 and 8');
  }

  const hands: Card[][] = Array.from({ length: numPlayers }, () => []);
  const cardsPerPlayer = Math.floor(deck.length / numPlayers);

  for (let i = 0; i < cardsPerPlayer * numPlayers; i++) {
    hands[i % numPlayers].push(deck[i]);
  }

  return hands;
}

/**
 * Converts a card to string format (e.g., "AS" for Ace of Spades)
 */
export function cardToString(card: Card): string {
  return `${card.rank}${card.suit}`;
}

/**
 * Parses a card string (e.g., "AS") to Card object
 */
export function parseCard(cardStr: string): Card | null {
  const match = cardStr.match(/^(10|[A2-9JQK])([HDCS])$/i);
  if (!match) return null;

  const rank = match[1].toUpperCase() as Rank;
  const suit = match[2].toUpperCase() as Suit;

  if (!RANKS.includes(rank) || !SUITS.includes(suit)) {
    return null;
  }

  return { rank, suit };
}

/**
 * Formats a hand for display in prompts
 */
export function formatHand(hand: Card[]): string {
  return hand.map(cardToString).join(', ');
}

/**
 * Groups cards by rank for strategic analysis
 */
export function groupByRank(cards: Card[]): Map<Rank, Card[]> {
  const groups = new Map<Rank, Card[]>();
  for (const card of cards) {
    const existing = groups.get(card.rank) || [];
    existing.push(card);
    groups.set(card.rank, existing);
  }
  return groups;
}

/**
 * Counts cards of a specific rank in a hand
 */
export function countRank(hand: Card[], rank: Rank): number {
  return hand.filter((card) => card.rank === rank).length;
}
