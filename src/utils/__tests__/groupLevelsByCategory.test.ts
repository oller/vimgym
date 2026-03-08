import { describe, expect, it } from "vitest";
import type { Level, LevelCategory } from "../../data/levels";
import {
  CATEGORY_ORDER,
  groupLevelsByCategory,
} from "../groupLevelsByCategory";

const makeLevel = (id: string, category: LevelCategory): Level => ({
  id,
  name: id,
  startText: "a",
  targetText: "b",
  description: "test",
  language: "markdown",
  category,
});

describe("groupLevelsByCategory", () => {
  it("groups levels by category", () => {
    const levels = [
      makeLevel("a", "Deletion & Insertion"),
      makeLevel("b", "Text Objects"),
      makeLevel("c", "Deletion & Insertion"),
    ];
    const groups = groupLevelsByCategory(levels);
    expect(groups[0].category).toBe("Deletion & Insertion");
    expect(groups[0].levels.map((l) => l.id)).toEqual(["a", "c"]);
    expect(groups[1].category).toBe("Text Objects");
  });

  it("returns groups in canonical CATEGORY_ORDER", () => {
    const levels = [
      makeLevel("macro", "Macros & Registers"),
      makeLevel("del", "Deletion & Insertion"),
    ];
    const groups = groupLevelsByCategory(levels);
    expect(groups[0].category).toBe("Deletion & Insertion");
    expect(groups[1].category).toBe("Macros & Registers");
  });

  it("omits categories with no levels", () => {
    const levels = [makeLevel("a", "Visual Mode")];
    const groups = groupLevelsByCategory(levels);
    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBe("Visual Mode");
  });

  it("returns empty array for empty input", () => {
    expect(groupLevelsByCategory([])).toEqual([]);
  });

  it("preserves level order within each category", () => {
    const levels = [
      makeLevel("first", "Search & Replace"),
      makeLevel("second", "Search & Replace"),
      makeLevel("third", "Search & Replace"),
    ];
    const groups = groupLevelsByCategory(levels);
    expect(groups[0].levels.map((l) => l.id)).toEqual([
      "first",
      "second",
      "third",
    ]);
  });

  it("CATEGORY_ORDER contains all six categories", () => {
    expect(CATEGORY_ORDER).toHaveLength(6);
    expect(CATEGORY_ORDER).toContain("Deletion & Insertion");
    expect(CATEGORY_ORDER).toContain("Text Objects");
    expect(CATEGORY_ORDER).toContain("Visual Mode");
    expect(CATEGORY_ORDER).toContain("Search & Replace");
    expect(CATEGORY_ORDER).toContain("Navigation & Editing");
    expect(CATEGORY_ORDER).toContain("Macros & Registers");
  });
});
