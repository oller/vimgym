import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NuqsAdapter } from "nuqs/adapters/react";
import { beforeEach, describe, expect, it } from "vitest";
import { LEVELS } from "../../../data/levels";
import { useGameStore } from "../../../store/useGameStore";
import { VimEditor } from "../VimEditor";

const renderWithRouter = (component: React.ReactNode) => {
  return render(<NuqsAdapter>{component}</NuqsAdapter>);
};

describe("VimEditor Comment Operator", () => {
  beforeEach(() => {
    // Use a level that has javascript to test comments
    const jsLevel =
      LEVELS.find((l) => l.language === "javascript") || LEVELS[0];
    useGameStore.getState().setLevel(jsLevel.id);
  });

  it("toggles line comment with 'gcc'", async () => {
    const user = userEvent.setup();
    renderWithRouter(<VimEditor />);

    const editor = await screen.findByRole("textbox");
    await user.click(editor);

    const initialText = useGameStore.getState().currentText;

    // Type 'gcc' to comment the current line
    // gcc is a shortcut for gc with line motion
    await user.keyboard("gcc");

    const commentedText = useGameStore.getState().currentText;

    // Verify it changed
    expect(commentedText).not.toBe(initialText);

    // For JS, it should start with // (considering it might have leading spaces)
    expect(commentedText.trim()).toMatch(/^\/\//);

    // Type 'gcc' again to uncomment
    await user.keyboard("gcc");
    expect(useGameStore.getState().currentText).toBe(initialText);
  });
});
