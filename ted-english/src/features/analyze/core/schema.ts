import { z } from 'zod';

export const timeRefSchema = z
  .object({
    timestamp: z.string().optional(),
    index: z.number().int().nonnegative().optional(),
  })
  .refine((value) => Boolean(value.timestamp || typeof value.index === 'number'), {
    message: 'timestamp 또는 index 중 하나는 반드시 포함되어야 합니다.',
  });

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
    .default([]),
});

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

export const analysisResultSchema = z.object({
  summary: summarySchema,
  grammar: z.array(grammarPointSchema),
  vocabulary: z.array(vocabItemSchema),
});

export type TimeRef = z.infer<typeof timeRefSchema>;
export type Summary = z.infer<typeof summarySchema>;
export type GrammarPoint = z.infer<typeof grammarPointSchema>;
export type VocabItem = z.infer<typeof vocabItemSchema>;
export type AnalysisResult = z.infer<typeof analysisResultSchema>;
