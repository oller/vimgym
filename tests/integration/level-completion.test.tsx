import { userEvent } from "@vitest/browser/context";
import { expect, test } from "vitest";

test("complete level 1 with keystrokes fsldt. and verify score is 6", async () => {
	// Mount the app
	const { render } = await import("@testing-library/react");
	const { default: App } = await import("../../src/App");

	const { container } = render(<App />);

	// Wait for the editor to be present
	await new Promise((resolve) => setTimeout(resolve, 2000));

	const editor = container.querySelector(".cm-content");
	expect(editor).toBeTruthy();

	// Log initial state
	console.log("Initial text:", editor?.textContent);

	// Focus the editor by clicking on it
	await userEvent.click(editor!);

	// Wait a bit after focus
	await new Promise((resolve) => setTimeout(resolve, 200));

	// Type the keystrokes: f s l d t .
	// These should work in vim normal mode
	await userEvent.keyboard("f");
	await new Promise((resolve) => setTimeout(resolve, 100));
	await userEvent.keyboard("s");
	await new Promise((resolve) => setTimeout(resolve, 100));
	await userEvent.keyboard("l");
	await new Promise((resolve) => setTimeout(resolve, 100));
	await userEvent.keyboard("d");
	await new Promise((resolve) => setTimeout(resolve, 100));
	await userEvent.keyboard("t");
	await new Promise((resolve) => setTimeout(resolve, 100));
	await userEvent.keyboard(".");

	// Wait for state to settle
	await new Promise((resolve) => setTimeout(resolve, 1000));

	// Log final state
	console.log("Final text:", editor?.textContent);
	console.log(
		"Complete message:",
		container.querySelector('[data-testid="level-complete"]'),
	);
	console.log(
		"Keystroke count:",
		container.querySelector('[data-testid="keystroke-count"]')?.textContent,
	);
	console.log(
		"Best score:",
		container.querySelector('[data-testid="best-score"]')?.textContent,
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
	expect(keystrokeCount?.textContent).toContain("6 keystrokes");

	// Check that the best score is also 6
	const bestScore = container.querySelector('[data-testid="best-score"]');
	expect(bestScore?.textContent).toContain("Best: 6");
});
