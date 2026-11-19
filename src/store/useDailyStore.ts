import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { finishDailyRun, submitDailyAttempt } from "../api/daily";
import { DAILY_STATE_QUERY_KEY } from "../hooks/api/useDaily";
import { getUserId } from "../lib/analytics";
import { queryClient } from "../lib/react-query";
import type {
  DailyAttempt,
  DailyDistributionPoint,
  DailyGlobalStats,
  DailyPuzzle,
  DailyRun,
  DailyStateResponse,
  DailyUserStats,
} from "../schemas/daily";
import { isExactDailyMatch } from "../utils/daily";

const ACTIVE_ATTEMPT_STORAGE_KEY = "vimdle-active-attempt-v1";

type PersistedActiveAttempt = {
  puzzleDate: string;
  attemptNumber: number;
  history: string[];
  currentText: string;
};

function readActiveAttempt(): PersistedActiveAttempt | null {
  try {
    const raw = localStorage.getItem(ACTIVE_ATTEMPT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedActiveAttempt;
  } catch {
    return null;
  }
}

function saveActiveAttempt(data: PersistedActiveAttempt): void {
  try {
    localStorage.setItem(ACTIVE_ATTEMPT_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
}

function clearActiveAttempt(): void {
  try {
    localStorage.removeItem(ACTIVE_ATTEMPT_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

interface DailyGameState {
  puzzle: DailyPuzzle | null;
  run: DailyRun | null;
  attempts: DailyAttempt[];
  userStats: DailyUserStats | null;
  globalStats: DailyGlobalStats | null;
  distribution: DailyDistributionPoint[];

  currentText: string;
  editorInitialText: string;
  history: string[];
  attemptSolved: boolean;
  isFreePractice: boolean;
  practiceSolved: boolean;
  isSubmitting: boolean;
  resetCount: number;
  showResultsModal: boolean;

  // Actions
  hydrate: (state: DailyStateResponse) => void;
  addKeyStroke: (key: string) => void;
  updateText: (text: string) => Promise<void>;
  resetAttempt: () => Promise<void>;
  startNextAttempt: () => void;
  lockInRun: () => Promise<void>;
  enterFreePractice: () => void;
  setShowResultsModal: (open: boolean) => void;
  clear: () => void;
}

const INITIAL_STATE = {
  puzzle: null,
  run: null,
  attempts: [] as DailyAttempt[],
  userStats: null,
  globalStats: null,
  distribution: [] as DailyDistributionPoint[],
  currentText: "",
  editorInitialText: "",
  history: [] as string[],
  attemptSolved: false,
  isFreePractice: false,
  practiceSolved: false,
  isSubmitting: false,
  resetCount: 0,
  showResultsModal: false,
};

export const useDailyStore = create<DailyGameState>()(
  devtools((set, get) => ({
    ...INITIAL_STATE,

    hydrate: (state) => {
      const prev = get();
      const samePuzzle = prev.puzzle?.id === state.puzzle.id;
      const isFinished = state.run.status !== "in_progress";

      if (isFinished) {
        clearActiveAttempt();
        set({
          puzzle: state.puzzle,
          run: state.run,
          attempts: state.attempts,
          userStats: state.user_stats,
          globalStats: state.global_stats,
          distribution: state.distribution,
          currentText: samePuzzle ? prev.currentText : state.puzzle.start_text,
          editorInitialText: samePuzzle
            ? prev.editorInitialText
            : state.puzzle.start_text,
          history: samePuzzle ? prev.history : [],
          attemptSolved: false,
          showResultsModal: prev.isFreePractice ? prev.showResultsModal : true,
        });
        return;
      }

      // Check for an in-progress attempt saved before a page refresh
      const nextAttemptNumber = state.run.attempts_used + 1;
      const saved = readActiveAttempt();
      const shouldRestoreSaved =
        !samePuzzle &&
        saved !== null &&
        saved.puzzleDate === state.puzzle.puzzle_date &&
        saved.attemptNumber === nextAttemptNumber &&
        saved.history.length > 0;

      set({
        puzzle: state.puzzle,
        run: state.run,
        attempts: state.attempts,
        userStats: state.user_stats,
        globalStats: state.global_stats,
        distribution: state.distribution,
        currentText: shouldRestoreSaved
          ? saved.currentText
          : samePuzzle
            ? prev.currentText
            : state.puzzle.start_text,
        editorInitialText: shouldRestoreSaved
          ? saved.currentText
          : samePuzzle
            ? prev.editorInitialText
            : state.puzzle.start_text,
        history: shouldRestoreSaved
          ? saved.history
          : samePuzzle
            ? prev.history
            : [],
        attemptSolved: samePuzzle ? prev.attemptSolved : false,
        isFreePractice: false,
        practiceSolved: false,
        showResultsModal: false,
      });
    },

    addKeyStroke: (key) => {
      const {
        puzzle,
        run,
        history,
        currentText,
        isFreePractice,
        attemptSolved,
        practiceSolved,
      } = get();
      if (!puzzle || !run) return;
      if (isFreePractice && practiceSolved) return;
      if (!isFreePractice && (run.status !== "in_progress" || attemptSolved)) {
        return;
      }

      const nextHistory = [...history, key];
      set({ history: nextHistory });

      if (!isFreePractice && run.status === "in_progress") {
        saveActiveAttempt({
          puzzleDate: puzzle.puzzle_date,
          attemptNumber: run.attempts_used + 1,
          history: nextHistory,
          currentText,
        });
      }
    },

    updateText: async (text) => {
      const {
        puzzle,
        run,
        history,
        isFreePractice,
        attemptSolved,
        practiceSolved,
        isSubmitting,
      } = get();
      if (!puzzle || !run) return;

      if (isFreePractice) {
        const matched = isExactDailyMatch(text, puzzle.target_text);
        set({ currentText: text, practiceSolved: practiceSolved || matched });
        return;
      }

      if (run.status !== "in_progress" || attemptSolved || isSubmitting) {
        return;
      }

      const matched = isExactDailyMatch(text, puzzle.target_text);
      set({ currentText: text });

      if (!matched) {
        if (history.length > 0) {
          saveActiveAttempt({
            puzzleDate: puzzle.puzzle_date,
            attemptNumber: run.attempts_used + 1,
            history,
            currentText: text,
          });
        }
        return;
      }

      // Solved this official attempt!
      clearActiveAttempt();
      const submittedKeystrokes = history.length > 0 ? history : [" "];
      set({ attemptSolved: true, isSubmitting: true });

      const userId = getUserId();
      const nextState = await submitDailyAttempt({
        userId,
        puzzleId: puzzle.id,
        puzzleDate: puzzle.puzzle_date,
        outcome: "solved",
        keystrokes: submittedKeystrokes,
      });

      queryClient.setQueryData(
        [DAILY_STATE_QUERY_KEY, userId, puzzle.puzzle_date],
        nextState,
      );

      const finished = nextState.run.status !== "in_progress";
      set({
        puzzle: nextState.puzzle,
        run: nextState.run,
        attempts: nextState.attempts,
        userStats: nextState.user_stats,
        globalStats: nextState.global_stats,
        distribution: nextState.distribution,
        isSubmitting: false,
        showResultsModal: finished,
      });
    },

    startNextAttempt: () => {
      const { puzzle, run, resetCount } = get();
      if (!puzzle || !run || run.status !== "in_progress") return;
      clearActiveAttempt();
      set({
        currentText: puzzle.start_text,
        editorInitialText: puzzle.start_text,
        history: [],
        attemptSolved: false,
        resetCount: resetCount + 1,
      });
    },

    resetAttempt: async () => {
      const {
        puzzle,
        run,
        history,
        attemptSolved,
        isFreePractice,
        isSubmitting,
        resetCount,
      } = get();
      if (!puzzle || !run || isSubmitting) return;

      if (isFreePractice) {
        set({
          currentText: puzzle.start_text,
          editorInitialText: puzzle.start_text,
          history: [],
          practiceSolved: false,
          resetCount: resetCount + 1,
        });
        return;
      }

      if (run.status !== "in_progress") return;

      // If this attempt already solved, reset simply starts the next attempt
      if (attemptSolved) {
        get().startNextAttempt();
        return;
      }

      // If 0 keystrokes typed, reset buffer/cursor for free without consuming an attempt
      if (history.length === 0) {
        set({
          currentText: puzzle.start_text,
          editorInitialText: puzzle.start_text,
          resetCount: resetCount + 1,
        });
        return;
      }

      // Otherwise, resetting after typing consumes 1 attempt as "abandoned"
      clearActiveAttempt();
      set({ isSubmitting: true });

      const userId = getUserId();
      const nextState = await submitDailyAttempt({
        userId,
        puzzleId: puzzle.id,
        puzzleDate: puzzle.puzzle_date,
        outcome: "abandoned",
        keystrokes: history,
      });

      queryClient.setQueryData(
        [DAILY_STATE_QUERY_KEY, userId, puzzle.puzzle_date],
        nextState,
      );

      const finished = nextState.run.status !== "in_progress";
      set({
        puzzle: nextState.puzzle,
        run: nextState.run,
        attempts: nextState.attempts,
        userStats: nextState.user_stats,
        globalStats: nextState.global_stats,
        distribution: nextState.distribution,
        currentText: puzzle.start_text,
        editorInitialText: puzzle.start_text,
        history: [],
        attemptSolved: false,
        isSubmitting: false,
        resetCount: resetCount + 1,
        showResultsModal: finished,
      });
    },

    lockInRun: async () => {
      const { puzzle, run, isSubmitting } = get();
      if (!puzzle || !run || run.status !== "in_progress" || isSubmitting) {
        return;
      }

      clearActiveAttempt();
      set({ isSubmitting: true });

      const userId = getUserId();
      const nextState = await finishDailyRun({
        userId,
        puzzleId: puzzle.id,
        puzzleDate: puzzle.puzzle_date,
      });

      queryClient.setQueryData(
        [DAILY_STATE_QUERY_KEY, userId, puzzle.puzzle_date],
        nextState,
      );

      set({
        puzzle: nextState.puzzle,
        run: nextState.run,
        attempts: nextState.attempts,
        userStats: nextState.user_stats,
        globalStats: nextState.global_stats,
        distribution: nextState.distribution,
        attemptSolved: false,
        isSubmitting: false,
        showResultsModal: true,
      });
    },

    enterFreePractice: () => {
      const { puzzle, resetCount } = get();
      if (!puzzle) return;
      set({
        isFreePractice: true,
        practiceSolved: false,
        showResultsModal: false,
        currentText: puzzle.start_text,
        editorInitialText: puzzle.start_text,
        history: [],
        resetCount: resetCount + 1,
      });
    },

    setShowResultsModal: (open) => set({ showResultsModal: open }),

    clear: () => {
      clearActiveAttempt();
      set(INITIAL_STATE);
    },
  })),
);
