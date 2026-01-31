import { describe, expect, it } from "vitest";
import { formatKeyForDisplay } from "../keyboard";

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
