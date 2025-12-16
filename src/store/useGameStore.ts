import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getLevel, LEVELS } from "../data/levels";

interface GameState {
  currentLevel: number;
  startText: string;
  targetText: string;
  currentText: string;
  history: string[]; // List of keystrokes/motions
  isCompleted: boolean;
  highScores: Record<number, number>; // Level -> Min Keystrokes

  // Actions
  setLevel: (level: number) => void;
  updateText: (text: string) => void;
  addKeyStroke: (key: string) => void;
  resetLevel: () => void;
  nextLevel: () => void;
  checkAndUpdateHighScore: () => void;
}

const level1 = LEVELS[0];

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      currentLevel: 1,
      startText: level1.startText,
      targetText: level1.targetText,
      currentText: level1.startText,
      history: [],
      isCompleted: false,
      highScores: {},

      setLevel: (levelId) => {
        const level = getLevel(levelId);
        if (!level) return;

        const { highScores } = get(); // Preserve high scores
        set({
          currentLevel: levelId,
          startText: level.startText,
          targetText: level.targetText,
          currentText: level.startText,
          history: [],
          isCompleted: false,
          highScores, // Keep existing high scores
        });
      },

      updateText: (text) => {
        const { targetText, checkAndUpdateHighScore } = get();
        const isCompleted = text.trim() === targetText.trim();
        set({ currentText: text, isCompleted });

        if (isCompleted) {
          checkAndUpdateHighScore();
        }
      },

      addKeyStroke: (key) =>
        set((state) => ({
          history: [...state.history, key],
        })),

      checkAndUpdateHighScore: () => {
        const { isCompleted, history, currentLevel, highScores } = get();
        if (isCompleted) {
          const currentScore = history.length;
          const previousBest = highScores[currentLevel];
          if (previousBest === undefined || currentScore < previousBest) {
            set({
              highScores: { ...highScores, [currentLevel]: currentScore },
            });
          }
        }
      },

      resetLevel: () => {
        const { startText } = get();
        set({
          currentText: startText,
          history: [],
          isCompleted: false,
        });
      },

      nextLevel: () => {
        const { currentLevel } = get();
        const nextLevelId = currentLevel + 1;
        const nextLevelData = getLevel(nextLevelId);

        if (nextLevelData) {
          set({
            currentLevel: nextLevelId,
            startText: nextLevelData.startText,
            targetText: nextLevelData.targetText,
            currentText: nextLevelData.startText,
            history: [],
            isCompleted: false,
          });
        }
      },
    }),
    {
      name: "vimgym-storage",
      partialize: (state) => ({ highScores: state.highScores }), // Only persist high scores
      merge: (persistedState, currentState) => ({
        ...currentState,
        highScores: (persistedState as Partial<GameState>)?.highScores || {},
      }),
    },
  ),
);
