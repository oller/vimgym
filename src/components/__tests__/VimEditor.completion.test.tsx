import {
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "../../store/useGameStore";
import { VimEditor } from "./../VimEditor";

const renderWithRouter = (component: React.ReactNode) => {
  const rootRoute = createRootRoute({
    component: () => component,
  });
  const router = createRouter({ routeTree: rootRoute });
  return render(<RouterProvider router={router} />);
};

describe("Level Completion", () => {
  beforeEach(() => {
    useGameStore.getState().setLevel(1);
  });

  it("detects level completion", async () => {
    const user = userEvent.setup();
    renderWithRouter(<VimEditor />);

    const editor = await screen.findByRole("textbox");

    // Level 1: "The quick brown fox jumps over the lazy dog." -> "The quick brown fox jumps."
    // Let's just delete everything and type the target text to be sure.
    await user.click(editor);
    await user.keyboard("dd"); // Normal mode: delete line
    await user.keyboard("i"); // Insert mode

    const targetText = "The quick brown fox jumps.";
    await user.keyboard(targetText);

    // Check if store updates
    await waitFor(() => {
      expect(useGameStore.getState().currentText).toBe(targetText);
    });

    await waitFor(() => {
      expect(useGameStore.getState().isCompleted).toBe(true);
    });
  });
});
