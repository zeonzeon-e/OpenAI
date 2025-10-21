import { TranscriptChunk } from '../core/chunk';
import {
  Summary,
  GrammarPoint,
  VocabItem,
  summaryOnlySchema,
  grammarOnlySchema,
  vocabOnlySchema,
} from '../core/schema';
import { buildSummaryPrompt, buildGrammarPrompt, buildVocabPrompt, getSystemPrompt } from '../core/prompt';

export type LLMTaskResult<T> = {
  success: boolean;
  data?: T;
  error?: Error;
  raw?: string;
};

export interface LLMProvider {
  summarize(chunks: TranscriptChunk[]): Promise<LLMTaskResult<Summary>>;
  extractGrammar(chunks: TranscriptChunk[]): Promise<LLMTaskResult<GrammarPoint[]>>;
  extractVocabulary(chunks: TranscriptChunk[]): Promise<LLMTaskResult<VocabItem[]>>;
}

const SAFE_MODEL = 'gpt-4o-mini';

const parseJson = <T>(payload: string, schema: { parse: (value: unknown) => T }): T => schema.parse(JSON.parse(payload));

const executeWithRetry = async <T>(fn: () => Promise<LLMTaskResult<T>>): Promise<LLMTaskResult<T>> => {
  const first = await fn();
  if (first.success) return first;
  const second = await fn();
  if (!second.success && !second.error && first.error) {
    return first;
  }
  return second;
};

const createStableId = (prefix: string, index: number) => `${prefix}-${index}`;

export class LocalMockLLM implements LLMProvider {
  async summarize(chunks: TranscriptChunk[]): Promise<LLMTaskResult<Summary>> {
    const base = chunks.map((chunk) => chunk.text).join(' ') || 'a TED talk about possibility';
    const keyMessages = chunks.slice(0, 4).map((chunk) => ({
      text: chunk.segments[0]?.text ?? '핵심 메시지',
      ref: {
        timestamp: chunk.segments[0]?.timestamp,
        index: chunk.segments[0]?.index,
      },
    }));
    if (keyMessages.length === 0) {
      keyMessages.push({
        text: '연사의 이야기를 통해 변화의 계기를 찾을 수 있습니다.',
        ref: { timestamp: undefined, index: 0 },
      });
    }
    const summary: Summary = {
      short: `이 강연은 ${base.slice(0, 60)}... 에 관한 내용입니다.`,
      medium: `${base.slice(0, 120)}... 에 대해 연사가 자신의 경험을 공유합니다.`,
      long: `${base.slice(0, 240)}... 청중에게 실천 가능한 교훈을 제공합니다.`,
      keyMessages,
    };
    return { success: true, data: summary };
  }

  async extractGrammar(chunks: TranscriptChunk[]): Promise<LLMTaskResult<GrammarPoint[]>> {
    const grammar: GrammarPoint[] = chunks.slice(0, 3).map((chunk, index) => ({
      id: createStableId('grammar', index),
      name: 'Conditional Type 2',
      rule: '과거 시제 if 절 + would/could + 동사원형 (가정법 과거).',
      examples: [
        {
          text: chunk.segments[0]?.text ?? 'If I were you, I would watch this talk twice.',
          ref: {
            timestamp: chunk.segments[0]?.timestamp,
            index: chunk.segments[0]?.index,
          },
        },
      ],
      related: ['modal would'],
      difficulty: 'B2',
    }));
    return { success: true, data: grammar };
  }

  async extractVocabulary(chunks: TranscriptChunk[]): Promise<LLMTaskResult<VocabItem[]>> {
    const vocabulary: VocabItem[] = chunks.slice(0, 5).map((chunk, index) => ({
      id: createStableId('vocab', index),
      lemma: chunk.segments[0]?.text.split(' ')[0] ?? 'resilience',
      pos: 'n.',
      senseKo: '회복력, 탄성',
      examples: [
        {
          text: chunk.segments[0]?.text ?? 'Resilience helps speakers recover from mistakes.',
          ref: {
            timestamp: chunk.segments[0]?.timestamp,
            index: chunk.segments[0]?.index,
          },
        },
      ],
      notes: '연설에서 강조되는 핵심 가치.',
      frequencyHint: 'mid',
      difficulty: 'B2',
    }));
    return { success: true, data: vocabulary };
  }
}

export type OpenAIProviderConfig = {
  apiKey: string;
  model?: string;
  temperature?: number;
};

const openAiHeaders = (apiKey: string) => ({
  Authorization: `Bearer ${apiKey}`,
  'Content-Type': 'application/json',
});

const callOpenAI = async (
  apiKey: string,
  messages: Array<{ role: 'system' | 'user'; content: string }>,
  config: OpenAIProviderConfig,
) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: openAiHeaders(apiKey),
    body: JSON.stringify({
      model: config.model ?? SAFE_MODEL,
      temperature: config.temperature ?? 0.2,
      response_format: { type: 'json_object' },
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed (${response.status})`);
  }

  const payload = await response.json();
  const text = payload.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('Empty completion from OpenAI API');
  }

  return text as string;
};

export class OpenAIHTTP implements LLMProvider {
  constructor(private readonly config: OpenAIProviderConfig) {}

  summarize(chunks: TranscriptChunk[]): Promise<LLMTaskResult<Summary>> {
    return executeWithRetry(async () => {
      try {
        const messages = [
          { role: 'system' as const, content: getSystemPrompt() },
          { role: 'user' as const, content: buildSummaryPrompt(chunks) },
        ];
        const responseText = await callOpenAI(this.config.apiKey, messages, this.config);
        try {
          const summary = parseJson(responseText, summaryOnlySchema).summary;
          return { success: true, data: summary };
        } catch (parseError) {
          return { success: false, error: parseError as Error, raw: responseText };
        }
      } catch (error) {
        return { success: false, error: error as Error };
      }
    });
  }

  extractGrammar(chunks: TranscriptChunk[]): Promise<LLMTaskResult<GrammarPoint[]>> {
    return executeWithRetry(async () => {
      try {
        const messages = [
          { role: 'system' as const, content: getSystemPrompt() },
          { role: 'user' as const, content: buildGrammarPrompt(chunks) },
        ];
        const responseText = await callOpenAI(this.config.apiKey, messages, this.config);
        try {
          const grammar = parseJson(responseText, grammarOnlySchema).grammar;
          return { success: true, data: grammar };
        } catch (parseError) {
          return { success: false, error: parseError as Error, raw: responseText };
        }
      } catch (error) {
        return { success: false, error: error as Error };
      }
    });
  }

  extractVocabulary(chunks: TranscriptChunk[]): Promise<LLMTaskResult<VocabItem[]>> {
    return executeWithRetry(async () => {
      try {
        const messages = [
          { role: 'system' as const, content: getSystemPrompt() },
          { role: 'user' as const, content: buildVocabPrompt(chunks) },
        ];
        const responseText = await callOpenAI(this.config.apiKey, messages, this.config);
        try {
          const vocabulary = parseJson(responseText, vocabOnlySchema).vocabulary;
          return { success: true, data: vocabulary };
        } catch (parseError) {
          return { success: false, error: parseError as Error, raw: responseText };
        }
      } catch (error) {
        return { success: false, error: error as Error };
      }
    });
  }
}

export const createLLMProvider = (mode: 'mock' | 'openai', config?: OpenAIProviderConfig): LLMProvider => {
  if (mode === 'openai') {
    if (!config?.apiKey) {
      throw new Error('OpenAI API key is required for OpenAI provider.');
    }
    return new OpenAIHTTP(config);
  }
  return new LocalMockLLM();
};
