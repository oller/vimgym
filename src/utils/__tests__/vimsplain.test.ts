import { describe, expect, it } from "vitest";
import {
  explainSequence,
  formatExplanation,
  summarizeSequence,
} from "../vimsplain";
import { SPECIAL_KEYS } from "../vimsplain.types";

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

    describe("comment motions", () => {
      it("explains gcc (toggle comment line)", () => {
        const result = explainSequence("gcc");
        expect(result.commands[0]).toEqual({
          matched: "gcc",
          explanation: "toggle comment line",
        });
      });

      it("explains gcw (toggle comment word)", () => {
        const result = explainSequence("gcw");
        expect(result.commands[0].explanation).toBe(
          "toggle comment word forward",
        );
      });

      it("explains gc2w (toggle comment 2 words)", () => {
        const result = explainSequence("gc2w");
        expect(result.commands[0].explanation).toBe(
          "toggle comment 2 word forward",
        );
      });

      it("explains gcj (toggle comment line down)", () => {
        const result = explainSequence("gcj");
        expect(result.commands[0].explanation).toBe("toggle comment line down");
      });

      it("explains gck (toggle comment line up)", () => {
        const result = explainSequence("gck");
        expect(result.commands[0].explanation).toBe("toggle comment line up");
      });

      it("explains gciw (toggle comment inner word)", () => {
        const result = explainSequence("gciw");
        expect(result.commands[0].explanation).toBe(
          "toggle comment inner word",
        );
      });

      it("explains gcaw (toggle comment a word)", () => {
        const result = explainSequence("gcaw");
        expect(result.commands[0].explanation).toBe("toggle comment a word");
      });

      it("explains gci( (toggle comment inside parens)", () => {
        const result = explainSequence("gci(");
        expect(result.commands[0].explanation).toBe("toggle comment inside ()");
      });

      it("explains gca( (toggle comment around parens)", () => {
        const result = explainSequence("gca(");
        expect(result.commands[0].explanation).toBe("toggle comment around ()");
      });

      it("explains vgc (toggle comment selection)", () => {
        const result = explainSequence("vgc");
        expect(result.commands).toHaveLength(2);
        expect(result.commands[0].explanation).toBe("enter visual mode");
        expect(result.commands[1].explanation).toBe("toggle comment selection");
      });

      it("explains Vgc (toggle comment selection in visual line mode)", () => {
        const result = explainSequence("Vgc");
        expect(result.commands).toHaveLength(2);
        expect(result.commands[0].explanation).toBe("enter visual line mode");
        expect(result.commands[1].explanation).toBe("toggle comment selection");
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

      it("explains [C-r] (redo)", () => {
        const result = explainSequence(SPECIAL_KEYS.CTRL_R);
        expect(result.commands[0]).toEqual({
          matched: SPECIAL_KEYS.CTRL_R,
          explanation: "redo",
        });
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
      const result = explainSequence(`/target${SPECIAL_KEYS.ENTER}`);
      expect(result.commands).toHaveLength(1);
      expect(result.commands[0]).toEqual({
        matched: "/target",
        explanation: 'search forward for "target"',
      });
    });

    it("explains ?pattern search (backward)", () => {
      const result = explainSequence(`?word${SPECIAL_KEYS.ENTER}`);
      expect(result.commands[0]).toEqual({
        matched: "?word",
        explanation: 'search backward for "word"',
      });
    });

    it("handles search followed by n (next match)", () => {
      const result = explainSequence(`/foo${SPECIAL_KEYS.ENTER}n`);
      expect(result.commands).toHaveLength(2);
      expect(result.commands[0].explanation).toBe('search forward for "foo"');
      expect(result.commands[1]).toEqual({
        matched: "n",
        explanation: "next search match",
      });
    });

    it("handles search followed by multiple n", () => {
      const result = explainSequence(`/target${SPECIAL_KEYS.ENTER}nnn`);
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
      const result = explainSequence(`ihello${SPECIAL_KEYS.ESCAPE}`);
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
        matched: SPECIAL_KEYS.ESCAPE,
        explanation: "exit insert mode",
      });
    });

    it("treats text after cw as typed text", () => {
      const result = explainSequence(`cwnew${SPECIAL_KEYS.ESCAPE}`);
      expect(result.commands).toHaveLength(3);
      expect(result.commands[0].explanation).toContain("change");
      expect(result.commands[1]).toEqual({
        matched: "new",
        explanation: 'type "new"',
      });
      expect(result.commands[2].explanation).toBe("exit insert mode");
    });

    it("treats text after ciw as typed text", () => {
      const result = explainSequence(`ciwreplaced${SPECIAL_KEYS.ESCAPE}`);
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
      const result = explainSequence(`ihello${SPECIAL_KEYS.ESCAPE}`);
      // The "ll" in "hello" should be part of the typed text, not two motions
      expect(result.commands[1].matched).toBe("hello");
      expect(result.commands[1].explanation).toBe('type "hello"');
    });
  });

  describe("special key handling", () => {
    it("explains [Esc] in normal mode", () => {
      const result = explainSequence(SPECIAL_KEYS.ESCAPE);
      expect(result.commands[0]).toEqual({
        matched: SPECIAL_KEYS.ESCAPE,
        explanation: "return to normal mode",
      });
    });

    it("explains [Enter] in normal mode", () => {
      const result = explainSequence(SPECIAL_KEYS.ENTER);
      expect(result.commands[0]).toEqual({
        matched: SPECIAL_KEYS.ENTER,
        explanation: "execute/confirm",
      });
    });

    it("explains [Backspace] in normal mode", () => {
      const result = explainSequence(SPECIAL_KEYS.BACKSPACE);
      expect(result.commands[0]).toEqual({
        matched: SPECIAL_KEYS.BACKSPACE,
        explanation: "delete char left",
      });
    });

    it("handles [Backspace] in insert mode separately", () => {
      const result = explainSequence(
        `ihe${SPECIAL_KEYS.BACKSPACE}llo${SPECIAL_KEYS.ESCAPE}`,
      );
      expect(result.commands).toHaveLength(5);
      expect(result.commands[0].explanation).toBe("insert before cursor");
      expect(result.commands[1]).toEqual({
        matched: "he",
        explanation: 'type "he"',
      });
      expect(result.commands[2]).toEqual({
        matched: SPECIAL_KEYS.BACKSPACE,
        explanation: "delete character",
      });
      expect(result.commands[3]).toEqual({
        matched: "llo",
        explanation: 'type "llo"',
      });
      expect(result.commands[4]).toEqual({
        matched: SPECIAL_KEYS.ESCAPE,
        explanation: "exit insert mode",
      });
    });

    it("handles [Enter] in insert mode separately", () => {
      const result = explainSequence(
        `iline1${SPECIAL_KEYS.ENTER}line2${SPECIAL_KEYS.ESCAPE}`,
      );
      expect(result.commands).toHaveLength(5);
      expect(result.commands[1]).toEqual({
        matched: "line1",
        explanation: 'type "line1"',
      });
      expect(result.commands[2]).toEqual({
        matched: SPECIAL_KEYS.ENTER,
        explanation: "new line",
      });
      expect(result.commands[3]).toEqual({
        matched: "line2",
        explanation: 'type "line2"',
      });
    });

    it("handles [Backspace] in search mode", () => {
      const result = explainSequence(
        `/testt${SPECIAL_KEYS.BACKSPACE}${SPECIAL_KEYS.ENTER}`,
      );
      expect(result.commands[0]).toEqual({
        matched: "/test",
        explanation: 'search forward for "test"',
      });
    });

    describe("arrow keys", () => {
      it("explains arrow keys in normal mode", () => {
        const up = explainSequence(SPECIAL_KEYS.ARROW_UP);
        expect(up.commands[0].explanation).toBe("move up");

        const down = explainSequence(SPECIAL_KEYS.ARROW_DOWN);
        expect(down.commands[0].explanation).toBe("move down");

        const left = explainSequence(SPECIAL_KEYS.ARROW_LEFT);
        expect(left.commands[0].explanation).toBe("move left");

        const right = explainSequence(SPECIAL_KEYS.ARROW_RIGHT);
        expect(right.commands[0].explanation).toBe("move right");
      });

      it("flushes insert buffer and logs arrow key in insert mode", () => {
        const result = explainSequence(
          `iabc${SPECIAL_KEYS.ARROW_RIGHT}def${SPECIAL_KEYS.ESCAPE}`,
        );
        expect(result.commands).toHaveLength(5);
        expect(result.commands[1]).toEqual({
          matched: "abc",
          explanation: 'type "abc"',
        });
        expect(result.commands[2]).toEqual({
          matched: SPECIAL_KEYS.ARROW_RIGHT,
          explanation: "move right",
        });
        expect(result.commands[3]).toEqual({
          matched: "def",
          explanation: 'type "def"',
        });
      });

      it("ignores arrow keys in search mode", () => {
        const result = explainSequence(
          `/pattern${SPECIAL_KEYS.ARROW_UP}${SPECIAL_KEYS.ENTER}`,
        );
        expect(result.commands).toHaveLength(1);
        expect(result.commands[0].explanation).toBe(
          'search forward for "pattern"',
        );
      });
    });

    describe("visual mode text objects", () => {
      it('identifies vi" as a single command', () => {
        const result = explainSequence('vi"');
        expect(result.commands).toHaveLength(1);
        expect(result.commands[0].explanation).toBe('select inside ""');
      });

      it("identifies vi{ as a single command", () => {
        const result = explainSequence("vi{");
        expect(result.commands).toHaveLength(1);
        expect(result.commands[0].explanation).toBe("select inside {}");
      });

      it("identifies vat as a single command", () => {
        const result = explainSequence("vat");
        expect(result.commands).toHaveLength(1);
        expect(result.commands[0].explanation).toBe("select around tag");
      });
    });
  });
});
