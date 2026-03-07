import { z } from "zod";

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

export type PlayerDashboard = z.infer<typeof playerDashboardSchema>;
