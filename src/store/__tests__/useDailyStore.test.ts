import { beforeEach, describe, expect, it } from "vitest";
import { getDailyState } from "../../api/daily";
import { useDailyStore } from "../useDailyStore";

const TEST_DATE = "2026-06-15";

describe("useDailyStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useDailyStore.getState().clear();
  });

  it("consumes an attempt on reset ONLY after typing at least one keystroke", async () => {
    const initial = await getDailyState("test-user", TEST_DATE);
    useDailyStore.getState().hydrate(initial);

    // Free reset when 0 keys typed
    await useDailyStore.getState().resetAttempt();
    expect(useDailyStore.getState().run?.attempts_used).toBe(0);

    // Type a key and reset -> consumes attempt 1 as abandoned
    useDailyStore.getState().addKeyStroke("j");
    await useDailyStore.getState().resetAttempt();

    const state = useDailyStore.getState();
    expect(state.run?.attempts_used).toBe(1);
    expect(state.attempts[0].outcome).toBe("abandoned");
    expect(state.history).toEqual([]);
  });

  it("restores an active in-progress attempt across page reloads (anti-refresh)", async () => {
    const initial = await getDailyState("test-user", TEST_DATE);
    useDailyStore.getState().hydrate(initial);

    useDailyStore.getState().addKeyStroke("j");
    useDailyStore.getState().addKeyStroke("d");
    await useDailyStore.getState().updateText("partial edit");

    // Simulate reload: reset in-memory store without clearing localStorage
    useDailyStore.setState({
      puzzle: null,
      run: null,
      attempts: [],
      history: [],
      currentText: "",
      editorInitialText: "",
    });

    const reloaded = await getDailyState("test-user", TEST_DATE);
    useDailyStore.getState().hydrate(reloaded);

    expect(useDailyStore.getState().history).toEqual(["j", "d"]);
    expect(useDailyStore.getState().currentText).toBe("partial edit");
    expect(useDailyStore.getState().editorInitialText).toBe("partial edit");
  });

  it("records solves, tracks best score, allows early lock-in, and isolates free practice", async () => {
    const initial = await getDailyState("test-user", TEST_DATE);
    useDailyStore.getState().hydrate(initial);
    const puzzle = initial.puzzle;

    // Attempt 1: solve in par + 2 keystrokes
    for (let i = 0; i < puzzle.par + 2; i++) {
      useDailyStore.getState().addKeyStroke("x");
    }
    await useDailyStore.getState().updateText(puzzle.target_text);

    expect(useDailyStore.getState().attemptSolved).toBe(true);
    expect(useDailyStore.getState().run?.attempts_used).toBe(1);
    expect(useDailyStore.getState().run?.best_score).toBe(puzzle.par + 2);
    expect(useDailyStore.getState().run?.status).toBe("in_progress");
    expect(useDailyStore.getState().puzzle?.par_solution).toBeNull();

    // Start attempt 2 and improve to par
    useDailyStore.getState().startNextAttempt();
    for (let i = 0; i < puzzle.par; i++) {
      useDailyStore.getState().addKeyStroke("y");
    }
    await useDailyStore.getState().updateText(puzzle.target_text);
    expect(useDailyStore.getState().run?.best_score).toBe(puzzle.par);

    // Lock in early
    await useDailyStore.getState().lockInRun();
    const locked = useDailyStore.getState();
    expect(locked.run?.status).toBe("completed");
    expect(locked.showResultsModal).toBe(true);
    expect(locked.puzzle?.par_solution).not.toBeNull();
    expect(locked.userStats?.current_streak).toBe(1);

    // Enter Free Practice — solving again must not alter official attempts or best_score
    useDailyStore.getState().enterFreePractice();
    expect(useDailyStore.getState().isFreePractice).toBe(true);
    expect(useDailyStore.getState().showResultsModal).toBe(false);

    useDailyStore.getState().addKeyStroke("z");
    await useDailyStore.getState().updateText(puzzle.target_text);
    expect(useDailyStore.getState().practiceSolved).toBe(true);
    expect(useDailyStore.getState().run?.attempts_used).toBe(2);
    expect(useDailyStore.getState().run?.best_score).toBe(puzzle.par);
  });

  it("auto-finishes the run after 5 attempts", async () => {
    const initial = await getDailyState("test-user", TEST_DATE);
    useDailyStore.getState().hydrate(initial);

    for (let i = 0; i < 5; i++) {
      useDailyStore.getState().addKeyStroke("j");
      await useDailyStore.getState().resetAttempt();
    }

    const finalState = useDailyStore.getState();
    expect(finalState.run?.attempts_used).toBe(5);
    expect(finalState.run?.status).toBe("failed");
    expect(finalState.showResultsModal).toBe(true);
    expect(finalState.puzzle?.par_solution).not.toBeNull();
  });
});
