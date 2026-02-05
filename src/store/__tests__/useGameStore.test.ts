import { beforeEach, describe, expect, it } from "vitest";
import { LEVELS } from "../../data/levels";
import { useGameStore } from "../useGameStore";

describe("useGameStore", () => {
  beforeEach(() => {
    // Reset store before each test
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
  });

  it("updates text and checks completion", () => {
    const { updateText, addKeyStroke } = useGameStore.getState();

    // Simulate some moves
    addKeyStroke("x");
    addKeyStroke("x");

    updateText("The quick brown fox jumps.");

    const state = useGameStore.getState();
    expect(state.currentText).toBe("The quick brown fox jumps.");
    expect(state.isCompleted).toBe(true);
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
