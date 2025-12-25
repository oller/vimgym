import {
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";
import { act } from "@testing-library/react";
import { useGameStore } from "../store/useGameStore";
import { VimEditor } from "./VimEditor";

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

const renderWithRouter = (component: React.ReactNode) => {
  const rootRoute = createRootRoute({
    component: () => component,
  });
  const router = createRouter({ routeTree: rootRoute });
  return render(<RouterProvider router={router} />);
};

describe("VimEditor History", () => {
  beforeEach(() => {
    useGameStore.getState().setLevel(1);
  });

  it("resets undo history on level change", async () => {
    const user = userEvent.setup();
    renderWithRouter(<VimEditor />);

    const editor = await screen.findByRole("textbox");
    await user.click(editor);

    // Make a change in Level 1
    // 'dw' deletes a word
    await user.keyboard("dw");
    expect(useGameStore.getState().currentText).not.toBe(
      useGameStore.getState().startText,
    );

    // Change to Level 2
    act(() => {
      useGameStore.getState().setLevel(2);
    });

    // Wait for Level 2 text
    await waitFor(() => {
      expect(useGameStore.getState().currentText).toContain("const activity");
    });

    // Try to undo ('u') - this should NOT bring back Level 1 text or undo the 'dw' from Level 1
    // In fact, since we start fresh, 'u' should do nothing or at least not reverting to Level 1 state.
    // Ideally, history is empty.

    await user.keyboard("u");

    // Check that we are still on Level 2 text and haven't reverted to some Level 1 state or crashed
    const currentText = useGameStore.getState().currentText;
    expect(currentText).toContain("const activity");

    // If history bled over, 'u' might try to undo the 'dw' operation against the buffer...
    // but the buffer is replaced. CodeMirror history usually tracks changes by timestamp/version.
    // If we undo, it might fail or try to revert previous document state.

    // Better check:
    // If I type something in Level 2, then Undo, it should undo THAT.
    // But it shouldn't undo past the start of Level 2.

    await user.keyboard("i");
    await user.keyboard("TEST");
    await user.keyboard("{Escape}");
    expect(useGameStore.getState().currentText).toContain("TEST");

    await user.keyboard("u");
    expect(useGameStore.getState().currentText).not.toContain("TEST"); // Should undo "TEST"

    await user.keyboard("u");
    // Should NOT go back further to Level 1 stuff.
    expect(useGameStore.getState().currentText).toContain("const activity");
  });
});
