import { LEVELS } from "../data/levels";
import { getSupabaseClient } from "../lib/supabase/client";
import type { PlayerDashboard } from "../schemas";
import { playerDashboardSchema } from "../schemas";
import { logger } from "../utils/logger";

export const getPlayerDashboard = async (
  userId: string,
): Promise<Record<string, PlayerDashboard[string]>> => {
  const client = getSupabaseClient();

  if (!client) {
    return {};
  }

  const { data, error } = await client.rpc("get_player_dashboard", {
    p_user_id: userId,
    p_level_ids: LEVELS.map((l) => l.id),
  });

  if (error || !data) {
    logger.error("Failed to fetch player dashboard:", error);
    return {};
  }

  try {
    const validated = playerDashboardSchema.parse(data);
    return validated;
  } catch (err) {
    logger.error("Failed to parse player dashboard:", err);
    return {};
  }
};

export const getLevelScoreDistribution = async (
  levelId: string,
): Promise<{ score: number; count: number }[]> => {
  const client = getSupabaseClient();

  if (!client) {
    return [];
  }

  const { data, error } = await client.rpc("get_level_score_distribution", {
    p_level_id: levelId,
  });

  if (error) {
    logger.error("Failed to fetch level score distribution:", error);
    throw error;
  }

  return data ?? [];
};
