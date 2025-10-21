import type { AnalysisResult, GrammarPoint, Summary, VocabItem } from '../core/schema';
import { grammarPointSchema, summarySchema, vocabItemSchema } from '../core/schema';

export interface LLMRequestPayload {
  system: string;
  user: string;
}

export interface LLMProvider {
  readonly id: string;
  readonly label: string;
  summarize(payload: LLMRequestPayload): Promise<Summary>;
  extractGrammar(payload: LLMRequestPayload): Promise<GrammarPoint[]>;
  extractVocab(payload: LLMRequestPayload): Promise<VocabItem[]>;
}

interface OpenAIMessage {
  role: 'system' | 'user';
  content: string;
}

const JSON_HEADERS = {
  'Content-Type': 'application/json',
};

export class OpenAIHTTP implements LLMProvider {
  readonly id = 'openai-http';

  readonly label = 'OpenAI API (브라우저 직접 호출)';

  constructor(private readonly apiKey: string) {}

  private async request({ system, user }: LLMRequestPayload) {
    const messages: OpenAIMessage[] = [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        ...JSON_HEADERS,
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.4,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API 호출에 실패했습니다: ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as { choices: Array<{ message?: { content?: string } }> };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI 응답에 콘텐츠가 없습니다.');
    }
    return JSON.parse(content) as Record<string, unknown>;
  }

  async summarize(payload: LLMRequestPayload) {
    const data = await this.request(payload);
    return summarySchema.parse((data as { summary?: unknown }).summary);
  }

  async extractGrammar(payload: LLMRequestPayload) {
    const data = await this.request(payload);
    const candidate =
      (data as { grammar?: unknown; grammarPoints?: unknown }).grammar
      ?? (data as { grammarPoints?: unknown }).grammarPoints
      ?? data;
    return grammarPointSchema.array().parse(candidate);
  }

  async extractVocab(payload: LLMRequestPayload) {
    const data = await this.request(payload);
    const candidate =
      (data as { vocabulary?: unknown; vocab?: unknown }).vocabulary
      ?? (data as { vocab?: unknown }).vocab
      ?? data;
    return vocabItemSchema.array().parse(candidate);
  }
}

export class LocalMockLLM implements LLMProvider {
  readonly id = 'local-mock';

  readonly label = 'Mock LLM (오프라인 개발용)';

  constructor(private readonly endpoint: string = '/mock/llm') {}

  private async request({ system, user }: LLMRequestPayload) {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ system, user }),
    });

    if (!response.ok) {
      throw new Error(`모의 LLM 호출에 실패했습니다: ${response.status}`);
    }

    return (await response.json()) as AnalysisResult;
  }

  async summarize(payload: LLMRequestPayload) {
    const data = await this.request(payload);
    return summarySchema.parse(data.summary);
  }

  async extractGrammar(payload: LLMRequestPayload) {
    const data = await this.request(payload);
    return grammarPointSchema.array().parse(data.grammar);
  }

  async extractVocab(payload: LLMRequestPayload) {
    const data = await this.request(payload);
    return vocabItemSchema.array().parse(data.vocabulary);
  }
}

export function createLLMProvider(kind: 'openai' | 'mock', apiKey?: string) {
  if (kind === 'openai') {
    if (!apiKey) {
      throw new Error('OpenAI API Key가 필요합니다.');
    }
    return new OpenAIHTTP(apiKey);
  }
  return new LocalMockLLM();
}
