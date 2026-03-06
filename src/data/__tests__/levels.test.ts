import { describe, expect, it } from "vitest";
import { getLevel, LEVELS } from "../levels";

describe("Level Data Integrity", () => {
  it("every level has a unique id", () => {
    const ids = LEVELS.map((l) => l.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("no level has startText equal to targetText", () => {
    for (const level of LEVELS) {
      expect(
        level.startText,
        `Level "${level.id}" has identical texts`,
      ).not.toBe(level.targetText);
    }
  });

  it("every level has non-empty required fields", () => {
    for (const level of LEVELS) {
      expect(level.id.length, `${level.id} missing id`).toBeGreaterThan(0);
      expect(level.name.length, `${level.id} missing name`).toBeGreaterThan(0);
      expect(
        level.startText.length,
        `${level.id} missing startText`,
      ).toBeGreaterThan(0);
      expect(
        level.targetText.length,
        `${level.id} missing targetText`,
      ).toBeGreaterThan(0);
      expect(
        level.description.length,
        `${level.id} missing description`,
      ).toBeGreaterThan(0);
    }
  });

  it("every level has a valid language", () => {
    const validLanguages = ["html", "javascript", "markdown", "json"];
    for (const level of LEVELS) {
      expect(
        validLanguages,
        `Level "${level.id}" has invalid language "${level.language}"`,
      ).toContain(level.language);
    }
  });

  it("getLevel returns the correct level by id", () => {
    const level = getLevel("delete-words");
    expect(level).toBeDefined();
    expect(level?.name).toBe("Delete Words");
  });

  it("getLevel returns undefined for unknown id", () => {
    expect(getLevel("nonexistent-level")).toBeUndefined();
  });
});
