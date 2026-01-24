import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllLevelStats,
  getUserBestScores,
  submitLevelCompletion,
} from "../../api";
import type {
  AllLevelStats,
  LevelCompletionInput,
  UserBestScores,
} from "../../schemas";

export const useSubmitCompletion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LevelCompletionInput) => submitLevelCompletion(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["userBestScores", variables.userId],
      });
    },
  });
};

export const useLevelStats = () => {
  return useQuery<AllLevelStats>({
    queryKey: ["levelStats"],
    queryFn: getAllLevelStats,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useUserBestScores = (userId: string | null) => {
  return useQuery<UserBestScores>({
    queryKey: ["userBestScores", userId],
    queryFn: () => {
      if (!userId) return Promise.resolve({});
      return getUserBestScores(userId);
    },
    enabled: !!userId,
    staleTime: 1 * 60 * 1000,
  });
};
