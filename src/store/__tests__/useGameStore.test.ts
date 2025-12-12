import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "../useGameStore";
import { LEVELS } from "../../data/levels";

describe("useGameStore", () => {
  beforeEach(() => {
    // Reset store before each test
    // Note: Zustand persist might persist state between tests if not cleared.
    // We can manually reset or just test actions that overwrite.
    useGameStore.getState().setLevel(1);
  });

  it("initializes with correct default values", () => {
    const state = useGameStore.getState();
    expect(state.currentText).toBe(
      "The quick brown fox jumps over the lazy dog.",
    );
    expect(state.targetText).toBe("The quick brown fox jumps.");
    expect(state.history).toEqual([]);
    expect(state.isCompleted).toBe(false);
    expect(state.highScores).toEqual({});
  });

  it("updates text, checks completion, and updates high score", () => {
    const { updateText, addKeyStroke, checkAndUpdateHighScore } =
      useGameStore.getState();

    // Simulate some moves
    addKeyStroke("x");
    addKeyStroke("x");

    updateText("The quick brown fox jumps.");
    checkAndUpdateHighScore();

    const state = useGameStore.getState();
    expect(state.currentText).toBe("The quick brown fox jumps.");
    expect(state.isCompleted).toBe(true);
    // Level 1 should have high score of 2 (history length)
    expect(state.highScores[1]).toBe(2);
  });

  it("logs keystrokes", () => {
    const { addKeyStroke } = useGameStore.getState();
    addKeyStroke("h");
    addKeyStroke("j");

    expect(useGameStore.getState().history).toEqual(["h", "j"]);
  });

  it("resets level correctly", () => {
    const { updateText, addKeyStroke, resetLevel } = useGameStore.getState();

    // Complete level to set high score
    addKeyStroke("a");
    updateText("The quick brown fox jumps.");
    expect(useGameStore.getState().isCompleted).toBe(true);

    resetLevel();

    const state = useGameStore.getState();
    expect(state.currentText).toBe(
      "The quick brown fox jumps over the lazy dog.",
    );
    expect(state.history).toEqual([]);
    expect(state.isCompleted).toBe(false);
  });

  it("progresses to next level with correct text", () => {
    const { nextLevel, addKeyStroke, updateText } = useGameStore.getState();

    // Complete Level 1
    addKeyStroke("d");
    addKeyStroke("w");
    updateText(LEVELS[0].targetText);

    expect(useGameStore.getState().isCompleted).toBe(true);
    expect(useGameStore.getState().currentLevel).toBe(1);

    // Progress to Level 2
    nextLevel();

    const state = useGameStore.getState();
    expect(state.currentLevel).toBe(2);
    expect(state.startText).toBe(LEVELS[1].startText);
    expect(state.targetText).toBe(LEVELS[1].targetText);
    expect(state.currentText).toBe(LEVELS[1].startText);
    expect(state.history).toEqual([]);
    expect(state.isCompleted).toBe(false);
  });

  it("does not progress beyond last level", () => {
    const { nextLevel, setLevel } = useGameStore.getState();

    // Go to last level
    setLevel(LEVELS.length);

    const beforeLevel = useGameStore.getState().currentLevel;

    // Try to progress
    nextLevel();

    const afterLevel = useGameStore.getState().currentLevel;
    expect(afterLevel).toBe(beforeLevel); // Should not change
  });
});
