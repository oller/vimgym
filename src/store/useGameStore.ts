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
  nextLevel: () => void;
  setPoweredOff: (isPoweredOff: boolean) => void;
}

const level1 = LEVELS[0];

export const useGameStore = create<GameState>()(
  devtools((set, get) => ({
    currentLevel: level1.id,
    startText: level1.startText,
    targetText: level1.targetText,
    currentText: level1.startText,
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

    nextLevel: () => {
      const { currentLevel, setLevel } = get();
      const currentIndex = LEVELS.findIndex((l) => l.id === currentLevel);
      if (currentIndex === -1 || currentIndex === LEVELS.length - 1) return;
      const nextLevel = LEVELS[currentIndex + 1];
      setLevel(nextLevel.id);
    },

    setPoweredOff: (isPoweredOff) => set({ isPoweredOff }),
  })),
);
