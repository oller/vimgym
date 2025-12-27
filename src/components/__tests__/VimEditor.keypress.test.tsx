import {
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "../../store/useGameStore";
import { VimEditor } from "../VimEditor";

const renderWithRouter = (component: React.ReactNode) => {
  const rootRoute = createRootRoute({
    component: () => component,
  });
  const router = createRouter({ routeTree: rootRoute });
  return render(<RouterProvider router={router} />);
};

describe("VimEditor Keypress Logging", () => {
  beforeEach(() => {
    // Reset store and history
    useGameStore.setState({
      currentLevel: 1,
      startText: "Test text",
      targetText: "Target",
      currentText: "Test text",
      history: [],
      isCompleted: false,
      highScores: {},
    });
  });

  it("logs keypresses from insert mode", async () => {
    renderWithRouter(<VimEditor />);

    // Get the editor container
    const textbox = await screen.findByRole("textbox");
    const editorContainer = textbox.closest(".cm-editor");
    expect(editorContainer).toBeTruthy();
    if (!editorContainer) throw new Error("Editor container not found");

    // Simulate keypresses directly on the DOM
    // These should be captured by our keydown listener
    const keys = ["h", "e", "l", "l", "o"];

    keys.forEach((key) => {
      fireEvent.keyDown(editorContainer, { key });
    });

    // Check that all keys were logged
    const history = useGameStore.getState().history;
    expect(history).toEqual(keys);
  });

  it("logs special keys with normalized names", async () => {
    renderWithRouter(<VimEditor />);

    const textbox = await screen.findByRole("textbox");
    const editorContainer = textbox.closest(".cm-editor");
    expect(editorContainer).toBeTruthy();
    if (!editorContainer) throw new Error("Editor container not found");

    // Test special key normalization
    fireEvent.keyDown(editorContainer, { key: "Escape" });
    fireEvent.keyDown(editorContainer, { key: "Enter" });
    fireEvent.keyDown(editorContainer, { key: " " });

    const history = useGameStore.getState().history;
    expect(history).toEqual(["Esc", "Enter", " "]);
  });

  it("does not log modifier keys", async () => {
    renderWithRouter(<VimEditor />);

    const textbox = await screen.findByRole("textbox");
    const editorContainer = textbox.closest(".cm-editor");
    expect(editorContainer).toBeTruthy();
    if (!editorContainer) throw new Error("Editor container not found");

    // These should be filtered out
    const modifierKeys = ["Shift", "Control", "Alt", "Meta", "CapsLock", "Tab"];

    modifierKeys.forEach((key) => {
      fireEvent.keyDown(editorContainer, { key });
    });

    // History should be empty
    const history = useGameStore.getState().history;
    expect(history).toEqual([]);
  });

  it("logs mixed alphanumeric and special characters", async () => {
    renderWithRouter(<VimEditor />);

    const textbox = await screen.findByRole("textbox");
    const editorContainer = textbox.closest(".cm-editor");
    expect(editorContainer).toBeTruthy();
    if (!editorContainer) throw new Error("Editor container not found");

    const keys = ["a", "b", "1", "2", "!", "@", "#"];

    keys.forEach((key) => {
      fireEvent.keyDown(editorContainer, { key });
    });

    const history = useGameStore.getState().history;
    expect(history).toEqual(keys);
  });

  it("clears history on reset", () => {
    const { addKeyStroke, resetLevel } = useGameStore.getState();

    // Add some keystrokes
    addKeyStroke("a");
    addKeyStroke("b");
    addKeyStroke("c");

    expect(useGameStore.getState().history).toEqual(["a", "b", "c"]);

    // Reset should clear history
    resetLevel();

    expect(useGameStore.getState().history).toEqual([]);
  });
});
