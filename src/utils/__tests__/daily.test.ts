import { describe, expect, it } from "vitest";
import {
  computeLineDiff,
  formatCountdown,
  formatDailyShareText,
  getAttemptTier,
  getMsUntilNextUtcMidnight,
  getScoreTier,
  getUtcDateString,
  isExactDailyMatch,
  normalizeForMatch,
} from "../daily";

describe("daily utilities", () => {
  it("formats UTC dates and countdowns accurately", () => {
    const sample = new Date("2026-06-15T23:58:30.000Z");
    expect(getUtcDateString(sample)).toBe("2026-06-15");
    expect(getMsUntilNextUtcMidnight(sample)).toBe(90_000);
    expect(formatCountdown(90_000)).toBe("00:01:30");
    expect(formatCountdown(0)).toBe("00:00:00");
  });

  it("matches multiline text strictly while ignoring only trailing newline and CRLF", () => {
    expect(normalizeForMatch("a\r\nb\r\n")).toBe("a\nb");
    expect(isExactDailyMatch("  indented\nline2\n", "  indented\nline2")).toBe(
      true,
    );
    // Preserves leading indentation differences
    expect(isExactDailyMatch("indented\nline2", "  indented\nline2")).toBe(
      false,
    );
    // Preserves trailing spaces inside lines
    expect(isExactDailyMatch("foo ", "foo")).toBe(false);
  });

  it("classifies scores and attempts into Par tiers", () => {
    expect(getScoreTier(8, 10)).toBe("under_par");
    expect(getScoreTier(10, 10)).toBe("par");
    expect(getScoreTier(11, 10)).toBe("close");
    expect(getScoreTier(13, 10)).toBe("close");
    expect(getScoreTier(14, 10)).toBe("over");

    expect(
      getAttemptTier({ outcome: "abandoned", keystrokes_count: 3 }, 10),
    ).toBe("abandoned");
    expect(getAttemptTier({ outcome: "solved", keystrokes_count: 9 }, 10)).toBe(
      "under_par",
    );
  });

  it("computes line-by-line diffs cleanly", () => {
    const diff = computeLineDiff("a\nwrong\nc\nextra", "a\nright\nc");
    expect(diff).toEqual([
      { lineNumber: 1, current: "a", target: "a", status: "same" },
      { lineNumber: 2, current: "wrong", target: "right", status: "modified" },
      { lineNumber: 3, current: "c", target: "c", status: "same" },
      { lineNumber: 4, current: "extra", target: null, status: "extra" },
    ]);

    const missingDiff = computeLineDiff("a", "a\nb");
    expect(missingDiff[1]).toEqual({
      lineNumber: 2,
      current: null,
      target: "b",
      status: "missing",
    });
  });

  it("formats spoiler-free share text for solved and failed runs", () => {
    const solvedText = formatDailyShareText({
      puzzleNumber: 14,
      par: 11,
      bestScore: 9,
      currentStreak: 6,
      url: "https://vim-gym.netlify.app/daily",
      attempts: [
        {
          attempt_number: 1,
          outcome: "solved",
          keystrokes_count: 17,
          keystrokes: Array(17).fill("x"),
        },
        {
          attempt_number: 2,
          outcome: "abandoned",
          keystrokes_count: 4,
          keystrokes: ["j", "d", "w", "u"],
        },
        {
          attempt_number: 3,
          outcome: "solved",
          keystrokes_count: 12,
          keystrokes: Array(12).fill("x"),
        },
        {
          attempt_number: 4,
          outcome: "solved",
          keystrokes_count: 9,
          keystrokes: Array(9).fill("x"),
        },
      ],
    });

    expect(solvedText).toBe(
      [
        "Vimdle #14 · 9 keys (Par 11) 🟪",
        "🔥 6-day streak · 4/5 tries",
        "",
        "1️⃣ 🟥 17",
        "2️⃣ ⬛ —",
        "3️⃣ 🟨 12",
        "4️⃣ 🟪 9",
        "",
        "https://vim-gym.netlify.app/daily",
      ].join("\n"),
    );

    const failedText = formatDailyShareText({
      puzzleNumber: 15,
      par: 8,
      bestScore: null,
      currentStreak: 0,
      url: "https://vim-gym.netlify.app/daily",
      attempts: Array.from({ length: 5 }, (_, i) => ({
        attempt_number: i + 1,
        outcome: "abandoned" as const,
        keystrokes_count: 2,
        keystrokes: ["j", "k"],
      })),
    });

    expect(failedText).toContain("Vimdle #15 · X/5 (Par 8) ⬛");
    expect(failedText).not.toContain("streak");
    expect(failedText).toContain("5/5 tries");
  });
});
