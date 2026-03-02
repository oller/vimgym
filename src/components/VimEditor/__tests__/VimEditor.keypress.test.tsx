import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NuqsAdapter } from "nuqs/adapters/react";
import { beforeEach, describe, expect, it } from "vitest";
import { LEVELS } from "../../../data/levels";
import { useGameStore } from "../../../store/useGameStore";
import { SPECIAL_KEYS } from "../../../utils/vimsplain.types";
import { VimEditor } from "../VimEditor";

const renderWithRouter = (component: React.ReactNode) => {
  return render(<NuqsAdapter>{component}</NuqsAdapter>);
};

describe("VimEditor Keypress Logging", () => {
  beforeEach(() => {
    // Reset store and history
    useGameStore.setState({
      currentLevel: LEVELS[0].id,
      startText: "Test text",
      targetText: "Target",
      currentText: "Test text",
      history: [],
      isCompleted: false,
      resetCount: 0,
      isPoweredOff: false,
    });
  });

  it("logs keypresses from insert mode", async () => {
    const user = userEvent.setup();
    renderWithRouter(<VimEditor />);

    // Get the editor
    const textbox = await screen.findByRole("textbox");
    await user.click(textbox);

    // Simulate typing
    const keys = ["h", "e", "l", "l", "o"];
    await user.keyboard("hello");

    // Check that all keys were logged
    const history = useGameStore.getState().history;
    // Note: userEvent.keyboard handles the sequence.
    // If it types 'hello', it will fire keydown for each character.
    expect(history).toEqual(keys);
  });

  it("logs special keys with normalized names", async () => {
    const user = userEvent.setup();
    renderWithRouter(<VimEditor />);

    const textbox = await screen.findByRole("textbox");
    await user.click(textbox);

    // Test special key normalization
    await user.keyboard("{Escape}{Enter}{Backspace} ");

    const history = useGameStore.getState().history;
    expect(history).toEqual([
      SPECIAL_KEYS.ESCAPE,
      SPECIAL_KEYS.ENTER,
      SPECIAL_KEYS.BACKSPACE,
      " ",
    ]);
  });

  it("does not log modifier keys", async () => {
    const user = userEvent.setup();
    renderWithRouter(<VimEditor />);

    const textbox = await screen.findByRole("textbox");
    await user.click(textbox);

    // These should be filtered out
    await user.keyboard("{Shift}{Control}{Alt}{Meta}{CapsLock}{Tab}");

    // History should be empty
    const history = useGameStore.getState().history;
    expect(history).toEqual([]);
  });

  it("logs mixed alphanumeric and special characters", async () => {
    const user = userEvent.setup();
    renderWithRouter(<VimEditor />);

    const textbox = await screen.findByRole("textbox");
    await user.click(textbox);

    const typed = "ab12!@#";
    await user.keyboard(typed);

    const history = useGameStore.getState().history;
    expect(history).toEqual([...typed]);
  });

  it("clears history on reset", () => {
    const { addKeyStroke, resetLevel } = useGameStore.getState();

    // Add some keystrokes
    addKeyStroke("a");
    addKeyStroke("b");
    addKeyStroke("c");

    expect(useGameStore.getState().history).toEqual(["a", "b", "c"]);

    // Reset should clear history
    resetLevel();

    expect(useGameStore.getState().history).toEqual([]);
  });
});
