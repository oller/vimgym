import { beforeEach, describe, expect, it } from "vitest";
import { LEVELS } from "../../../data/levels";
import { useGameStore } from "../../../store/useGameStore";

describe("Editor Initialization", () => {
  beforeEach(() => {
    // Reset to Level 1
    useGameStore.getState().setLevel(LEVELS[0].id);
  });

  it("startText updates when navigating to a different level", () => {
    const initialStartText = useGameStore.getState().startText;
    expect(initialStartText).toBe(LEVELS[0].startText);

    // Navigate to Level 2
    useGameStore.getState().setLevel(LEVELS[1].id);

    const newStartText = useGameStore.getState().startText;
    expect(newStartText).toBe(LEVELS[1].startText);
    expect(newStartText).not.toBe(initialStartText);
  });

  it("startText is set on initial load (hard refresh scenario)", () => {
    // Simulate fresh store state
    const state = useGameStore.getState();

    // startText should be initialized to Level 1's start text
    expect(state.startText).toBe(LEVELS[0].startText);
  });

  it("currentText matches startText on level navigation", () => {
    // Navigate to Level 2
    useGameStore.getState().setLevel(LEVELS[1].id);

    const state = useGameStore.getState();
    expect(state.currentText).toBe(state.startText);
    expect(state.currentText).toBe(LEVELS[1].startText);
  });

  it("startText updates when resetting level", () => {
    const { setLevel, resetLevel } = useGameStore.getState();

    // Go to level 1 and modify currentText
    setLevel(LEVELS[0].id);
    useGameStore.setState({ currentText: "modified text" });

    const startTextBefore = useGameStore.getState().startText;

    // Reset should keep startText but reset currentText
    resetLevel();

    const state = useGameStore.getState();
    expect(state.startText).toBe(startTextBefore);
    expect(state.currentText).toBe(state.startText);
  });

  it("startText updates when progressing to next level", () => {
    const { updateText, nextLevel } = useGameStore.getState();

    // Complete Level 1
    updateText(LEVELS[0].targetText);

    const level1StartText = useGameStore.getState().startText;

    // Progress to Level 2
    nextLevel();

    const level2StartText = useGameStore.getState().startText;
    expect(level2StartText).toBe(LEVELS[1].startText);
    expect(level2StartText).not.toBe(level1StartText);
  });
});
