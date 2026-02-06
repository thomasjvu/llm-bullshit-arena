import { PlayTurnResponse, ChallengeResponse } from '../types/game.js';

/**
 * Extracts content from <think>...</think> blocks (for preserving in reasoning)
 */
export function extractThinkContent(response: string): string {
  const matches: string[] = [];
  const regex = /<think>([\s\S]*?)<\/think>/gi;
  let match;
  while ((match = regex.exec(response)) !== null) {
    matches.push(match[1].trim());
  }
  return matches.join('\n');
}

/**
 * Strips <think>...</think> reasoning blocks for JSON extraction
 */
function stripThinkBlocks(response: string): string {
  return response.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
}

/**
 * Extracts JSON from a potentially messy LLM response
 */
export function extractJSON(response: string): string | null {
  // Strip thinking blocks first — models like DeepSeek/Kimi emit these
  const cleaned = stripThinkBlocks(response);

  // Try to find JSON block in code fence
  const codeFenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeFenceMatch) {
    return codeFenceMatch[1].trim();
  }

  // Try to find raw JSON object
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }

  // If the cleaned version failed, try the raw response too
  // (in case <think> tag was unclosed / malformed)
  if (cleaned !== response) {
    const rawMatch = response.match(/\{[\s\S]*\}/);
    if (rawMatch) {
      return rawMatch[0];
    }
  }

  return null;
}

/**
 * Parses a play turn response from LLM output
 */
export function parsePlayResponse(response: string): PlayTurnResponse | null {
  try {
    const jsonStr = extractJSON(response);
    if (!jsonStr) return null;

    const parsed = JSON.parse(jsonStr);

    // Validate required fields
    if (typeof parsed.reasoning !== 'string') {
      parsed.reasoning = 'No reasoning provided';
    }

    if (!Array.isArray(parsed.cards_to_play)) {
      return null;
    }

    // Normalize card strings
    parsed.cards_to_play = parsed.cards_to_play
      .map((card: unknown) => normalizeCardString(String(card)))
      .filter((card: string | null) => card !== null);

    if (parsed.cards_to_play.length === 0) {
      return null;
    }

    if (typeof parsed.claim_count !== 'number') {
      parsed.claim_count = parsed.cards_to_play.length;
    }

    // Preserve <think> content as part of reasoning for research data
    const thinkContent = extractThinkContent(response);
    const fullReasoning = thinkContent
      ? `[think] ${thinkContent}\n[answer] ${parsed.reasoning}`
      : parsed.reasoning;

    return {
      reasoning: fullReasoning,
      cards_to_play: parsed.cards_to_play,
      claim_count: parsed.claim_count,
    };
  } catch {
    return null;
  }
}

/**
 * Parses a challenge response from LLM output
 */
export function parseChallengeResponse(response: string): ChallengeResponse | null {
  try {
    const jsonStr = extractJSON(response);
    if (!jsonStr) return null;

    const parsed = JSON.parse(jsonStr);

    // Validate required fields
    if (typeof parsed.reasoning !== 'string') {
      parsed.reasoning = 'No reasoning provided';
    }

    if (typeof parsed.challenge !== 'boolean') {
      // Try to infer from string
      if (typeof parsed.challenge === 'string') {
        parsed.challenge = parsed.challenge.toLowerCase() === 'true';
      } else {
        return null;
      }
    }

    // Preserve <think> content as part of reasoning for research data
    const thinkContent = extractThinkContent(response);
    const fullReasoning = thinkContent
      ? `[think] ${thinkContent}\n[answer] ${parsed.reasoning}`
      : parsed.reasoning;

    return {
      reasoning: fullReasoning,
      challenge: parsed.challenge,
    };
  } catch {
    return null;
  }
}

/**
 * Normalizes card string formats (handles various LLM outputs)
 */
function normalizeCardString(card: string): string | null {
  // Remove whitespace
  card = card.trim().toUpperCase();

  // Handle formats like "ACE OF SPADES" -> "AS"
  const wordPatterns: Record<string, string> = {
    ACE: 'A',
    TWO: '2',
    THREE: '3',
    FOUR: '4',
    FIVE: '5',
    SIX: '6',
    SEVEN: '7',
    EIGHT: '8',
    NINE: '9',
    TEN: '10',
    JACK: 'J',
    QUEEN: 'Q',
    KING: 'K',
    SPADES: 'S',
    HEARTS: 'H',
    DIAMONDS: 'D',
    CLUBS: 'C',
    SPADE: 'S',
    HEART: 'H',
    DIAMOND: 'D',
    CLUB: 'C',
  };

  // Check for word format
  for (const [word, abbrev] of Object.entries(wordPatterns)) {
    if (card.includes(word)) {
      card = card.replace(word, abbrev);
    }
  }

  // Remove "OF" and extra spaces
  card = card.replace(/\s+OF\s+/g, '').replace(/\s+/g, '');

  // Validate final format: should be like "AS", "10H", "KD"
  const match = card.match(/^(10|[A2-9JQK])([HDCS])$/);
  if (match) {
    return card;
  }

  // Handle reversed format like "SA" -> "AS"
  const reversedMatch = card.match(/^([HDCS])(10|[A2-9JQK])$/);
  if (reversedMatch) {
    return `${reversedMatch[2]}${reversedMatch[1]}`;
  }

  return null;
}

