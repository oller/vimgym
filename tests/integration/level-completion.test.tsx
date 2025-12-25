import { act, render } from "@testing-library/react";
import React from "react";
import { userEvent } from "@testing-library/user-event";
import { expect, test } from "vitest";
import App from "../../src/App";

test("complete level 1 with keystrokes fsldt. and verify score is 6", async () => {
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

  // Type the keystrokes: f s l d t .
  // These should work in vim normal mode
  await act(async () => {
    await userEvent.keyboard("fsldt.");
  });

  // Log final state
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
  expect(keystrokeCount?.textContent).toContain("Completed in 6 keystrokes");

  // Check that the best score is also 6
  const bestScore = container.querySelector('[data-testid="best-score"]');
  expect(bestScore?.textContent).toContain("Best: 6");
});
