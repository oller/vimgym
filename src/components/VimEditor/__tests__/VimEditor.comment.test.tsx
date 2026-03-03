import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NuqsAdapter } from "nuqs/adapters/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "../../../store/useGameStore";
import { VimEditor } from "../VimEditor";

const renderWithRouter = (component: React.ReactNode) => {
  return render(<NuqsAdapter>{component}</NuqsAdapter>);
};

describe("VimEditor Comment Operator", () => {
  const startText = "const a = 1;\nconst b = 2;\nconst c = 3;\nconst d = 4;";

  beforeEach(() => {
    useGameStore.getState().setLevel("comment-block");
    useGameStore.setState({
      startText: startText,
      currentText: startText,
      isCompleted: false,
    });
  });

  it("toggles line comment with 'gcc'", async () => {
    const user = userEvent.setup();
    renderWithRouter(<VimEditor />);

    const editor = await screen.findByRole("textbox");
    await user.click(editor);

    // Type 'gcc' to comment the first line
    await user.keyboard("gcc");

    const commentedText = useGameStore.getState().currentText;
    const lines = commentedText.split("\n");

    // Line 1 should be commented
    expect(lines[0]).toMatch(/^\/\/ ?const a = 1;/);
    // Line 2 should NOT be commented
    expect(lines[1]).toBe("const b = 2;");

    // Type 'gcc' again to uncomment
    await user.keyboard("gcc");
    expect(useGameStore.getState().currentText).toBe(startText);
  });

  it("comments all 4 lines with 'gc4j'", async () => {
    const user = userEvent.setup();
    renderWithRouter(<VimEditor />);

    const editor = await screen.findByRole("textbox");
    await user.click(editor);

    // gc4j should comment all lines
    await user.keyboard("gc4j");

    const currentText = useGameStore.getState().currentText;
    const lines = currentText.split("\n");

    expect(lines).toHaveLength(4);
    expect(lines[0]).toMatch(/^\/\/ ?const a = 1;/);
    expect(lines[1]).toMatch(/^\/\/ ?const b = 2;/);
    expect(lines[2]).toMatch(/^\/\/ ?const c = 3;/);
    expect(lines[3]).toMatch(/^\/\/ ?const d = 4;/);
  });

  it("comments all 4 lines with Visual Line mode 'Vgc'", async () => {
    const user = userEvent.setup();
    renderWithRouter(<VimEditor />);

    const editor = await screen.findByRole("textbox");
    await user.click(editor);

    // Vjjj selects 4 lines, then gc
    await user.keyboard("Vjjjgc");

    const currentText = useGameStore.getState().currentText;
    const lines = currentText.split("\n");

    expect(lines).toHaveLength(4);
    expect(lines[0]).toMatch(/^\/\/ ?const a = 1;/);
    expect(lines[1]).toMatch(/^\/\/ ?const b = 2;/);
    expect(lines[2]).toMatch(/^\/\/ ?const c = 3;/);
    expect(lines[3]).toMatch(/^\/\/ ?const d = 4;/);
  });
});
