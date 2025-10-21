import { z } from 'zod';

/** Reference to a specific moment in the transcript. */
export const timeRefSchema = z
  .object({
    timestamp: z.string().optional(),
    index: z.number().int().nonnegative().optional(),
  })
  .refine((value) => Boolean(value.timestamp) || value.index !== undefined, {
    message: 'timestamp or index is required',
  });

export type TimeRef = z.infer<typeof timeRefSchema>;

/** Structured summary of a talk with three granularities. */
export const summarySchema = z.object({
  short: z.string().min(1),
  medium: z.string().min(1),
  long: z.string().min(1),
  keyMessages: z
    .array(
      z.object({
        text: z.string().min(1),
        ref: timeRefSchema.optional(),
      }),
    )
    .min(1),
});

export type Summary = z.infer<typeof summarySchema>;

/** Grammar teaching point extracted from the transcript. */
export const grammarPointSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  rule: z.string().min(1),
  examples: z
    .array(
      z.object({
        text: z.string().min(1),
        ref: timeRefSchema.optional(),
      }),
    )
    .min(1),
  related: z.array(z.string().min(1)).optional(),
  difficulty: z.enum(['A2', 'B1', 'B2', 'C1', 'C2']).optional(),
});

export type GrammarPoint = z.infer<typeof grammarPointSchema>;

/** Vocabulary item flagged for explicit teaching. */
export const vocabItemSchema = z.object({
  id: z.string().min(1),
  lemma: z.string().min(1),
  pos: z.string().optional(),
  senseKo: z.string().min(1),
  examples: z
    .array(
      z.object({
        text: z.string().min(1),
        ref: timeRefSchema.optional(),
      }),
    )
    .min(1),
  notes: z.string().optional(),
  frequencyHint: z.enum(['high', 'mid', 'low']).optional(),
  difficulty: z.enum(['A2', 'B1', 'B2', 'C1', 'C2']).optional(),
});

export type VocabItem = z.infer<typeof vocabItemSchema>;

/** Full analysis result including summary, grammar and vocabulary. */
export const analysisResultSchema = z.object({
  summary: summarySchema,
  grammar: z.array(grammarPointSchema),
  vocabulary: z.array(vocabItemSchema),
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;

/**
 * Response variants for partial requests where only one of the analysis slices is returned.
 */
export const summaryOnlySchema = z.object({ summary: summarySchema });
export const grammarOnlySchema = z.object({ grammar: z.array(grammarPointSchema) });
export const vocabOnlySchema = z.object({ vocabulary: z.array(vocabItemSchema) });

export type SummaryOnly = z.infer<typeof summaryOnlySchema>;
export type GrammarOnly = z.infer<typeof grammarOnlySchema>;
export type VocabOnly = z.infer<typeof vocabOnlySchema>;
