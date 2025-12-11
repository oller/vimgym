import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "../store/useGameStore";
import { VimEditor } from "./VimEditor";

describe("VimEditor Keypress Counting", () => {
  beforeEach(() => {
    useGameStore.setState({
      currentLevel: 1,
      startText: "Test text",
      targetText: "Target",
      currentText: "Test text",
      history: [],
      isCompleted: false,
      highScores: {},
    });

    // Mock JSDOM layout methods
    document.createRange = () => {
      const range = new Range();
      range.getBoundingClientRect = () => ({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        toJSON: () => {},
      });
      range.getClientRects = () => ({
        length: 0,
        item: () => null,
        [Symbol.iterator]: [][Symbol.iterator],
      });
      return range;
    };
  });

  it("does not double count keypresses", async () => {
    render(<VimEditor />);

    const editorContainer = screen.getByRole("textbox").closest(".cm-editor");
    expect(editorContainer).toBeTruthy();

    // Clear history
    useGameStore.setState({ history: [] });

    // Press a single key
    fireEvent.keyDown(editorContainer!, { key: "a" });

    // Should only be logged once
    const history = useGameStore.getState().history;
    expect(history).toEqual(["a"]);
    expect(history.length).toBe(1);
  });

  it("logs multiple distinct keypresses correctly", async () => {
    render(<VimEditor />);

    const editorContainer = screen.getByRole("textbox").closest(".cm-editor");
    expect(editorContainer).toBeTruthy();

    // Clear history
    useGameStore.setState({ history: [] });

    // Press multiple keys
    fireEvent.keyDown(editorContainer!, { key: "h" });
    fireEvent.keyDown(editorContainer!, { key: "e" });
    fireEvent.keyDown(editorContainer!, { key: "l" });
    fireEvent.keyDown(editorContainer!, { key: "l" });
    fireEvent.keyDown(editorContainer!, { key: "o" });

    // Should log each key exactly once
    const history = useGameStore.getState().history;
    expect(history).toEqual(["h", "e", "l", "l", "o"]);
    expect(history.length).toBe(5);
  });
});
