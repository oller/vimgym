import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { getLevel, LEVELS } from "../data/levels";
import { submitCompletionAnalytics } from "../lib/analytics";

interface GameState {
  currentLevel: string;
  startText: string;
  targetText: string;
  currentText: string;
  history: string[]; // List of keystrokes/motions
  isCompleted: boolean;
  resetCount: number;
  isPoweredOff: boolean;

  // Actions
  setLevel: (level: string) => void;
  updateText: (text: string) => void;
  addKeyStroke: (key: string) => void;
  resetLevel: () => void;
  setPoweredOff: (isPoweredOff: boolean) => void;
}

const getInitialLevelId = (): string => {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("levelId");
    if (id && LEVELS.some((l) => l.id === id)) {
      return id;
    }
  }
  return LEVELS[0].id;
};

const initialLevel = getLevel(getInitialLevelId()) ?? LEVELS[0];

export const useGameStore = create<GameState>()(
  devtools((set, get) => ({
    currentLevel: initialLevel.id,
    startText: initialLevel.startText,
    targetText: initialLevel.targetText,
    currentText: initialLevel.startText,
    history: [],
    isCompleted: false,
    resetCount: 0,
    isPoweredOff: false,

    setLevel: (levelId) => {
      const level = getLevel(levelId);
      if (!level) return;

      set({
        currentLevel: levelId,
        startText: level.startText,
        targetText: level.targetText,
        currentText: level.startText,
        history: [],
        isCompleted: false,
      });
    },

    updateText: (text) => {
      const { targetText, currentLevel, history } = get();
      const isCompleted = text.trim() === targetText.trim();
      set({ currentText: text, isCompleted });

      if (isCompleted) {
        // Submit analytics (fire and forget)
        const currentScore = history.length;
        submitCompletionAnalytics(currentLevel, currentScore, history);
      }
    },

    addKeyStroke: (key) =>
      set((state) => ({
        history: [...state.history, key],
      })),

    resetLevel: () => {
      const { startText, resetCount } = get();
      set({
        currentText: startText,
        history: [],
        isCompleted: false,
        resetCount: resetCount + 1,
      });
    },

    setPoweredOff: (isPoweredOff) => set({ isPoweredOff }),
  })),
);
