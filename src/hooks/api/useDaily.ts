import { useQuery } from "@tanstack/react-query";
import { getDailyState } from "../../api/daily";
import type { DailyStateResponse } from "../../schemas/daily";

export const DAILY_STATE_QUERY_KEY = "daily-state";

export const useDailyState = (userId: string, utcDate: string) => {
  return useQuery<DailyStateResponse>({
    queryKey: [DAILY_STATE_QUERY_KEY, userId, utcDate],
    queryFn: () => getDailyState(userId, utcDate),
    enabled: Boolean(userId && utcDate),
    staleTime: 60 * 1000,
  });
};
