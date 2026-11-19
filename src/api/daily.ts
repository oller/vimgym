import { getFallbackDailyPuzzle } from "../data/dailyPuzzles";
import { getSupabaseClient } from "../lib/supabase/client";
import type {
  DailyAttempt,
  DailyAttemptOutcome,
  DailyGlobalStats,
  DailyRun,
  DailyStateResponse,
  DailyUserStats,
} from "../schemas/daily";
import { dailyStateResponseSchema, MAX_DAILY_ATTEMPTS } from "../schemas/daily";
import { getUtcDateString } from "../utils/daily";
import { logger } from "../utils/logger";

const LOCAL_HISTORY_KEY = "vimdle-local-runs-v1";

type LocalStoredRun = {
  date: string;
  puzzleNumber: number;
  run: DailyRun;
  attempts: DailyAttempt[];
};

type LocalHistoryMap = Record<string, LocalStoredRun>;

type DailyRpcResponse = Promise<{ data: unknown; error: unknown }>;
type DailyRpcClient = {
  rpc: (fn: string, params: Record<string, unknown>) => DailyRpcResponse;
};

function readLocalHistory(): LocalHistoryMap {
  try {
    const raw = localStorage.getItem(LOCAL_HISTORY_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as LocalHistoryMap;
  } catch {
    return {};
  }
}

function writeLocalHistory(map: LocalHistoryMap): void {
  try {
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage quota errors
  }
}

function prevUtcDate(dateStr: string): string {
  const ms = Date.parse(`${dateStr}T00:00:00Z`) - 86_400_000;
  return new Date(ms).toISOString().slice(0, 10);
}

export function computeLocalUserStats(
  history: LocalHistoryMap,
  todayUtc: string,
): DailyUserStats {
  const entries = Object.values(history).filter(
    (entry) => entry.run.status !== "in_progress",
  );
  const gamesPlayed = entries.length;
  const wonDates = new Set(
    entries
      .filter((entry) => entry.run.status === "completed")
      .map((entry) => entry.date),
  );
  const gamesWon = wonDates.size;

  // Current streak: count consecutive won days ending today (or yesterday if today not finished yet)
  let currentStreak = 0;
  let cursor = wonDates.has(todayUtc) ? todayUtc : prevUtcDate(todayUtc);
  while (wonDates.has(cursor)) {
    currentStreak++;
    cursor = prevUtcDate(cursor);
  }

  // Max streak across all recorded won dates
  const sortedWon = [...wonDates].sort();
  let maxStreak = 0;
  let streak = 0;
  let lastDate: string | null = null;
  for (const d of sortedWon) {
    if (lastDate && prevUtcDate(d) === lastDate) {
      streak++;
    } else {
      streak = 1;
    }
    if (streak > maxStreak) maxStreak = streak;
    lastDate = d;
  }

  return {
    current_streak: currentStreak,
    max_streak: maxStreak,
    games_played: gamesPlayed,
    games_won: gamesWon,
  };
}

function buildLocalDailyState(dateStr: string): DailyStateResponse {
  const history = readLocalHistory();
  const stored = history[dateStr];
  const run: DailyRun = stored?.run ?? {
    status: "in_progress",
    attempts_used: 0,
    best_score: null,
    best_keystrokes: null,
    finished_at: null,
  };
  const attempts: DailyAttempt[] = stored?.attempts ?? [];
  const isFinished = run.status !== "in_progress";
  const puzzle = getFallbackDailyPuzzle(dateStr, isFinished);
  const userStats = computeLocalUserStats(history, dateStr);

  const globalStats: DailyGlobalStats | null = isFinished
    ? {
        total_players: 1,
        solved_players: run.best_score !== null ? 1 : 0,
        avg_best_score: run.best_score,
        global_best_score: run.best_score,
        global_best_keystrokes: run.best_keystrokes,
        user_percentile: run.best_score !== null ? 100 : null,
      }
    : null;

  const distribution =
    isFinished && run.best_score !== null
      ? [{ score: run.best_score, count: 1 }]
      : [];

  return {
    puzzle,
    run,
    attempts,
    user_stats: userStats,
    global_stats: globalStats,
    distribution,
  };
}

export function hasFinishedDailyLocally(
  dateStr: string = getUtcDateString(),
): boolean {
  const history = readLocalHistory();
  const stored = history[dateStr];
  return stored ? stored.run.status !== "in_progress" : false;
}

function syncDailyFinishedFlag(
  dateStr: string,
  state: DailyStateResponse,
): void {
  const history = readLocalHistory();
  history[dateStr] = {
    date: dateStr,
    puzzleNumber: state.puzzle.puzzle_number,
    run: state.run,
    attempts: state.attempts,
  };
  writeLocalHistory(history);
}

export async function getDailyState(
  userId: string,
  dateStr: string = getUtcDateString(),
): Promise<DailyStateResponse> {
  const client = getSupabaseClient();
  if (!client) {
    return buildLocalDailyState(dateStr);
  }

  try {
    const rpcClient = client as unknown as DailyRpcClient;
    const { data, error } = await rpcClient.rpc("get_daily_state", {
      p_user_id: userId,
      p_date: dateStr,
    });

    if (error || !data) {
      logger.warn(
        "Failed to fetch daily state from Supabase, using local fallback:",
        error,
      );
      return buildLocalDailyState(dateStr);
    }

    const parsed = dailyStateResponseSchema.parse(data);
    syncDailyFinishedFlag(dateStr, parsed);
    return parsed;
  } catch (err) {
    logger.error("Failed to parse daily state, using local fallback:", err);
    return buildLocalDailyState(dateStr);
  }
}

export async function submitDailyAttempt(params: {
  userId: string;
  puzzleId: string;
  puzzleDate: string;
  outcome: DailyAttemptOutcome;
  keystrokes: string[];
}): Promise<DailyStateResponse> {
  const { userId, puzzleId, puzzleDate, outcome, keystrokes } = params;

  // Apply optimistic / local persistence first so offline mode works identically
  const applyLocal = (): DailyStateResponse => {
    const history = readLocalHistory();
    const puzzle = getFallbackDailyPuzzle(puzzleDate, false);
    const existing = history[puzzleDate] ?? {
      date: puzzleDate,
      puzzleNumber: puzzle.puzzle_number,
      run: {
        status: "in_progress" as const,
        attempts_used: 0,
        best_score: null,
        best_keystrokes: null,
        finished_at: null,
      },
      attempts: [],
    };

    if (
      existing.run.status === "in_progress" &&
      existing.run.attempts_used < MAX_DAILY_ATTEMPTS
    ) {
      const nextAttemptNumber = existing.run.attempts_used + 1;
      const attempt: DailyAttempt = {
        attempt_number: nextAttemptNumber,
        outcome,
        keystrokes_count: keystrokes.length,
        keystrokes,
      };
      const attempts = [...existing.attempts, attempt];

      let bestScore = existing.run.best_score;
      let bestKeystrokes = existing.run.best_keystrokes;
      if (
        outcome === "solved" &&
        keystrokes.length >= puzzle.min_keystrokes &&
        (bestScore === null || keystrokes.length < bestScore)
      ) {
        bestScore = keystrokes.length;
        bestKeystrokes = keystrokes;
      }

      const isFinalAttempt = nextAttemptNumber >= MAX_DAILY_ATTEMPTS;
      const status = isFinalAttempt
        ? bestScore !== null
          ? "completed"
          : "failed"
        : "in_progress";

      history[puzzleDate] = {
        ...existing,
        attempts,
        run: {
          status,
          attempts_used: nextAttemptNumber,
          best_score: bestScore,
          best_keystrokes: bestKeystrokes,
          finished_at: isFinalAttempt ? new Date().toISOString() : null,
        },
      };
      writeLocalHistory(history);
    }

    return buildLocalDailyState(puzzleDate);
  };

  const client = getSupabaseClient();
  if (!client || puzzleId.startsWith("local-daily-")) {
    return applyLocal();
  }

  try {
    const rpcClient = client as unknown as DailyRpcClient;
    const { data, error } = await rpcClient.rpc("submit_daily_attempt", {
      p_user_id: userId,
      p_puzzle_id: puzzleId,
      p_outcome: outcome,
      p_keystrokes: keystrokes,
    });

    if (error || !data) {
      logger.error("Failed to submit daily attempt to Supabase:", error);
      return applyLocal();
    }

    const parsed = dailyStateResponseSchema.parse(data);
    syncDailyFinishedFlag(puzzleDate, parsed);
    return parsed;
  } catch (err) {
    logger.error("Error submitting daily attempt:", err);
    return applyLocal();
  }
}

export async function finishDailyRun(params: {
  userId: string;
  puzzleId: string;
  puzzleDate: string;
}): Promise<DailyStateResponse> {
  const { userId, puzzleId, puzzleDate } = params;

  const applyLocal = (): DailyStateResponse => {
    const history = readLocalHistory();
    const puzzle = getFallbackDailyPuzzle(puzzleDate, false);
    const existing = history[puzzleDate] ?? {
      date: puzzleDate,
      puzzleNumber: puzzle.puzzle_number,
      run: {
        status: "in_progress" as const,
        attempts_used: 0,
        best_score: null,
        best_keystrokes: null,
        finished_at: null,
      },
      attempts: [],
    };

    if (existing.run.status === "in_progress") {
      history[puzzleDate] = {
        ...existing,
        run: {
          ...existing.run,
          status: existing.run.best_score !== null ? "completed" : "failed",
          finished_at: new Date().toISOString(),
        },
      };
      writeLocalHistory(history);
    }

    return buildLocalDailyState(puzzleDate);
  };

  const client = getSupabaseClient();
  if (!client || puzzleId.startsWith("local-daily-")) {
    return applyLocal();
  }

  try {
    const rpcClient = client as unknown as DailyRpcClient;
    const { data, error } = await rpcClient.rpc("finish_daily_run", {
      p_user_id: userId,
      p_puzzle_id: puzzleId,
    });

    if (error || !data) {
      logger.error("Failed to finish daily run in Supabase:", error);
      return applyLocal();
    }

    const parsed = dailyStateResponseSchema.parse(data);
    syncDailyFinishedFlag(puzzleDate, parsed);
    return parsed;
  } catch (err) {
    logger.error("Error finishing daily run:", err);
    return applyLocal();
  }
}
