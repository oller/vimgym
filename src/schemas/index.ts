import { z } from "zod";
import type { TablesInsert } from "../types/database";

// Input schemas
export const levelCompletionInputSchema = z.object({
  userId: z.uuid({ version: "v4" }),
  level: z.string().min(1),
  score: z.number().int().min(1),
  keystrokes: z.array(z.string()).min(1),
});

export const playerDashboardSchema = z.record(
  z.string(), // key is level id as string
  z.object({
    user: z.object({
      best: z.number().nullable(),
      percentile: z.number().nullable(),
    }),
    global: z.object({
      best: z.number().nullable(),
      average: z.number().nullable(),
      completions: z.number().nullable(),
      best_score_log: z.array(z.string()).nullable(),
    }),
  }),
);

// Derived types (single source of truth)
export type LevelCompletionInput = z.infer<typeof levelCompletionInputSchema>;
export type PlayerDashboard = z.infer<typeof playerDashboardSchema>;

export const levelCompletionDbInsertSchema = z.object({
  completed_at: z.string().nullable().optional(),
  id: z.string().optional(),
  keystrokes: z.array(z.string()),
  keystrokes_count: z.number(),
  level_id: z.string(),
  user_id: z.string().nullable().optional(),
}) satisfies z.ZodType<TablesInsert<"level_completions">>;
