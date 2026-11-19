import { z } from "zod";

export const MAX_DAILY_ATTEMPTS = 5;

export const dailyDifficultySchema = z.enum(["easy", "medium", "hard"]);
export const dailyLanguageSchema = z.enum([
  "html",
  "javascript",
  "markdown",
  "json",
]);
export const dailyAttemptOutcomeSchema = z.enum(["solved", "abandoned"]);
export const dailyRunStatusSchema = z.enum([
  "in_progress",
  "completed",
  "failed",
]);

export const dailyPuzzleSchema = z.object({
  id: z.string(),
  puzzle_number: z.number().int().positive(),
  puzzle_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string(),
  description: z.string(),
  difficulty: dailyDifficultySchema,
  language: dailyLanguageSchema,
  start_text: z.string(),
  target_text: z.string(),
  start_cursor_line: z.number().int().nonnegative().default(0),
  start_cursor_ch: z.number().int().nonnegative().default(0),
  par: z.number().int().positive(),
  min_keystrokes: z.number().int().positive(),
  par_solution: z.array(z.string()).nullable().optional(),
});

export const dailyAttemptSchema = z.object({
  attempt_number: z.number().int().min(1).max(MAX_DAILY_ATTEMPTS),
  outcome: dailyAttemptOutcomeSchema,
  keystrokes_count: z.number().int().nonnegative(),
  keystrokes: z.array(z.string()),
});

export const dailyRunSchema = z.object({
  status: dailyRunStatusSchema,
  attempts_used: z.number().int().min(0).max(MAX_DAILY_ATTEMPTS),
  best_score: z.number().int().positive().nullable(),
  best_keystrokes: z.array(z.string()).nullable(),
  finished_at: z.string().nullable(),
});

export const dailyUserStatsSchema = z.object({
  current_streak: z.number().int().nonnegative(),
  max_streak: z.number().int().nonnegative(),
  games_played: z.number().int().nonnegative(),
  games_won: z.number().int().nonnegative(),
});

export const dailyGlobalStatsSchema = z.object({
  total_players: z.number().int().nonnegative(),
  solved_players: z.number().int().nonnegative(),
  avg_best_score: z.number().nullable(),
  global_best_score: z.number().int().positive().nullable(),
  global_best_keystrokes: z.array(z.string()).nullable(),
  user_percentile: z.number().nullable(),
});

export const dailyDistributionPointSchema = z.object({
  score: z.number().int().positive(),
  count: z.number().int().positive(),
});

export const dailyStateResponseSchema = z.object({
  puzzle: dailyPuzzleSchema,
  run: dailyRunSchema,
  attempts: z.array(dailyAttemptSchema),
  user_stats: dailyUserStatsSchema,
  global_stats: dailyGlobalStatsSchema.nullable(),
  distribution: z.array(dailyDistributionPointSchema),
});

export type DailyDifficulty = z.infer<typeof dailyDifficultySchema>;
export type DailyLanguage = z.infer<typeof dailyLanguageSchema>;
export type DailyAttemptOutcome = z.infer<typeof dailyAttemptOutcomeSchema>;
export type DailyRunStatus = z.infer<typeof dailyRunStatusSchema>;
export type DailyPuzzle = z.infer<typeof dailyPuzzleSchema>;
export type DailyAttempt = z.infer<typeof dailyAttemptSchema>;
export type DailyRun = z.infer<typeof dailyRunSchema>;
export type DailyUserStats = z.infer<typeof dailyUserStatsSchema>;
export type DailyGlobalStats = z.infer<typeof dailyGlobalStatsSchema>;
export type DailyDistributionPoint = z.infer<
  typeof dailyDistributionPointSchema
>;
export type DailyStateResponse = z.infer<typeof dailyStateResponseSchema>;
