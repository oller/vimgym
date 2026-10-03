import { SPECIAL_KEYS } from "vimsplain";
import { describe, expect, it } from "vitest";
import {
  formatKeyForDisplay,
  normalizeKeydownEvent,
  normalizeVimKey,
} from "../keyboard";

describe("formatKeyForDisplay", () => {
  it("formats single alphanumeric characters correctly", () => {
    expect(formatKeyForDisplay("a")).toBe("a");
    expect(formatKeyForDisplay("1")).toBe("1");
    expect(formatKeyForDisplay("Z")).toBe("Z");
  });

  it("replaces spaces with visible symbol", () => {
    expect(formatKeyForDisplay(" ")).toBe("␣");
    expect(formatKeyForDisplay("f ")).toBe("f␣");
    expect(formatKeyForDisplay("  ")).toBe("␣␣");
  });

  it("formats special keys correctly", () => {
    expect(formatKeyForDisplay("[Up]")).toBe("↑");
    expect(formatKeyForDisplay("[Down]")).toBe("↓");
    expect(formatKeyForDisplay("[Left]")).toBe("←");
    expect(formatKeyForDisplay("[Right]")).toBe("→");
    expect(formatKeyForDisplay("[Enter]")).toBe("↵");
    expect(formatKeyForDisplay("[Esc]")).toBe("Esc");
    expect(formatKeyForDisplay("[Backspace]")).toBe("⌫");
    expect(formatKeyForDisplay("[Delete]")).toBe("Del");
    expect(formatKeyForDisplay("[C-r]")).toBe("Ctrl+R");
    expect(formatKeyForDisplay("[C-d]")).toBe("Ctrl+D");
    expect(formatKeyForDisplay("[C-u]")).toBe("Ctrl+U");
    expect(formatKeyForDisplay("[C-f]")).toBe("Ctrl+F");
    expect(formatKeyForDisplay("[C-b]")).toBe("Ctrl+B");
    expect(formatKeyForDisplay("[C-v]")).toBe("Ctrl+V");
    expect(formatKeyForDisplay("[C-w]")).toBe("Ctrl+W");
    expect(formatKeyForDisplay("[C-o]")).toBe("Ctrl+O");
    expect(formatKeyForDisplay("[C-i]")).toBe("Ctrl+I");
    expect(formatKeyForDisplay("[C-c]")).toBe("Ctrl+C");
    expect(formatKeyForDisplay("[C-e]")).toBe("Ctrl+E");
    expect(formatKeyForDisplay("[C-y]")).toBe("Ctrl+Y");
  });

  it("formats mixed sequences correctly", () => {
    expect(formatKeyForDisplay("d2[Up]")).toBe("d2↑");
    expect(formatKeyForDisplay("[C-r]u")).toBe("Ctrl+Ru");
    expect(formatKeyForDisplay("i hello [Esc]")).toBe("i␣hello␣Esc");
  });

  it("handles repeated special keys", () => {
    expect(formatKeyForDisplay("[Up][Up]")).toBe("↑↑");
    expect(formatKeyForDisplay("[Left] [Right]")).toBe("←␣→");
  });

  it("leaves unknown brackets alone", () => {
    expect(formatKeyForDisplay("[Unknown]")).toBe("[Unknown]");
    expect(formatKeyForDisplay("Array[]")).toBe("Array[]");
  });
});

