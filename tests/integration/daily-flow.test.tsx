import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../../src/App";
import { navigateTo } from "../../src/hooks/useRoute";
import { useDailyStore } from "../../src/store/useDailyStore";

vi.mock("../../src/lib/supabase/client", () => ({
  getSupabaseClient: () => null,
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });

describe("Vimdle (/daily) integration flow", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    localStorage.clear();
    // Skip first-visit help modal auto-open so we can interact immediately
    localStorage.setItem("vimdle-seen-help-v1", "1");
    useDailyStore.getState().clear();
    window.history.pushState({}, "", "/");
  });

  it("navigates to /daily, blocks paste, toggles diff, solves & locks in, reveals spoiler solution, shares, and enters free practice", async () => {
    const user = userEvent.setup();
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextSpy },
      configurable: true,
    });

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>,
    );

    // Unplayed indicator dot should be visible on the Vimdle nav button
    expect(screen.getByTestId("daily-unplayed-dot")).toBeInTheDocument();

    // Navigate to /daily via header switcher
    await user.click(screen.getByTestId("nav-daily"));

    await screen.findByTestId("daily-page", {}, { timeout: 5000 });
    expect(window.location.pathname).toBe("/daily");

    // Verify paste event is blocked on the daily editor
    const editor = await screen.findByRole("textbox", {}, { timeout: 5000 });
    const pasteEvent = new Event("paste", { bubbles: true, cancelable: true });
    editor.dispatchEvent(pasteEvent);
    expect(pasteEvent.defaultPrevented).toBe(true);

    // Toggle to Diff view in TargetDiffPanel
    await user.click(screen.getByRole("tab", { name: "Diff" }));
    expect(screen.getByTestId("line-diff-view")).toBeInTheDocument();

    // Simulate solving attempt 1 through the store with enough keystrokes >= min_keystrokes
    const puzzle = useDailyStore.getState().puzzle;
    expect(puzzle).not.toBeNull();
    if (!puzzle) return;

    for (let i = 0; i < puzzle.par; i++) {
      useDailyStore.getState().addKeyStroke("j");
    }
    await useDailyStore.getState().updateText(puzzle.target_text);

    // Attempt solved banner appears with Try Again & Lock In buttons
    await waitFor(() => {
      expect(screen.getByTestId("attempt-solved-banner")).toBeInTheDocument();
    });

    // Lock in score -> results modal opens
    await user.click(screen.getByTestId("lock-in-score-button"));
    await waitFor(() => {
      expect(screen.getByTestId("daily-results-modal")).toBeInTheDocument();
    });

    // Spoiler-guarded Par Solution should be hidden until toggled
    expect(
      screen.queryByTestId("par-solution-content"),
    ).not.toBeInTheDocument();
    await user.click(screen.getByTestId("reveal-par-solution-button"));
    expect(screen.getByTestId("par-solution-content")).toBeInTheDocument();

    // Share Result copies spoiler-free card to clipboard
    fireEvent.click(screen.getByTestId("share-daily-button"));
    await waitFor(() => {
      expect(writeTextSpy).toHaveBeenCalledTimes(1);
    });
    const sharedText = writeTextSpy.mock.calls[0][0] as string;
    expect(sharedText).toContain(`Vimdle #${puzzle.puzzle_number}`);
    expect(sharedText).toContain(`Par ${puzzle.par}`);
    expect(sharedText).toContain("1/5 tries");

    // Enter Free Practice mode
    await user.click(screen.getByTestId("enter-free-practice-button"));
    await waitFor(() => {
      expect(screen.getByTestId("free-practice-badge")).toBeInTheDocument();
    });

    // Unplayed dot should now be gone
    expect(screen.queryByTestId("daily-unplayed-dot")).not.toBeInTheDocument();

    // Navigate back to Gym (/) cleanly
    await user.click(screen.getByTestId("nav-gym"));
    expect(window.location.pathname).toBe("/");

    // Direct helper navigation check
    navigateTo("/daily");
    expect(window.location.pathname).toBe("/daily");
  }, 15_000);
});
