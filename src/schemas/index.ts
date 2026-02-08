import { z } from "zod";

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
