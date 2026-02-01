import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import App from "../../src/App";

// Mock Supabase client to prevent network requests
vi.mock("../../src/lib/supabase/client", () => ({
  getSupabaseClient: () => ({
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

test("complete level 1 with keystrokes fsldt. and verify score is 6", async () => {
  // Note: This integration test may produce React act() warnings about
  // Transitioner, MatchesInner (React Router internals), and CodeMirror.
  // These warnings are unavoidable because:
  // 1. They come from third-party library internal components
  // 2. Cascading state updates happen across multiple render cycles
  // 3. The user interactions are already properly wrapped in act()
  //
  // Mount the app
  render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );

  const editor = await screen.findByRole("textbox", {}, { timeout: 3000 });

  // Focus the editor by clicking on it
  await act(async () => {
    await userEvent.click(editor);
  });

  const solution = "fsldt.";

  // Type the keystrokes: f s l d t .
  // These should work in vim normal mode
  await act(async () => {
    await userEvent.keyboard(solution);
  });

  // Wait for the completion message to appear in the DOM
  const completeMessage = await waitFor(
    () => screen.getByRole("heading", { level: 2, name: "Level Complete" }),
    { timeout: 3000 },
  );

  // Check that the level is marked as complete
  expect(document.contains(completeMessage)).toBe(true);

  // Check that the keystroke count is 6
  const keystrokeCount = screen.getByLabelText("keystrokes");
  expect(keystrokeCount?.textContent).toContain(`${solution.length}`);

  // Check that the best score is also 6
  // const bestScore = screen.getByLabelText("best score");
  // expect(bestScore?.textContent).toContain(`Your best: ${solution.length}`);

  // Type extra characters after completion
  await act(async () => {
    await userEvent.keyboard("jjkk");
  });

  // Verify count is STILL 6 (should not increase)
  expect(keystrokeCount?.textContent).toContain(`${solution.length}`);
});
