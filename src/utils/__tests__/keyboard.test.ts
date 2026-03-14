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

  it("normalizes special key combinations (e.g. Ctrl+R)", () => {
    expect(
      normalizeKeydownEvent({ key: "r", ctrlKey: true } as KeyboardEvent),
    ).toBe(SPECIAL_KEYS.CTRL_R);
    expect(
      normalizeKeydownEvent({ key: "R", ctrlKey: true } as KeyboardEvent),
    ).toBe(SPECIAL_KEYS.CTRL_R);
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
  });

  it("returns null for unknown multi-char sequences", () => {
    expect(normalizeVimKey("<C-x>")).toBeNull();
    expect(normalizeVimKey("<Unknown>")).toBeNull();
  });
});
