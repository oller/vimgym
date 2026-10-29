import { EditorView } from "@codemirror/view";
import { getCM, Vim } from "@replit/codemirror-vim";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NuqsAdapter } from "nuqs/adapters/react";
import { SPECIAL_KEYS } from "vimsplain";
import { beforeEach, describe, expect, it } from "vitest";
import { LEVELS } from "../../../data/levels";
import { useGameStore } from "../../../store/useGameStore";
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

  it("logs keys via Vim.handleKey fallback when keydown fires Unidentified (mobile)", async () => {
    renderWithRouter(<VimEditor />);

    const textbox = await screen.findByRole("textbox");
    const view = EditorView.findFromDOM(textbox);
    const cm = view ? getCM(view) : null;
    expect(cm).not.toBeNull();
    if (!cm) return;

    // Mobile keyboards fire keydown with key="Unidentified", then Vim.handleKey processes the key
    textbox.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Unidentified", bubbles: true }),
    );
    Vim.handleKey(cm, "w", "input");
    Vim.handleKey(cm, " ", "input");
    Vim.handleKey(cm, "<Esc>", "input");

    // " " maps internally in Vim to 'l' at depth > 1; only top-level keys should be logged
    expect(useGameStore.getState().history).toEqual([
      "w",
      " ",
      SPECIAL_KEYS.ESCAPE,
    ]);
  });

  it("resets current level with :e and navigates to level n with :e <n>", async () => {
    renderWithRouter(<VimEditor />);

    const textbox = await screen.findByRole("textbox");
    const view = EditorView.findFromDOM(textbox);
    const cm = view ? getCM(view) : null;
    expect(cm?.state.vim).toBeTruthy();
    if (!cm?.state.vim) return;
    const vimCm = cm as Parameters<typeof Vim.handleEx>[0];

    useGameStore.getState().addKeyStroke("x");
    Vim.handleEx(vimCm, "e");
    expect(useGameStore.getState().history).toEqual([]);
    expect(useGameStore.getState().resetCount).toBe(1);

    // Navigate to level 2 with :e 2
    Vim.handleEx(vimCm, "e 2");
    expect(useGameStore.getState().currentLevel).toBe(LEVELS[1].id);

    // Out-of-bounds or invalid :e args are ignored
    Vim.handleEx(vimCm, "e 999");
    Vim.handleEx(vimCm, "e abc");
    expect(useGameStore.getState().currentLevel).toBe(LEVELS[1].id);
  });

  it.each(["q", "wq", "qa"])(
    "powers off CRT when :%s is executed",
    async (cmd) => {
      renderWithRouter(<VimEditor />);

      const textbox = await screen.findByRole("textbox");
      const view = EditorView.findFromDOM(textbox);
      const cm = view ? getCM(view) : null;
      expect(cm?.state.vim).toBeTruthy();
      if (!cm?.state.vim) return;

      Vim.handleEx(cm as Parameters<typeof Vim.handleEx>[0], cmd);
      expect(useGameStore.getState().isPoweredOff).toBe(true);
    },
  );
});
