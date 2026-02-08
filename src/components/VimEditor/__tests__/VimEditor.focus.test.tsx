import { act, render, screen, waitFor } from "@testing-library/react";
import { NuqsAdapter } from "nuqs/adapters/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LEVELS } from "../../../data/levels";
import { useGameStore } from "../../../store/useGameStore";
import { VimEditor } from "../VimEditor";

// Mock scrollIntoView since it's not implemented in JSDOM
window.HTMLElement.prototype.scrollIntoView = vi.fn();

const renderWithRouter = (component: React.ReactNode) => {
  return render(<NuqsAdapter>{component}</NuqsAdapter>);
};

describe("VimEditor Focus", () => {
  beforeEach(() => {
    useGameStore.getState().setLevel(LEVELS[0].id);
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
    act(() => {
      useGameStore.getState().setLevel(LEVELS[1].id);
    });

    // It should regain focus
    // We need to re-query because the component remounted (key={currentLevel})
    await waitFor(async () => {
      const newEditor = await screen.findByRole("textbox");
      expect(newEditor).toHaveFocus();
      expect(newEditor).not.toBe(editor); // Ensure it's a new instance
    });
  });
});