describe("normalizeKeydownEvent", () => {
  it("returns null for modifier keys", () => {
    expect(normalizeKeydownEvent({ key: "Shift" } as KeyboardEvent)).toBeNull();
    expect(
      normalizeKeydownEvent({ key: "Control" } as KeyboardEvent),
    ).toBeNull();
    expect(normalizeKeydownEvent({ key: "Alt" } as KeyboardEvent)).toBeNull();
    expect(normalizeKeydownEvent({ key: "Meta" } as KeyboardEvent)).toBeNull();
    expect(
      normalizeKeydownEvent({ key: "CapsLock" } as KeyboardEvent),
    ).toBeNull();
    expect(normalizeKeydownEvent({ key: "Tab" } as KeyboardEvent)).toBeNull();
  });

  it("returns null for shortcuts with Meta (Mac Cmd) or Alt", () => {
    expect(
      normalizeKeydownEvent({ key: "r", metaKey: true } as KeyboardEvent),
    ).toBeNull();
    expect(
      normalizeKeydownEvent({ key: "c", metaKey: true } as KeyboardEvent),
    ).toBeNull();
    expect(
      normalizeKeydownEvent({ key: "w", metaKey: true } as KeyboardEvent),
    ).toBeNull();
    expect(
      normalizeKeydownEvent({ key: "Tab", altKey: true } as KeyboardEvent),
    ).toBeNull();
    expect(
      normalizeKeydownEvent({ key: "d", altKey: true } as KeyboardEvent),
    ).toBeNull();
  });

  it("normalizes special key combinations (e.g. Ctrl+R, Ctrl+D, Ctrl+U)", () => {
    expect(
      normalizeKeydownEvent({ key: "r", ctrlKey: true } as KeyboardEvent),
    ).toBe(SPECIAL_KEYS.CTRL_R);
    expect(
      normalizeKeydownEvent({ key: "R", ctrlKey: true } as KeyboardEvent),
    ).toBe(SPECIAL_KEYS.CTRL_R);
    expect(
      normalizeKeydownEvent({ key: "d", ctrlKey: true } as KeyboardEvent),
    ).toBe(SPECIAL_KEYS.CTRL_D);
    expect(
      normalizeKeydownEvent({ key: "u", ctrlKey: true } as KeyboardEvent),
    ).toBe(SPECIAL_KEYS.CTRL_U);
    expect(
      normalizeKeydownEvent({ key: "f", ctrlKey: true } as KeyboardEvent),
    ).toBe(SPECIAL_KEYS.CTRL_F);
    expect(
      normalizeKeydownEvent({ key: "b", ctrlKey: true } as KeyboardEvent),
    ).toBe(SPECIAL_KEYS.CTRL_B);
  });

  it("leaves unmapped modifier combinations alone (returning original key string)", () => {
    expect(
      normalizeKeydownEvent({ key: "a", ctrlKey: true } as KeyboardEvent),
    ).toBe("a");
  });

  it("normalizes standalone special keys", () => {
    expect(normalizeKeydownEvent({ key: "Escape" } as KeyboardEvent)).toBe(
      SPECIAL_KEYS.ESCAPE,
    );
    expect(normalizeKeydownEvent({ key: "Enter" } as KeyboardEvent)).toBe(
      SPECIAL_KEYS.ENTER,
    );
    expect(normalizeKeydownEvent({ key: "Backspace" } as KeyboardEvent)).toBe(
      SPECIAL_KEYS.BACKSPACE,
    );
    expect(normalizeKeydownEvent({ key: "Delete" } as KeyboardEvent)).toBe(
      SPECIAL_KEYS.DELETE,
    );
    expect(normalizeKeydownEvent({ key: "ArrowUp" } as KeyboardEvent)).toBe(
      SPECIAL_KEYS.ARROW_UP,
    );
    expect(normalizeKeydownEvent({ key: "ArrowDown" } as KeyboardEvent)).toBe(
      SPECIAL_KEYS.ARROW_DOWN,
    );
    expect(normalizeKeydownEvent({ key: "ArrowLeft" } as KeyboardEvent)).toBe(
      SPECIAL_KEYS.ARROW_LEFT,
    );
    expect(normalizeKeydownEvent({ key: "ArrowRight" } as KeyboardEvent)).toBe(
      SPECIAL_KEYS.ARROW_RIGHT,
    );
  });

  it("returns the original key for normal alphanumeric inputs", () => {
    expect(normalizeKeydownEvent({ key: "a" } as KeyboardEvent)).toBe("a");
    expect(normalizeKeydownEvent({ key: "Z" } as KeyboardEvent)).toBe("Z");
    expect(normalizeKeydownEvent({ key: "1" } as KeyboardEvent)).toBe("1");
    expect(normalizeKeydownEvent({ key: " " } as KeyboardEvent)).toBe(" ");
  });
});

describe("normalizeVimKey", () => {
  it("passes single characters through unchanged", () => {
    expect(normalizeVimKey("w")).toBe("w");
    expect(normalizeVimKey("j")).toBe("j");
    expect(normalizeVimKey("D")).toBe("D");
    expect(normalizeVimKey(" ")).toBe(" ");
    expect(normalizeVimKey("1")).toBe("1");
  });

  it("maps vim special keys to VimGym format", () => {
    expect(normalizeVimKey("<Esc>")).toBe(SPECIAL_KEYS.ESCAPE);
    expect(normalizeVimKey("<CR>")).toBe(SPECIAL_KEYS.ENTER);
    expect(normalizeVimKey("<BS>")).toBe(SPECIAL_KEYS.BACKSPACE);
    expect(normalizeVimKey("<Del>")).toBe(SPECIAL_KEYS.DELETE);
    expect(normalizeVimKey("<Up>")).toBe(SPECIAL_KEYS.ARROW_UP);
    expect(normalizeVimKey("<Down>")).toBe(SPECIAL_KEYS.ARROW_DOWN);
    expect(normalizeVimKey("<Left>")).toBe(SPECIAL_KEYS.ARROW_LEFT);
    expect(normalizeVimKey("<Right>")).toBe(SPECIAL_KEYS.ARROW_RIGHT);
    expect(normalizeVimKey("<C-r>")).toBe(SPECIAL_KEYS.CTRL_R);
    expect(normalizeVimKey("<C-d>")).toBe(SPECIAL_KEYS.CTRL_D);
    expect(normalizeVimKey("<C-u>")).toBe(SPECIAL_KEYS.CTRL_U);
    expect(normalizeVimKey("<C-f>")).toBe(SPECIAL_KEYS.CTRL_F);
    expect(normalizeVimKey("<C-b>")).toBe(SPECIAL_KEYS.CTRL_B);
    expect(normalizeVimKey("<C-v>")).toBe(SPECIAL_KEYS.CTRL_V);
    expect(normalizeVimKey("<C-w>")).toBe(SPECIAL_KEYS.CTRL_W);
    expect(normalizeVimKey("<C-o>")).toBe(SPECIAL_KEYS.CTRL_O);
    expect(normalizeVimKey("<C-i>")).toBe(SPECIAL_KEYS.CTRL_I);
    expect(normalizeVimKey("<C-c>")).toBe(SPECIAL_KEYS.CTRL_C);
    expect(normalizeVimKey("<C-e>")).toBe(SPECIAL_KEYS.CTRL_E);
    expect(normalizeVimKey("<C-y>")).toBe(SPECIAL_KEYS.CTRL_Y);
  });

  it("returns null for unknown multi-char sequences", () => {
    expect(normalizeVimKey("<C-x>")).toBeNull();
    expect(normalizeVimKey("<Unknown>")).toBeNull();
  });
});
