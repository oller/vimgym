import { describe, it, expect } from "vitest";
import {
  explainSequence,
  formatExplanation,
  summarizeSequence,
} from "../vimsplain";

describe("vimsplain", () => {
  describe("explainSequence", () => {
    describe("simple motions", () => {
      it("explains w (word forward)", () => {
        const result = explainSequence("w");
        expect(result.commands).toHaveLength(1);
        expect(result.commands[0]).toEqual({
          matched: "w",
          explanation: "move word forward",
        });
      });

      it("explains b (word backward)", () => {
        const result = explainSequence("b");
        expect(result.commands[0].explanation).toBe("move word backward");
      });

      it("explains e (end of word)", () => {
        const result = explainSequence("e");
        expect(result.commands[0].explanation).toBe("move to end of word");
      });

      it("explains 0 (start of line)", () => {
        const result = explainSequence("0");
        expect(result.commands[0].explanation).toBe("move to start of line");
      });

      it("explains $ (end of line)", () => {
        const result = explainSequence("$");
        expect(result.commands[0].explanation).toBe("move to end of line");
      });

      it("explains ^ (first non-blank)", () => {
        const result = explainSequence("^");
        expect(result.commands[0].explanation).toBe("move to first non-blank");
      });

      it("explains gg (start of file)", () => {
        const result = explainSequence("gg");
        expect(result.commands[0]).toEqual({
          matched: "gg",
          explanation: "go to start of file",
        });
      });

      it("explains G (end of file)", () => {
        const result = explainSequence("G");
        expect(result.commands[0].explanation).toBe("go to end of file");
      });

      it("explains j (line down)", () => {
        const result = explainSequence("j");
        expect(result.commands[0].explanation).toBe("move line down");
      });

      it("explains k (line up)", () => {
        const result = explainSequence("k");
        expect(result.commands[0].explanation).toBe("move line up");
      });

      it("explains h (char left)", () => {
        const result = explainSequence("h");
        expect(result.commands[0].explanation).toBe("move char left");
      });

      it("explains l (char right)", () => {
        const result = explainSequence("l");
        expect(result.commands[0].explanation).toBe("move char right");
      });

      it("explains space (char right, same as l)", () => {
        const result = explainSequence(" ");
        expect(result.commands[0]).toEqual({
          matched: " ",
          explanation: "move char right",
        });
      });

      it("explains 3 spaces (3 chars right)", () => {
        const result = explainSequence("3 ");
        expect(result.commands[0]).toEqual({
          matched: "3 ",
          explanation: "move 3 chars right",
        });
      });
    });

    describe("motions with counts", () => {
      it("explains 3w (3 words forward)", () => {
        const result = explainSequence("3w");
        expect(result.commands[0]).toEqual({
          matched: "3w",
          explanation: "move 3 words forward",
        });
      });

      it("explains 5j (5 lines down)", () => {
        const result = explainSequence("5j");
        expect(result.commands[0]).toEqual({
          matched: "5j",
          explanation: "move 5 lines down",
        });
      });

      it("explains 10k (10 lines up)", () => {
        const result = explainSequence("10k");
        expect(result.commands[0]).toEqual({
          matched: "10k",
          explanation: "move 10 lines up",
        });
      });

      it("explains 2b (2 words backward)", () => {
        const result = explainSequence("2b");
        expect(result.commands[0].explanation).toBe("move 2 words backward");
      });

      it("explains 15gg (go to line 15)", () => {
        const result = explainSequence("15gg");
        expect(result.commands[0]).toEqual({
          matched: "15gg",
          explanation: "go to line 15",
        });
      });
    });

    describe("operators with motions", () => {
      it("explains dw (delete word)", () => {
        const result = explainSequence("dw");
        expect(result.commands[0].explanation).toContain("delete");
        expect(result.commands[0].explanation).toContain("word");
      });

      it("explains d$ (delete to end of line)", () => {
        const result = explainSequence("d$");
        expect(result.commands[0].explanation).toBe("delete to end of line");
      });

      it("explains dd (delete line)", () => {
        const result = explainSequence("dd");
        expect(result.commands[0]).toEqual({
          matched: "dd",
          explanation: "delete line",
        });
      });

      it("explains 3dd (delete 3 lines)", () => {
        const result = explainSequence("3dd");
        expect(result.commands[0]).toEqual({
          matched: "3dd",
          explanation: "delete 3 lines",
        });
      });

      it("explains cw (change word)", () => {
        const result = explainSequence("cw");
        expect(result.commands[0].explanation).toContain("change");
        expect(result.commands[0].explanation).toContain("word");
      });

      it("explains cc (change line)", () => {
        const result = explainSequence("cc");
        expect(result.commands[0].explanation).toBe("change entire line");
      });

      it("explains yy (yank line)", () => {
        const result = explainSequence("yy");
        expect(result.commands[0]).toEqual({
          matched: "yy",
          explanation: "yank line",
        });
      });

      it("explains yw (yank word)", () => {
        const result = explainSequence("yw");
        expect(result.commands[0].explanation).toContain("yank");
        expect(result.commands[0].explanation).toContain("word");
      });

      it("explains D (delete to end of line)", () => {
        const result = explainSequence("D");
        expect(result.commands[0].explanation).toBe("delete to end of line");
      });

      it("explains C (change to end of line)", () => {
        const result = explainSequence("C");
        expect(result.commands[0].explanation).toBe("change to end of line");
      });
    });

    describe("text objects", () => {
      it("explains ciw (change inner word)", () => {
        const result = explainSequence("ciw");
        expect(result.commands[0]).toEqual({
          matched: "ciw",
          explanation: "change inner word",
        });
      });

      it("explains diw (delete inner word)", () => {
        const result = explainSequence("diw");
        expect(result.commands[0]).toEqual({
          matched: "diw",
          explanation: "delete inner word",
        });
      });

      it('explains ci" (change inside quotes)', () => {
        const result = explainSequence('ci"');
        expect(result.commands[0]).toEqual({
          matched: 'ci"',
          explanation: 'change inside ""',
        });
      });

      it('explains da" (delete around quotes)', () => {
        const result = explainSequence('da"');
        expect(result.commands[0]).toEqual({
          matched: 'da"',
          explanation: 'delete around ""',
        });
      });

      it("explains di( (delete inside parens)", () => {
        const result = explainSequence("di(");
        expect(result.commands[0].explanation).toBe("delete inside ()");
      });

      it("explains dit (delete inside tag)", () => {
        const result = explainSequence("dit");
        expect(result.commands[0].explanation).toBe("delete inside tag");
      });

      it("explains caw (change a word with space)", () => {
        const result = explainSequence("caw");
        expect(result.commands[0].explanation).toBe(
          "change a word (with space)",
        );
      });
    });

    describe("find and till", () => {
      it("explains fx (find x forward)", () => {
        const result = explainSequence("fx");
        expect(result.commands[0]).toEqual({
          matched: "fx",
          explanation: "find 'x' forward",
        });
      });

      it("explains Fa (find a backward)", () => {
        const result = explainSequence("Fa");
        expect(result.commands[0]).toEqual({
          matched: "Fa",
          explanation: "find 'a' backward",
        });
      });

      it("explains t; (till ; forward)", () => {
        const result = explainSequence("t;");
        expect(result.commands[0]).toEqual({
          matched: "t;",
          explanation: "till ';' forward",
        });
      });

      it("explains ; (repeat f/t)", () => {
        const result = explainSequence(";");
        expect(result.commands[0].explanation).toBe("repeat last f/t/F/T");
      });

      it("explains , (repeat f/t reverse)", () => {
        const result = explainSequence(",");
        expect(result.commands[0].explanation).toBe(
          "repeat last f/t/F/T reverse",
        );
      });
    });

    describe("operators with find/till", () => {
      it("explains dt; (delete till ;)", () => {
        const result = explainSequence("dt;");
        expect(result.commands[0]).toEqual({
          matched: "dt;",
          explanation: "delete till ';'",
        });
      });

      it("explains df) (delete through ))", () => {
        const result = explainSequence("df)");
        expect(result.commands[0]).toEqual({
          matched: "df)",
          explanation: "delete through ')'",
        });
      });

      it("explains dT, (delete back till ,)", () => {
        const result = explainSequence("dT,");
        expect(result.commands[0]).toEqual({
          matched: "dT,",
          explanation: "delete back till ','",
        });
      });

      it('explains ct" (change till quote)', () => {
        const result = explainSequence('ct"');
        expect(result.commands[0]).toEqual({
          matched: 'ct"',
          explanation: "change till '\"'",
        });
      });

      it("explains cf: (change through :)", () => {
        const result = explainSequence("cf:");
        expect(result.commands[0]).toEqual({
          matched: "cf:",
          explanation: "change through ':'",
        });
      });

      it("explains yt, (yank till ,)", () => {
        const result = explainSequence("yt,");
        expect(result.commands[0]).toEqual({
          matched: "yt,",
          explanation: "yank till ','",
        });
      });

      it("explains yf. (yank through .)", () => {
        const result = explainSequence("yf.");
        expect(result.commands[0]).toEqual({
          matched: "yf.",
          explanation: "yank through '.'",
        });
      });
    });

    describe("insert mode triggers", () => {
      it("explains i (insert)", () => {
        const result = explainSequence("i");
        expect(result.commands[0].explanation).toBe("insert before cursor");
      });

      it("explains I (insert at start)", () => {
        const result = explainSequence("I");
        expect(result.commands[0].explanation).toBe("insert at start of line");
      });

      it("explains a (append)", () => {
        const result = explainSequence("a");
        expect(result.commands[0].explanation).toBe("append after cursor");
      });

      it("explains A (append at end)", () => {
        const result = explainSequence("A");
        expect(result.commands[0].explanation).toBe("append at end of line");
      });

      it("explains o (open below)", () => {
        const result = explainSequence("o");
        expect(result.commands[0].explanation).toBe("open line below");
      });

      it("explains O (open above)", () => {
        const result = explainSequence("O");
        expect(result.commands[0].explanation).toBe("open line above");
      });
    });

    describe("simple edits", () => {
      it("explains x (delete char)", () => {
        const result = explainSequence("x");
        expect(result.commands[0].explanation).toBe("delete char under cursor");
      });

      it("explains 3x (delete 3 chars)", () => {
        const result = explainSequence("3x");
        expect(result.commands[0]).toEqual({
          matched: "3x",
          explanation: "delete 3 chars",
        });
      });

      it("explains ra (replace with a)", () => {
        const result = explainSequence("ra");
        expect(result.commands[0]).toEqual({
          matched: "ra",
          explanation: "replace with 'a'",
        });
      });

      it("explains u (undo)", () => {
        const result = explainSequence("u");
        expect(result.commands[0].explanation).toBe("undo");
      });

      it("explains p (paste)", () => {
        const result = explainSequence("p");
        expect(result.commands[0].explanation).toBe("paste after cursor");
      });

      it("explains P (paste before)", () => {
        const result = explainSequence("P");
        expect(result.commands[0].explanation).toBe("paste before cursor");
      });

      it("explains J (join lines)", () => {
        const result = explainSequence("J");
        expect(result.commands[0].explanation).toBe("join lines");
      });
    });

    describe("combined sequences", () => {
      it("explains ggdG (delete entire file)", () => {
        const result = explainSequence("ggdG");
        expect(result.commands).toHaveLength(2);
        expect(result.commands[0].explanation).toBe("go to start of file");
        expect(result.commands[1].explanation).toBe("delete to end of file");
      });

      it("explains 3wdw (move 3 words, delete word)", () => {
        const result = explainSequence("3wdw");
        expect(result.commands).toHaveLength(2);
        expect(result.commands[0].matched).toBe("3w");
        expect(result.commands[1].matched).toBe("dw");
      });

      it("explains ddp (delete line, paste)", () => {
        const result = explainSequence("ddp");
        expect(result.commands).toHaveLength(2);
        expect(result.commands[0].explanation).toBe("delete line");
        expect(result.commands[1].explanation).toBe("paste after cursor");
      });

      it("explains yyp (yank line, paste)", () => {
        const result = explainSequence("yyp");
        expect(result.commands).toHaveLength(2);
        expect(result.commands[0].explanation).toBe("yank line");
        expect(result.commands[1].explanation).toBe("paste after cursor");
      });

      it("explains ciwtest (change inner word)", () => {
        const result = explainSequence("ciwtest");
        // ciw is one command, then t, e, s, t are separate (unknown or motions)
        expect(result.commands[0]).toEqual({
          matched: "ciw",
          explanation: "change inner word",
        });
      });
    });

    describe("edge cases", () => {
      it("handles empty string", () => {
        const result = explainSequence("");
        expect(result.commands).toHaveLength(0);
        expect(result.remaining).toBe("");
      });

      it("handles unknown single character", () => {
        const result = explainSequence("Q");
        expect(result.commands).toHaveLength(1);
        expect(result.commands[0].explanation).toContain("unknown");
      });
    });
  });

  describe("formatExplanation", () => {
    it("formats multi-command sequence", () => {
      const result = explainSequence("ggdG");
      const formatted = formatExplanation(result);
      expect(formatted).toContain("gg: go to start of file");
      expect(formatted).toContain("dG: delete to end of file");
    });
  });

  describe("summarizeSequence", () => {
    it("summarizes a sequence with 'then'", () => {
      const summary = summarizeSequence("ddp");
      expect(summary).toBe("delete line, then paste after cursor");
    });

    it("summarizes single command without 'then'", () => {
      const summary = summarizeSequence("w");
      expect(summary).toBe("move word forward");
    });
  });

  describe("search mode handling", () => {
    it("explains /pattern search", () => {
      const result = explainSequence("/targetEnter");
      expect(result.commands).toHaveLength(1);
      expect(result.commands[0]).toEqual({
        matched: "/target",
        explanation: 'search forward for "target"',
      });
    });

    it("explains ?pattern search (backward)", () => {
      const result = explainSequence("?wordEnter");
      expect(result.commands[0]).toEqual({
        matched: "?word",
        explanation: 'search backward for "word"',
      });
    });

    it("handles search followed by n (next match)", () => {
      const result = explainSequence("/fooEntern");
      expect(result.commands).toHaveLength(2);
      expect(result.commands[0].explanation).toBe('search forward for "foo"');
      expect(result.commands[1]).toEqual({
        matched: "n",
        explanation: "next search match",
      });
    });

    it("handles search followed by multiple n", () => {
      const result = explainSequence("/targetEnternnn");
      expect(result.commands).toHaveLength(4);
      expect(result.commands[0].matched).toBe("/target");
      expect(result.commands[1].explanation).toBe("next search match");
      expect(result.commands[2].explanation).toBe("next search match");
      expect(result.commands[3].explanation).toBe("next search match");
    });

    it("handles search without trailing Enter", () => {
      const result = explainSequence("/partial");
      expect(result.commands).toHaveLength(1);
      expect(result.commands[0]).toEqual({
        matched: "/partial",
        explanation: 'search forward for "partial"',
      });
    });
  });

  describe("insert mode handling", () => {
    it("treats text after i as typed text", () => {
      const result = explainSequence("ihelloEsc");
      expect(result.commands).toHaveLength(3);
      expect(result.commands[0]).toEqual({
        matched: "i",
        explanation: "insert before cursor",
      });
      expect(result.commands[1]).toEqual({
        matched: "hello",
        explanation: 'type "hello"',
      });
      expect(result.commands[2]).toEqual({
        matched: "Esc",
        explanation: "exit insert mode",
      });
    });

    it("treats text after cw as typed text", () => {
      const result = explainSequence("cwnewEsc");
      expect(result.commands).toHaveLength(3);
      expect(result.commands[0].explanation).toContain("change");
      expect(result.commands[1]).toEqual({
        matched: "new",
        explanation: 'type "new"',
      });
      expect(result.commands[2].explanation).toBe("exit insert mode");
    });

    it("treats text after ciw as typed text", () => {
      const result = explainSequence("ciwreplacedEsc");
      expect(result.commands[0].matched).toBe("ciw");
      expect(result.commands[1]).toEqual({
        matched: "replaced",
        explanation: 'type "replaced"',
      });
    });

    it("handles insert text without trailing Esc", () => {
      const result = explainSequence("itest");
      expect(result.commands).toHaveLength(2);
      expect(result.commands[0].explanation).toBe("insert before cursor");
      expect(result.commands[1].explanation).toBe('type "test"');
    });

    it("does not misinterpret ll in insert mode as motions", () => {
      const result = explainSequence("ihelloEsc");
      // The "ll" in "hello" should be part of the typed text, not two motions
      expect(result.commands[1].matched).toBe("hello");
      expect(result.commands[1].explanation).toBe('type "hello"');
    });
  });
});
