// @vitest-environment jsdom
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { vim } from "@replit/codemirror-vim";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { explainSequence } from "../src/index.js";
import { SPECIAL_KEYS } from "../src/vimsplain.types.js";

// Mapping from our SPECIAL_KEYS to CodeMirror key events
const keyMap: Record<string, string> = {
  [SPECIAL_KEYS.ESCAPE]: "Escape",
  [SPECIAL_KEYS.ENTER]: "Enter",
  [SPECIAL_KEYS.BACKSPACE]: "Backspace",
  [SPECIAL_KEYS.DELETE]: "Delete",
  [SPECIAL_KEYS.ARROW_UP]: "ArrowUp",
  [SPECIAL_KEYS.ARROW_DOWN]: "ArrowDown",
  [SPECIAL_KEYS.ARROW_LEFT]: "ArrowLeft",
  [SPECIAL_KEYS.ARROW_RIGHT]: "ArrowRight",
  [SPECIAL_KEYS.CTRL_R]: "r", // Need ctrlKey modifier
  [SPECIAL_KEYS.CTRL_W]: "w", // Need ctrlKey modifier
  [SPECIAL_KEYS.CTRL_O]: "o", // Need ctrlKey modifier
  [SPECIAL_KEYS.CTRL_I]: "i", // Need ctrlKey modifier
};

const activeViews: EditorView[] = [];

// Helper to simulate typing into CodeMirror and checking state
function createEditor(initialText: string) {
  const state = EditorState.create({
    doc: initialText,
    extensions: [vim()],
  });

  const parent = document.createElement("div");
  document.body.appendChild(parent);

  const view = new EditorView({
    state,
    parent,
  });

  // Need to focus to process vim keys
  view.focus();

  activeViews.push(view);
  return view;
}

// Helper to get KeyboardEvent code
function getKeyCode(char: string): string | undefined {
  if (/[a-zA-Z]/.test(char)) return `Key${char.toUpperCase()}`;
  if (/[0-9]/.test(char)) return `Digit${char}`;
  if (char === " ") return "Space";
  // Omit code for other symbols
  return undefined;
}

// Function to simulate typing a key sequence string (like "dw" or "ihello<Esc>")
function typeSequence(view: EditorView, sequence: string) {
  let i = 0;
  const keyMapEntries = Object.entries(keyMap);

  while (i < sequence.length) {
    let matchedSpecial = false;

    // Check for special keys like [Esc]
    for (const [vimsplainKey, cmKey] of keyMapEntries) {
      if (sequence.substring(i).startsWith(vimsplainKey)) {
        // Handle ctrl keys
        const isCtrl = vimsplainKey.includes("[C-");
        const codeStr = isCtrl ? `Key${cmKey.toUpperCase()}` : cmKey;

        const event = new KeyboardEvent("keydown", {
          key: cmKey,
          code: codeStr,
          ctrlKey: isCtrl,
          bubbles: true,
          cancelable: true,
        });
        view.contentDOM.dispatchEvent(event);

        i += vimsplainKey.length;
        matchedSpecial = true;
        break;
      }
    }

    if (!matchedSpecial) {
      const char = sequence[i];
      const code = getKeyCode(char);
      const eventInit: KeyboardEventInit = {
        key: char,
        shiftKey: char.toUpperCase() === char && /[a-zA-Z]/.test(char),
        bubbles: true,
        cancelable: true,
      };
      if (code) {
        eventInit.code = code;
      }
      const event = new KeyboardEvent("keydown", eventInit);
      const preventDefault = !view.contentDOM.dispatchEvent(event);
      if (!preventDefault) {
        view.dispatch(view.state.replaceSelection(char));
      }
      i++;
    }
  }
}

describe("Integration: Vimsplain vs CodeMirror", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    activeViews.forEach((view) => {
      view.destroy();
    });
    activeViews.length = 0;
  });

  it("verifies dw deletes a word in codemirror", () => {
    const initialText = "hello world test";
    const view = createEditor(initialText);

    // Initial state
    expect(view.state.doc.toString()).toBe(initialText);

    const sequence = "dw";

    // What does vimsplain say it will do?
    const result = explainSequence(sequence);
    expect(result.commands[0].explanation).toContain("delete");

    // Do it in codemirror
    typeSequence(view, sequence);

    // Verify CodeMirror actually deleted the word
    expect(view.state.doc.toString()).toBe("world test");
  });

  it("verifies i types text in codemirror", () => {
    const initialText = "world";
    const view = createEditor(initialText);

    const sequence = `ihello${SPECIAL_KEYS.ESCAPE}`;

    // What does vimsplain say it will do?
    const result = explainSequence(sequence);
    expect(result.commands[0].explanation).toBe("insert before cursor");
    expect(result.commands[1].explanation).toBe('type "hello"');

    // Do it in codemirror
    typeSequence(view, sequence);

    // Verify CodeMirror actually inserted the text
    expect(view.state.doc.toString()).toBe("helloworld");
  });

  it("verifies 3dw deletes three words in codemirror", () => {
    const initialText = "one two three four five";
    const view = createEditor(initialText);

    const sequence = "3dw";

    const result = explainSequence(sequence);
    expect(result.commands[0].explanation).toContain("unknown command '3'");
    expect(result.commands[1].explanation).toContain("delete");

    typeSequence(view, sequence);

    expect(view.state.doc.toString()).toBe("four five");
  });

  it("verifies lved deletes to end of word in visual mode in codemirror", () => {
    const initialText = "hello world test";
    const view = createEditor(initialText);

    const sequence = "lved";

    const result = explainSequence(sequence);
    // l = move right
    // v = start visual mode
    // e = to end of word
    // d = delete
    expect(result.commands[1].explanation).toContain("visual mode");
    expect(result.commands[2].explanation).toContain("end of word");
    expect(result.commands[3].explanation).toContain("delete");

    typeSequence(view, sequence);

    expect(view.state.doc.toString()).toBe("h world test");
  });

  it("verifies . repeats the last change in codemirror", () => {
    const initialText = "hello world test";
    const view = createEditor(initialText);

    const sequence = "dw.";

    const result = explainSequence(sequence);
    expect(result.commands[0].explanation).toContain("delete");
    expect(result.commands[1].explanation).toContain("repeat");

    typeSequence(view, sequence);

    // dw deletes "hello ", . deletes "world "
    expect(view.state.doc.toString()).toBe("test");
  });
});
