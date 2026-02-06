import { FeatherlessConfig, TokenUsage } from '../types/game.js';

export interface ChatCompletionResult {
  content: string;
  tokenUsage: TokenUsage;
  responseTimeMs: number;
  finishReason: string; // 'stop' = natural end, 'length' = hit token limit
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const DEFAULT_CONFIG: FeatherlessConfig = {
  apiKey: process.env.FEATHERLESS_API_KEY || '',
  baseUrl: 'https://api.featherless.ai/v1',
  temperature: 0,
  seed: 42,
  maxRetries: 5,
  retryDelayMs: 2000,
  rateLimitDelayMs: 3000,
};

/**
 * Client for the Featherless AI API
 */
export class FeatherlessClient {
  private config: FeatherlessConfig;
  private lastRequestTime: number = 0;

  constructor(config: Partial<FeatherlessConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    if (!this.config.apiKey) {
      throw new Error('FEATHERLESS_API_KEY environment variable is required');
    }
  }

  /**
   * Sends a chat completion request with rate limiting and retries
   */
  async chatCompletion(
    modelId: string,
    messages: ChatMessage[],
    maxTokens: number = 2048
  ): Promise<ChatCompletionResult> {
    await this.enforceRateLimit();

    let lastError: Error | null = null;
    const overallStart = Date.now();

    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`[api] Retry ${attempt}/${this.config.maxRetries - 1} for ${modelId}`);
        }
        console.log(`[api] POST ${modelId} (${messages.length} messages, max_tokens=${maxTokens})`);
        const t0 = Date.now();

        const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify({
            model: modelId,
            messages,
            temperature: this.config.temperature,
            seed: this.config.seed,
            max_tokens: maxTokens,
          }),
          signal: AbortSignal.timeout(180_000), // 3 minute timeout per request
        });

        if (!response.ok) {
          const errorBody = await response.text();
          const shortError = errorBody.substring(0, 200).replace(/<[^>]*>/g, '').trim();
          console.error(`[api] HTTP ${response.status} from ${modelId} (${Date.now() - t0}ms): ${shortError}`);

          // Rate limited — wait longer, Featherless concurrency limits need cooldown
          if (response.status === 429) {
            const retryAfter = Math.max(parseInt(response.headers.get('Retry-After') || '10', 10), 10);
            console.log(`[api] Rate limited, waiting ${retryAfter}s...`);
            await this.sleep(retryAfter * 1000);
            continue;
          }

          // Gateway timeout / bad gateway — server-side issue, retry with backoff
          if (response.status === 502 || response.status === 504) {
            const backoff = this.config.retryDelayMs * Math.pow(2, attempt) + Math.random() * 2000;
            console.log(`[api] Gateway error ${response.status}, waiting ${(backoff / 1000).toFixed(1)}s before retry...`);
            await this.sleep(backoff);
            continue;
          }

          throw new Error(`API error ${response.status}: ${shortError}`);
        }

        const data = (await response.json()) as ChatCompletionResponse;

        if (!data.choices || data.choices.length === 0) {
          console.error(`[api] Empty choices from ${modelId} (${Date.now() - t0}ms)`);
          throw new Error('No choices in response');
        }

        const content = data.choices[0].message.content;
        const finishReason = data.choices[0].finish_reason || 'stop';
        const usage: TokenUsage = data.usage
          ? { promptTokens: data.usage.prompt_tokens, completionTokens: data.usage.completion_tokens, totalTokens: data.usage.total_tokens }
          : { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
        const tokens = data.usage ? `${data.usage.prompt_tokens}+${data.usage.completion_tokens} tokens` : 'no usage info';
        const truncated = finishReason === 'length' ? ' [TRUNCATED]' : '';
        console.log(`[api] OK ${modelId} (${Date.now() - t0}ms, ${tokens}${truncated}) — ${content.substring(0, 80).replace(/\n/g, ' ')}...`);
        return { content, tokenUsage: usage, responseTimeMs: Date.now() - overallStart, finishReason };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const msg = lastError.message.substring(0, 150);
        const isTerminated = msg.includes('terminated');
        const isTimeout = lastError.name === 'TimeoutError' || msg.includes('abort');

        if (isTerminated) {
          console.error(`[api] Connection terminated for ${modelId} — server likely killed long-running inference`);
        } else if (isTimeout) {
          console.error(`[api] Request timed out for ${modelId} (180s limit)`);
        } else {
          console.error(`[api] Error for ${modelId}: ${msg}`);
        }

        if (attempt < this.config.maxRetries - 1) {
          // Terminated/timeout = server overloaded, wait longer
          const baseBackoff = (isTerminated || isTimeout)
            ? 15_000 + Math.random() * 5000
            : this.config.retryDelayMs * Math.pow(2, attempt) + Math.random() * 1000;
          console.log(`[api] Waiting ${(baseBackoff / 1000).toFixed(1)}s before retry...`);
          await this.sleep(baseBackoff);
        }
      }
    }

    console.error(`[api] FAILED after ${this.config.maxRetries} attempts for ${modelId}`);
    throw lastError || new Error('Request failed after retries');
  }

  /**
   * Enforces rate limiting between requests
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.config.rateLimitDelayMs) {
      await this.sleep(this.config.rateLimitDelayMs - timeSinceLastRequest);
    }

    this.lastRequestTime = Date.now();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Creates a configured Featherless client
 */
export function createFeatherlessClient(apiKey?: string): FeatherlessClient {
  return new FeatherlessClient({
    apiKey: apiKey || process.env.FEATHERLESS_API_KEY,
  });
}
