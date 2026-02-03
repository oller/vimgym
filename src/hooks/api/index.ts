import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getLevelScoreDistribution,
  getPlayerDashboard,
  submitLevelCompletion,
} from "../../api";
import type { LevelCompletionInput, PlayerDashboard } from "../../schemas";

export const useSubmitCompletion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LevelCompletionInput) => submitLevelCompletion(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["playerDashboard", variables.userId],
      });
    },
  });
};

export const usePlayerDashboard = (userId: string | null) => {
  return useQuery<Record<number, PlayerDashboard[string]>>({
    queryKey: ["playerDashboard", userId],
    queryFn: () => {
      // Even if userId is null, we can return generic stats?
      // Actually, RPC requires a UUID. If no user, we might want just "global stats".
      // But get_player_dashboard requires p_user_id.
      // For now, only enabled if userId exists (Dashboard implies User).
      // Wait, LevelStatsCard is shown even for unplayed levels? Yes.
      // But if no userId, we can't get percentiles.
      // If anonymous, just pass a dummy UUID? Or handle in API?
      // existing code only enabled if !!userId.
      if (!userId) return Promise.resolve({});
      return getPlayerDashboard(userId);
    },
    enabled: !!userId,
    // Keep it fresh, but not too aggressive
    staleTime: 1 * 60 * 1000,
  });
};

export const useLevelScoreDistribution = (
  levelId: number,
  enabled: boolean,
) => {
  return useQuery({
    queryKey: ["level-distribution", levelId],
    queryFn: () => getLevelScoreDistribution(levelId),
    enabled,
  });
};
