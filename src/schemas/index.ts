import { z } from "zod";

// Input schemas
export const levelCompletionInputSchema = z.object({
  userId: z.string().uuid(),
  level: z.number().int().min(1).max(19),
  score: z.number().int().min(1),
  keystrokes: z.array(z.string()).min(1),
});

// Database response schemas (validate untrusted API data)
export const allLevelStatsSchema = z.record(
  z.string(), // key is level id as string
  z.object({
    level: z.number(),
    totalCompletions: z.number(),
    avgKeystrokes: z.number(),
    bestScore: z.number(),
  }),
);

export const userBestScoresSchema = z.record(
  z.string(), // key is level id as string
  z.number(), // value is best score
);

// Derived types (single source of truth)
export type LevelCompletionInput = z.infer<typeof levelCompletionInputSchema>;

export type LevelStats = {
  level: number;
  totalCompletions: number;
  avgKeystrokes: number;
  bestScore: number;
};

export type AllLevelStats = z.infer<typeof allLevelStatsSchema>;
export type UserBestScores = z.infer<typeof userBestScoresSchema>;
