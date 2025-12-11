import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "./useGameStore";

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
    const { updateText, addKeyStroke } = useGameStore.getState();

    // Simulate some moves
    addKeyStroke("x");
    addKeyStroke("x");

    updateText("The quick brown fox jumps.");

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

  it("resets level correctly but keeps high scores", () => {
    const { updateText, addKeyStroke, resetLevel } = useGameStore.getState();

    // Complete level to set high score
    addKeyStroke("a");
    updateText("The quick brown fox jumps.");

    resetLevel();

    const state = useGameStore.getState();
    expect(state.currentText).toBe(
      "The quick brown fox jumps over the lazy dog.",
    );
    expect(state.history).toEqual([]);
    expect(state.isCompleted).toBe(false);
    // High score should persist
    expect(state.highScores[1]).toBe(1);
  });
});
