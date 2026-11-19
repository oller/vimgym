import { beforeEach, describe, expect, it, vi } from "vitest";
import { getSupabaseClient } from "../../lib/supabase/client";

vi.mock("../../lib/supabase/client");

describe("daily API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("falls back cleanly to local deterministic daily puzzle when Supabase is unconfigured", async () => {
    vi.mocked(getSupabaseClient).mockReturnValue(null);
    const { getDailyState, submitDailyAttempt, finishDailyRun } = await import(
      "../daily"
    );

    const state = await getDailyState("user-1", "2026-07-01");
    expect(state.puzzle.puzzle_date).toBe("2026-07-01");
    expect(state.puzzle.par_solution).toBeNull();
    expect(state.run.status).toBe("in_progress");

    const afterSolve = await submitDailyAttempt({
      userId: "user-1",
      puzzleId: state.puzzle.id,
      puzzleDate: "2026-07-01",
      outcome: "solved",
      keystrokes: Array(state.puzzle.par).fill("j"),
    });
    expect(afterSolve.run.attempts_used).toBe(1);
    expect(afterSolve.run.best_score).toBe(state.puzzle.par);

    const finished = await finishDailyRun({
      userId: "user-1",
      puzzleId: state.puzzle.id,
      puzzleDate: "2026-07-01",
    });
    expect(finished.run.status).toBe("completed");
    expect(finished.puzzle.par_solution).not.toBeNull();
    expect(finished.user_stats.current_streak).toBe(1);
  });

  it("computes consecutive UTC streaks accurately", async () => {
    const { computeLocalUserStats } = await import("../daily");

    const mkWin = (date: string) => ({
      date,
      puzzleNumber: 1,
      attempts: [],
      run: {
        status: "completed" as const,
        attempts_used: 1,
        best_score: 5,
        best_keystrokes: ["j", "d", "d", "j", "d"],
        finished_at: `${date}T12:00:00Z`,
      },
    });

    const stats = computeLocalUserStats(
      {
        "2026-06-10": mkWin("2026-06-10"),
        "2026-06-11": mkWin("2026-06-11"),
        "2026-06-12": mkWin("2026-06-12"),
        "2026-06-14": mkWin("2026-06-14"),
        "2026-06-15": mkWin("2026-06-15"),
      },
      "2026-06-15",
    );

    expect(stats.games_played).toBe(5);
    expect(stats.games_won).toBe(5);
    expect(stats.current_streak).toBe(2);
    expect(stats.max_streak).toBe(3);
  });

  it("parses valid Supabase RPC payload via Zod", async () => {
    const mockRpcPayload = {
      puzzle: {
        id: "11111111-1111-1111-1111-111111111111",
        puzzle_number: 42,
        puzzle_date: "2026-08-01",
        title: "Remote Puzzle",
        description: "Delete line 2",
        difficulty: "easy",
        language: "javascript",
        start_text: "a\nb\nc",
        target_text: "a\nc",
        start_cursor_line: 0,
        start_cursor_ch: 0,
        par: 3,
        min_keystrokes: 2,
        par_solution: null,
      },
      run: {
        status: "in_progress",
        attempts_used: 0,
        best_score: null,
        best_keystrokes: null,
        finished_at: null,
      },
      attempts: [],
      user_stats: {
        current_streak: 4,
        max_streak: 7,
        games_played: 10,
        games_won: 9,
      },
      global_stats: null,
      distribution: [],
    };

    const rpc = vi
      .fn()
      .mockResolvedValue({ data: mockRpcPayload, error: null });
    vi.mocked(getSupabaseClient).mockReturnValue({
      rpc,
    } as unknown as ReturnType<typeof getSupabaseClient>);

    const { getDailyState } = await import("../daily");
    const result = await getDailyState("user-1", "2026-08-01");

    expect(rpc).toHaveBeenCalledWith("get_daily_state", {
      p_user_id: "user-1",
      p_date: "2026-08-01",
    });
    expect(result.puzzle.puzzle_number).toBe(42);
    expect(result.user_stats.current_streak).toBe(4);
  });
});
