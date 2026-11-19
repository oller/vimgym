import { EditorSelection } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SPECIAL_KEYS } from "vimsplain";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BaseVimEditor } from "../../components/VimEditor/BaseVimEditor";
import { isExactDailyMatch } from "../../utils/daily";
import { DAILY_PUZZLE_SEEDS, getFallbackDailyPuzzle } from "../dailyPuzzles";

function toUserEventSequence(keystrokes: string[]): string {
  return keystrokes
    .map((key) => {
      if (key === SPECIAL_KEYS.ESCAPE) return "{Escape}";
      if (key === SPECIAL_KEYS.ENTER) return "{Enter}";
      if (key === SPECIAL_KEYS.BACKSPACE) return "{Backspace}";
      if (key === "{") return "{{";
      if (key === "[") return "[[";
      return key;
    })
    .join("");
}

describe("DAILY_PUZZLE_SEEDS", () => {
  beforeEach(() => {
    // In jsdom, all DOM rects have height=0 which makes CodeMirror's layout-based
    // moveVertically jump to EOF. Stub moveVertically to move 1 document line,
    // matching real browser geometry for unwrapped lines.
    vi.spyOn(EditorView.prototype, "moveVertically").mockImplementation(
      function (this: EditorView, start, forward) {
        const doc = this.state.doc;
        const curLine = doc.lineAt(start.head);
        const targetLineNum = forward
          ? Math.min(curLine.number + 1, doc.lines)
          : Math.max(curLine.number - 1, 1);
        const targetLine = doc.line(targetLineNum);
        const ch = Math.min(start.head - curLine.from, targetLine.length);
        return EditorSelection.cursor(targetLine.from + ch);
      },
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("contains 21 unique, well-formed starter puzzles", () => {
    expect(DAILY_PUZZLE_SEEDS).toHaveLength(21);
    const numbers = new Set(DAILY_PUZZLE_SEEDS.map((p) => p.puzzleNumber));
    expect(numbers.size).toBe(DAILY_PUZZLE_SEEDS.length);

    for (const puzzle of DAILY_PUZZLE_SEEDS) {
      expect(puzzle.startText).not.toBe(puzzle.targetText);
      expect(puzzle.parSolution.length).toBeGreaterThan(0);
      expect(puzzle.minKeystrokes).toBeGreaterThan(0);
      expect(puzzle.minKeystrokes).toBeLessThanOrEqual(
        puzzle.parSolution.length,
      );
    }
  });

  for (const puzzle of DAILY_PUZZLE_SEEDS) {
    it(`puzzle #${puzzle.puzzleNumber} (${puzzle.title}) parSolution transforms startText to targetText`, async () => {
      const user = userEvent.setup();
      let latestText = puzzle.startText;

      const { unmount } = render(
        <BaseVimEditor
          editorKey={`seed-${puzzle.puzzleNumber}`}
          historyCount={0}
          isCompleted={false}
          language={puzzle.language}
          multiline
          onChangeText={(text) => {
            latestText = text;
          }}
          onKeyStroke={vi.fn()}
          onPowerOff={vi.fn()}
          onReset={vi.fn()}
          showInlineTarget={false}
          startCursor={{
            line: puzzle.startCursorLine ?? 0,
            ch: puzzle.startCursorCh ?? 0,
          }}
          startText={puzzle.startText}
        />,
      );

      const editor = await screen.findByRole("textbox");
      await user.click(editor);
      await user.keyboard(toUserEventSequence(puzzle.parSolution));

      unmount();

      expect(
        isExactDailyMatch(latestText, puzzle.targetText),
        `Expected:\n${puzzle.targetText}\n\nActual:\n${latestText}`,
      ).toBe(true);
    });
  }

  it("getFallbackDailyPuzzle hides par_solution unless requested", () => {
    const hidden = getFallbackDailyPuzzle("2026-06-01", false);
    expect(hidden.par_solution).toBeNull();
    expect(hidden.puzzle_date).toBe("2026-06-01");

    const revealed = getFallbackDailyPuzzle("2026-06-01", true);
    expect(revealed.par_solution).not.toBeNull();
    expect(revealed.par_solution?.length).toBe(revealed.par);
  });
});
