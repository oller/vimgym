import { describe, expect, it } from "vitest";
import { cn } from "../cn";

describe("cn", () => {
  it("combines multiple string classes", () => {
    expect(cn("class1", "class2", "class3")).toBe("class1 class2 class3");
  });

  it("filters out falsy values", () => {
    expect(cn("class1", false, null, undefined, "", "class2")).toBe(
      "class1 class2",
    );
  });

  it("handles arrays of classes", () => {
    expect(cn(["class1", "class2"], "class3")).toBe("class1 class2 class3");
  });

  it("handles objects for conditional classes", () => {
    expect(cn({ class1: true, class2: false, class3: true })).toBe(
      "class1 class3",
    );
  });

  it("merges conflicting Tailwind classes", () => {
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
  });

  it("merges complex Tailwind classes", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
    expect(cn("text-lg", "text-sm")).toBe("text-sm");
  });

  it("combines non-conflicting Tailwind classes", () => {
    expect(cn("bg-red-500", "text-white")).toBe("bg-red-500 text-white");
  });

  it("handles mixed inputs", () => {
    expect(
      cn(
        "base",
        ["array-class"],
        { "object-class": true, "false-class": false },
        false,
        "final-class",
      ),
    ).toBe("base array-class object-class final-class");
  });

  it("returns empty string for no valid inputs", () => {
    expect(cn(false, null, undefined, "")).toBe("");
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });

  it("handles numbers as classes", () => {
    expect(cn("class1", 123, "class2")).toBe("class1 123 class2");
  });

  it("merges responsive Tailwind classes correctly", () => {
    expect(cn("md:text-lg", "text-sm")).toBe("md:text-lg text-sm");
  });
});
