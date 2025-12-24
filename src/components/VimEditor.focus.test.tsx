import {
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";
import { useGameStore } from "../store/useGameStore";
import { VimEditor } from "./VimEditor";

// Mock scrollIntoView since it's not implemented in JSDOM
window.HTMLElement.prototype.scrollIntoView = vi.fn();

const renderWithRouter = (component: React.ReactNode) => {
  const rootRoute = createRootRoute({
    component: () => component,
  });
  const router = createRouter({ routeTree: rootRoute });
  return render(<RouterProvider router={router} />);
};

describe("VimEditor Focus", () => {
  beforeEach(() => {
    useGameStore.getState().setLevel(1);
  });

  it("focuses editor on level change", async () => {
    renderWithRouter(<VimEditor />);

    const editor = await screen.findByRole("textbox");

    // Initial focus check (autoFocus prop)
    expect(editor).toHaveFocus();

    // Blur it
    editor.blur();
    expect(editor).not.toHaveFocus();

    // Change level
    useGameStore.getState().setLevel(2);

    // It should regain focus
    // We need to re-query because the component remounted (key={currentLevel})
    await waitFor(async () => {
      const newEditor = await screen.findByRole("textbox");
      expect(newEditor).toHaveFocus();
      expect(newEditor).not.toBe(editor); // Ensure it's a new instance
    });
  });
});
