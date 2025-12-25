import { act, render, waitFor } from "@testing-library/react";
import React from "react";
import { userEvent } from "@testing-library/user-event";
import { expect, test } from "vitest";
import App from "../../src/App";

test("complete level 1 with keystrokes fsldt. and verify score is 6", async () => {
  // Note: This integration test may produce React act() warnings about
  // Transitioner, MatchesInner (React Router internals), and CodeMirror.
  // These warnings are unavoidable because:
  // 1. They come from third-party library internal components
  // 2. Cascading state updates happen across multiple render cycles
  // 3. The user interactions are already properly wrapped in act()
  //
  // Mount the app
  const { container } = render(<App />);

  // Wait for the editor to be present
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const editor = container.querySelector(".cm-content");
  expect(editor).toBeTruthy();

  if (!editor) throw new Error("Editor container not found");

  // Log initial state
  console.log("Initial text:", editor?.textContent);

  // Focus the editor by clicking on it
  await act(async () => {
    await userEvent.click(editor);
  });

  // Wait a bit after focus
  await new Promise((resolve) => setTimeout(resolve, 200));

  const solution = "fsldt.";

  // Type the keystrokes: f s l d t .
  // These should work in vim normal mode
  await act(async () => {
    await userEvent.keyboard(solution);
  });

  // Wait for the completion message to appear in the DOM
  await waitFor(
    () => {
      const completeMessage = container.querySelector(
        '[data-testid="level-complete"]',
      );
      expect(completeMessage).toBeTruthy();
    },
    { timeout: 3000 },
  );

  // Check that the level is marked as complete
  const completeMessage = container.querySelector(
    '[data-testid="level-complete"]',
  );
  expect(completeMessage).toBeTruthy();
  expect(completeMessage?.textContent).toContain("Level Complete");

  // Check that the keystroke count is 6
  const keystrokeCount = container.querySelector(
    '[data-testid="keystroke-count"]',
  );
  expect(keystrokeCount?.textContent).toContain(
    `Completed in ${solution.length} keystrokes`,
  );

  // Check that the best score is also 6
  const bestScore = container.querySelector('[data-testid="best-score"]');
  expect(bestScore?.textContent).toContain(`Best: ${solution.length}`);
});
