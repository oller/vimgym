import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NuqsAdapter } from "nuqs/adapters/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "../../../store/useGameStore";
import { VimEditor } from "../VimEditor";

const renderWithRouter = (component: React.ReactNode) => {
  return render(<NuqsAdapter>{component}</NuqsAdapter>);
};

// Mock getCM to avoid null issues in tests if JSDOM doesn't support full CM
// However, integration tests with real CM are better.
// We will try running it "real" first.

describe("VimEditor Integration", () => {
  beforeEach(() => {
    useGameStore.getState().setLevel(1);

    // HTMLElement.prototype.getClientRects might define layout
    // Is used by some CM measurements
  });

  it("handles normal mode delete and insert mode typing correctly", async () => {
    const user = userEvent.setup();
    renderWithRouter(<VimEditor />);

    // Wait for editor to be ready (simplified sync)
    const editor = await screen.findByRole("textbox");

    // 1. Normal mode 'dd' to clear line
    // We might need to ensure focus. CodeMirror usually grabs focus.
    await user.click(editor);
    await user.keyboard("dd");

    // Verify emptiness via store or DOM ??
    // CodeMirror's DOM is complex. Checking store is easier for data flow.
    expect(useGameStore.getState().currentText).toBe("");

    // 2. Type a long sentence in Insert mode
    // 'i' to enter insert mode
    await user.keyboard("i");

    const longSentence =
      "The quick brown fox jumps over the lazy dog repeatedly.";
    await user.keyboard(longSentence);

    // Verify text in store
    // If bug exists, this might be partial or empty
    expect(useGameStore.getState().currentText).toBe(longSentence);
  });
});
