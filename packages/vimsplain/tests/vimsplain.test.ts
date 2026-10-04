import { describe, expect, it } from "vitest";
import {
  explainSequence,
  formatExplanation,
  SPECIAL_KEYS,
  summarizeSequence,
} from "../src/index.js";

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

      it("explains sentence text objects (cis, cas, dis, das, yis, yas, vis, vas)", () => {
        expect(explainSequence("cis").commands[0]).toEqual({
          matched: "cis",
          explanation: "change inside sentence",
        });
        expect(explainSequence("cas").commands[0]).toEqual({
          matched: "cas",
          explanation: "change around sentence",
        });
        expect(explainSequence("dis").commands[0]).toEqual({
          matched: "dis",
          explanation: "delete inside sentence",
        });
        expect(explainSequence("das").commands[0]).toEqual({
          matched: "das",
          explanation: "delete around sentence",
        });
        expect(explainSequence("yis").commands[0]).toEqual({
          matched: "yis",
          explanation: "yank inside sentence",
        });
        expect(explainSequence("yas").commands[0]).toEqual({
          matched: "yas",
          explanation: "yank around sentence",
        });
        expect(explainSequence("vis").commands[0]).toEqual({
          matched: "vis",
          explanation: "select inside sentence",
        });
        expect(explainSequence("vas").commands[0]).toEqual({
          matched: "vas",
          explanation: "select around sentence",
        });
      });

      it("explains paragraph text objects (cip, cap, dip, dap, yip, yap, vip, vap)", () => {
        expect(explainSequence("cip").commands[0]).toEqual({
          matched: "cip",
          explanation: "change inside paragraph",
        });
        expect(explainSequence("cap").commands[0]).toEqual({
          matched: "cap",
          explanation: "change around paragraph",
        });
        expect(explainSequence("dip").commands[0]).toEqual({
          matched: "dip",
          explanation: "delete inside paragraph",
        });
        expect(explainSequence("dap").commands[0]).toEqual({
          matched: "dap",
          explanation: "delete around paragraph",
        });
        expect(explainSequence("yip").commands[0]).toEqual({
          matched: "yip",
          explanation: "yank inside paragraph",
        });
        expect(explainSequence("yap").commands[0]).toEqual({
          matched: "yap",
          explanation: "yank around paragraph",
        });
        expect(explainSequence("vip").commands[0]).toEqual({
          matched: "vip",
          explanation: "select inside paragraph",
        });
        expect(explainSequence("vap").commands[0]).toEqual({
          matched: "vap",
          explanation: "select around paragraph",
        });
      });

      it("explains counted text objects (2diw, 3daw, 2yiw, 2viw)", () => {
        expect(explainSequence("2diw").commands[0]).toEqual({
          matched: "2diw",
          explanation: "delete 2 inner words",
        });
        expect(explainSequence("3daw").commands[0]).toEqual({
          matched: "3daw",
          explanation: "delete 3 words (with space)",
        });
        expect(explainSequence("2yiw").commands[0]).toEqual({
          matched: "2yiw",
          explanation: "yank 2 inner words",
        });
        expect(explainSequence("2viw").commands[0]).toEqual({
          matched: "2viw",
          explanation: "select 2 inner words",
        });
      });

      it("explains visual block mode I and A insertion", () => {
        const insertResult = explainSequence("[C-v]jjI//[Esc]");
        expect(insertResult.commands[0]).toEqual({
          matched: "[C-v]",
          explanation: "enter visual block mode",
        });
        expect(insertResult.commands[3]).toEqual({
          matched: "I",
          explanation: "insert before block selection on each line",
        });
        expect(insertResult.commands[4]).toEqual({
          matched: "//",
          explanation: 'type "//"',
        });

        const appendResult = explainSequence("[C-v]jjA;[Esc]");
        expect(appendResult.commands[3]).toEqual({
          matched: "A",
          explanation: "append after block selection on each line",
        });
        expect(appendResult.commands[4]).toEqual({
          matched: ";",
          explanation: 'type ";"',
        });
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
      expect(formatted).toBe(
        "gg: go to start of file\ndG: delete to end of file",
      );
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

    it("explains [Delete] in normal mode", () => {
      const result = explainSequence(SPECIAL_KEYS.DELETE);
      expect(result.commands[0]).toEqual({
        matched: SPECIAL_KEYS.DELETE,
        explanation: "delete char under cursor",
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

    it("handles special keys immediately when insertBuffer is empty", () => {
      const bs = explainSequence(
        `i${SPECIAL_KEYS.BACKSPACE}${SPECIAL_KEYS.ESCAPE}`,
      );
      expect(bs.commands).toEqual([
        { matched: "i", explanation: "insert before cursor" },
        { matched: SPECIAL_KEYS.BACKSPACE, explanation: "delete character" },
        { matched: SPECIAL_KEYS.ESCAPE, explanation: "exit insert mode" },
      ]);

      const del = explainSequence(
        `i${SPECIAL_KEYS.DELETE}${SPECIAL_KEYS.ESCAPE}`,
      );
      expect(del.commands).toEqual([
        { matched: "i", explanation: "insert before cursor" },
        {
          matched: SPECIAL_KEYS.DELETE,
          explanation: "delete char under cursor",
        },
        { matched: SPECIAL_KEYS.ESCAPE, explanation: "exit insert mode" },
      ]);

      const enter = explainSequence(
        `i${SPECIAL_KEYS.ENTER}${SPECIAL_KEYS.ESCAPE}`,
      );
      expect(enter.commands).toEqual([
        { matched: "i", explanation: "insert before cursor" },
        { matched: SPECIAL_KEYS.ENTER, explanation: "new line" },
        { matched: SPECIAL_KEYS.ESCAPE, explanation: "exit insert mode" },
      ]);

      const up = explainSequence(
        `i${SPECIAL_KEYS.ARROW_UP}${SPECIAL_KEYS.ESCAPE}`,
      );
      expect(up.commands).toEqual([
        { matched: "i", explanation: "insert before cursor" },
        { matched: SPECIAL_KEYS.ARROW_UP, explanation: "move up" },
        { matched: SPECIAL_KEYS.ESCAPE, explanation: "exit insert mode" },
      ]);
    });

    it("resumes normal mode parsing when exiting insert mode followed by normal commands", () => {
      const result = explainSequence(`ihello${SPECIAL_KEYS.ESCAPE}w`);
      expect(result.commands).toEqual([
        { matched: "i", explanation: "insert before cursor" },
        { matched: "hello", explanation: 'type "hello"' },
        { matched: SPECIAL_KEYS.ESCAPE, explanation: "exit insert mode" },
        { matched: "w", explanation: "move word forward" },
      ]);
    });

    it("handles [Delete] in insert mode separately", () => {
      const result = explainSequence(
        `ihe${SPECIAL_KEYS.DELETE}llo${SPECIAL_KEYS.ESCAPE}`,
      );
      expect(result.commands).toHaveLength(5);
      expect(result.commands[0].explanation).toBe("insert before cursor");
      expect(result.commands[1]).toEqual({
        matched: "he",
        explanation: 'type "he"',
      });
      expect(result.commands[2]).toEqual({
        matched: SPECIAL_KEYS.DELETE,
        explanation: "delete char under cursor",
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

    describe("visual mode operators", () => {
      describe("v (char visual) + operator", () => {
        it("explains vd as enter visual mode, delete selection", () => {
          const result = explainSequence("vd");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe("delete selection");
        });

        it("explains vD as enter visual mode, delete selection", () => {
          const result = explainSequence("vD");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe("delete selection");
        });

        it("explains vc as enter visual mode, change selection", () => {
          const result = explainSequence("vc");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe("change selection");
        });

        it("explains vc[Esc] as: enter visual mode, change selection, exit insert mode (verifies insert mode transition)", () => {
          const result = explainSequence(`vc${SPECIAL_KEYS.ESCAPE}`);
          expect(result.commands).toHaveLength(3);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe("change selection");
          expect(result.commands[2].explanation).toBe("exit insert mode");
        });

        it("transitions to insert mode and accepts typed text on visual change operators (c, C, s, S)", () => {
          for (const op of ["c", "C", "s", "S"]) {
            const result = explainSequence(`v${op}hello${SPECIAL_KEYS.ESCAPE}`);
            expect(result.commands).toEqual([
              { matched: "v", explanation: "enter visual mode" },
              { matched: op, explanation: "change selection" },
              { matched: "hello", explanation: 'type "hello"' },
              { matched: SPECIAL_KEYS.ESCAPE, explanation: "exit insert mode" },
            ]);
          }
        });

        it("returns to normal mode on non-change visual operators (e.g. d, y)", () => {
          const result = explainSequence("vdw");
          expect(result.commands).toEqual([
            { matched: "v", explanation: "enter visual mode" },
            { matched: "d", explanation: "delete selection" },
            { matched: "w", explanation: "move word forward" },
          ]);
        });

        it("explains vy as enter visual mode, yank selection", () => {
          const result = explainSequence("vy");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe("yank selection");
        });

        it("explains vx as enter visual mode, delete selection", () => {
          const result = explainSequence("vx");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe("delete selection");
        });

        it("explains v~ as enter visual mode, toggle case of selection", () => {
          const result = explainSequence("v~");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe(
            "toggle case of selection",
          );
        });

        it("explains v> as enter visual mode, indent selection", () => {
          const result = explainSequence("v>");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe("indent selection");
        });

        it("explains v< as enter visual mode, dedent selection", () => {
          const result = explainSequence("v<");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe("dedent selection");
        });

        it("explains v= as enter visual mode, auto-indent selection", () => {
          const result = explainSequence("v=");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe("auto-indent selection");
        });

        it("explains vJ as enter visual mode, join selection", () => {
          const result = explainSequence("vJ");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe("join selection");
        });

        it("explains vp as enter visual mode, paste over selection", () => {
          const result = explainSequence("vp");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe("paste over selection");
        });

        it("explains vgc as enter visual mode, toggle comment selection (existing behavior preserved)", () => {
          const result = explainSequence("vgc");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe(
            "toggle comment selection",
          );
        });

        it("explains vgu as enter visual mode, lowercase selection", () => {
          const result = explainSequence("vgu");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe("lowercase selection");
        });

        it("explains vgU as enter visual mode, uppercase selection", () => {
          const result = explainSequence("vgU");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe("uppercase selection");
        });

        it("explains vg~ as enter visual mode, toggle case of selection", () => {
          const result = explainSequence("vg~");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe(
            "toggle case of selection",
          );
        });

        it("explains vgq as enter visual mode, format selection", () => {
          const result = explainSequence("vgq");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe("format selection");
        });

        it("explains vY as enter visual mode, yank selection", () => {
          const result = explainSequence("vY");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe("yank selection");
        });

        it("explains vX as enter visual mode, delete selection", () => {
          const result = explainSequence("vX");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe("delete selection");
        });

        it("explains vP as enter visual mode, paste over selection", () => {
          const result = explainSequence("vP");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe("paste over selection");
        });

        it("resumes normal mode parsing after visual g-operators", () => {
          const result = explainSequence("vgcw");
          expect(result.commands).toEqual([
            { matched: "v", explanation: "enter visual mode" },
            { matched: "gc", explanation: "toggle comment selection" },
            { matched: "w", explanation: "move word forward" },
          ]);
        });

        it("falls through to normal mode handling on bare g in visual mode", () => {
          const result = explainSequence("vg");
          expect(result.commands).toEqual([
            { matched: "v", explanation: "enter visual mode" },
            { matched: "g", explanation: "unknown command 'g'" },
          ]);
        });
      });

      describe("V (line visual) + operator", () => {
        it("explains Vd as enter visual line mode, delete selection", () => {
          const result = explainSequence("Vd");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual line mode");
          expect(result.commands[1].explanation).toBe("delete selection");
        });

        it("explains VD as enter visual line mode, delete selection", () => {
          const result = explainSequence("VD");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual line mode");
          expect(result.commands[1].explanation).toBe("delete selection");
        });

        it("explains Vc as enter visual line mode, change selection", () => {
          const result = explainSequence("Vc");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual line mode");
          expect(result.commands[1].explanation).toBe("change selection");
        });

        it("explains Vy as enter visual line mode, yank selection", () => {
          const result = explainSequence("Vy");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual line mode");
          expect(result.commands[1].explanation).toBe("yank selection");
        });

        it("explains Vgc as enter visual line mode, toggle comment selection (existing behavior preserved)", () => {
          const result = explainSequence("Vgc");
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual line mode");
          expect(result.commands[1].explanation).toBe(
            "toggle comment selection",
          );
        });
      });

      describe("motions extend the selection before operator", () => {
        it("explains vjd as: enter visual mode, move line down, delete selection", () => {
          const result = explainSequence("vjd");
          expect(result.commands).toHaveLength(3);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe("move line down");
          expect(result.commands[2].explanation).toBe("delete selection");
        });

        it("explains Vjd as: enter visual line mode, move line down, delete selection", () => {
          const result = explainSequence("Vjd");
          expect(result.commands).toHaveLength(3);
          expect(result.commands[0].explanation).toBe("enter visual line mode");
          expect(result.commands[1].explanation).toBe("move line down");
          expect(result.commands[2].explanation).toBe("delete selection");
        });

        it("explains v3wd as: enter visual mode, move 3 words forward, delete selection", () => {
          const result = explainSequence("v3wd");
          expect(result.commands).toHaveLength(3);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe("move 3 words forward");
          expect(result.commands[2].explanation).toBe("delete selection");
        });
      });

      describe("Esc exits visual mode", () => {
        it("explains v[Esc] as enter visual mode, return to normal mode", () => {
          const result = explainSequence(`v${SPECIAL_KEYS.ESCAPE}`);
          expect(result.commands).toHaveLength(2);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe("return to normal mode");
        });

        it("explains v[Esc]d as: enter visual mode, return to normal mode, delete char under cursor", () => {
          const result = explainSequence(`v${SPECIAL_KEYS.ESCAPE}d`);
          expect(result.commands).toHaveLength(3);
          expect(result.commands[0].explanation).toBe("enter visual mode");
          expect(result.commands[1].explanation).toBe("return to normal mode");
          expect(result.commands[2].explanation).toBe(
            "delete char under cursor",
          );
        });
      });
    });
  });

  describe("expanded command coverage", () => {
    describe("registers", () => {
      it('explains "ayy (yank line into register a)', () => {
        const result = explainSequence('"ayy');
        expect(result.commands[0]).toEqual({
          matched: '"ayy',
          explanation: "yank line into register 'a'",
        });
      });

      it('explains "ap (paste from register a)', () => {
        const result = explainSequence('"ap');
        expect(result.commands[0]).toEqual({
          matched: '"ap',
          explanation: "paste from register 'a' after cursor",
        });
      });

      it('explains "+p (paste from system clipboard)', () => {
        const result = explainSequence('"+p');
        expect(result.commands[0]).toEqual({
          matched: '"+p',
          explanation: "paste from system clipboard after cursor",
        });
      });

      it('explains "_dd (delete line to black hole register)', () => {
        const result = explainSequence('"_dd');
        expect(result.commands[0]).toEqual({
          matched: '"_dd',
          explanation: "delete line (discard)",
        });
      });

      it('explains "add (delete line into register a)', () => {
        const result = explainSequence('"add');
        expect(result.commands[0]).toEqual({
          matched: '"add',
          explanation: "delete line into register 'a'",
        });
      });
    });

    describe("macros", () => {
      it("explains qa (record macro into register a)", () => {
        const result = explainSequence("qa");
        expect(result.commands[0]).toEqual({
          matched: "qa",
          explanation: "start recording macro 'a'",
        });
      });

      it("explains q (stop recording macro)", () => {
        const result = explainSequence("q");
        expect(result.commands[0]).toEqual({
          matched: "q",
          explanation: "stop recording macro",
        });
      });

      it("explains @a (play macro a)", () => {
        const result = explainSequence("@a");
        expect(result.commands[0]).toEqual({
          matched: "@a",
          explanation: "play macro 'a'",
        });
      });

      it("explains @@ (replay last macro)", () => {
        const result = explainSequence("@@");
        expect(result.commands[0]).toEqual({
          matched: "@@",
          explanation: "replay last macro",
        });
      });
    });

    describe("folding", () => {
      it("explains zo (open fold)", () => {
        const result = explainSequence("zo");
        expect(result.commands[0]).toEqual({
          matched: "zo",
          explanation: "open fold",
        });
      });

      it("explains zc (close fold)", () => {
        const result = explainSequence("zc");
        expect(result.commands[0]).toEqual({
          matched: "zc",
          explanation: "close fold",
        });
      });

      it("explains za (toggle fold)", () => {
        const result = explainSequence("za");
        expect(result.commands[0]).toEqual({
          matched: "za",
          explanation: "toggle fold",
        });
      });

      it("explains zR (open all folds)", () => {
        const result = explainSequence("zR");
        expect(result.commands[0]).toEqual({
          matched: "zR",
          explanation: "open all folds",
        });
      });

      it("explains zM (close all folds)", () => {
        const result = explainSequence("zM");
        expect(result.commands[0]).toEqual({
          matched: "zM",
          explanation: "close all folds",
        });
      });

      it("explains zO (open all folds recursively)", () => {
        const result = explainSequence("zO");
        expect(result.commands[0]).toEqual({
          matched: "zO",
          explanation: "open all folds recursively",
        });
      });
    });

    describe("window commands", () => {
      it("explains [C-w]s (horizontal split)", () => {
        const result = explainSequence("[C-w]s");
        expect(result.commands[0]).toEqual({
          matched: "[C-w]s",
          explanation: "split window horizontally",
        });
      });

      it("explains [C-w]v (vertical split)", () => {
        const result = explainSequence("[C-w]v");
        expect(result.commands[0]).toEqual({
          matched: "[C-w]v",
          explanation: "split window vertically",
        });
      });

      it("explains [C-w]h/j/k/l (move between windows)", () => {
        expect(explainSequence("[C-w]h").commands[0].explanation).toBe(
          "move to window left",
        );
        expect(explainSequence("[C-w]j").commands[0].explanation).toBe(
          "move to window below",
        );
        expect(explainSequence("[C-w]k").commands[0].explanation).toBe(
          "move to window above",
        );
        expect(explainSequence("[C-w]l").commands[0].explanation).toBe(
          "move to window right",
        );
      });

      it("explains [C-w]q (close window)", () => {
        const result = explainSequence("[C-w]q");
        expect(result.commands[0]).toEqual({
          matched: "[C-w]q",
          explanation: "close window",
        });
      });
    });

    describe("jump list", () => {
      it("explains [C-o] (jump back)", () => {
        const result = explainSequence("[C-o]");
        expect(result.commands[0]).toEqual({
          matched: "[C-o]",
          explanation: "jump back",
        });
      });

      it("explains [C-i] (jump forward)", () => {
        const result = explainSequence("[C-i]");
        expect(result.commands[0]).toEqual({
          matched: "[C-i]",
          explanation: "jump forward",
        });
      });
    });

    describe("spell checking", () => {
      it("explains ]s (next misspelling)", () => {
        const result = explainSequence("]s");
        expect(result.commands[0]).toEqual({
          matched: "]s",
          explanation: "next misspelling",
        });
      });

      it("explains [s (previous misspelling)", () => {
        const result = explainSequence("[s");
        expect(result.commands[0]).toEqual({
          matched: "[s",
          explanation: "previous misspelling",
        });
      });

      it("explains z= (suggest spelling corrections)", () => {
        const result = explainSequence("z=");
        expect(result.commands[0]).toEqual({
          matched: "z=",
          explanation: "suggest spelling corrections",
        });
      });

      it("explains zg (add word to dictionary)", () => {
        const result = explainSequence("zg");
        expect(result.commands[0]).toEqual({
          matched: "zg",
          explanation: "add word to dictionary",
        });
      });
    });

    describe("indentation (extended)", () => {
      it("explains =ap (auto-indent paragraph)", () => {
        const result = explainSequence("=ap");
        expect(result.commands[0]).toEqual({
          matched: "=ap",
          explanation: "auto-indent paragraph",
        });
      });

      it("explains =G (auto-indent to end of file)", () => {
        const result = explainSequence("=G");
        expect(result.commands[0]).toEqual({
          matched: "=G",
          explanation: "auto-indent to end of file",
        });
      });

      it("explains =% (auto-indent to matching bracket)", () => {
        const result = explainSequence("=%");
        expect(result.commands[0]).toEqual({
          matched: "=%",
          explanation: "auto-indent to matching bracket",
        });
      });
    });

    describe("ex commands", () => {
      it("explains :w (write file)", () => {
        const result = explainSequence(":w[Enter]");
        expect(result.commands[0]).toEqual({
          matched: ":w",
          explanation: "write file",
        });
      });

      it("explains :q (quit)", () => {
        const result = explainSequence(":q[Enter]");
        expect(result.commands[0]).toEqual({
          matched: ":q",
          explanation: "quit",
        });
      });

      it("explains :wq (write and quit)", () => {
        const result = explainSequence(":wq[Enter]");
        expect(result.commands[0]).toEqual({
          matched: ":wq",
          explanation: "write and quit",
        });
      });

      it("explains :q! (force quit)", () => {
        const result = explainSequence(":q![Enter]");
        expect(result.commands[0]).toEqual({
          matched: ":q!",
          explanation: "force quit (discard changes)",
        });
      });

      it("explains :noh (clear search highlights)", () => {
        const result = explainSequence(":noh[Enter]");
        expect(result.commands[0]).toEqual({
          matched: ":noh",
          explanation: "clear search highlights",
        });
      });

      it("flushes ex buffer without trailing Enter", () => {
        const result = explainSequence(":w");
        expect(result.commands[0]).toEqual({
          matched: ":w",
          explanation: "write file",
        });
      });

      it("handles unknown ex command with generic fallback", () => {
        const result = explainSequence(":foo[Enter]");
        expect(result.commands[0]).toEqual({
          matched: ":foo",
          explanation: "run ex command 'foo'",
        });
      });
    });

    describe("additional text objects", () => {
      it("explains ci< (change inside angle brackets)", () => {
        const result = explainSequence("ci<");
        expect(result.commands[0]).toEqual({
          matched: "ci<",
          explanation: "change inside <>",
        });
      });

      it("explains ca< (change around angle brackets)", () => {
        const result = explainSequence("ca<");
        expect(result.commands[0]).toEqual({
          matched: "ca<",
          explanation: "change around <>",
        });
      });

      it("explains di< (delete inside angle brackets)", () => {
        const result = explainSequence("di<");
        expect(result.commands[0]).toEqual({
          matched: "di<",
          explanation: "delete inside <>",
        });
      });

      it("explains vi< (select inside angle brackets)", () => {
        const result = explainSequence("vi<");
        expect(result.commands[0]).toEqual({
          matched: "vi<",
          explanation: "select inside <>",
        });
      });

      it("explains ci` (change inside backticks)", () => {
        const result = explainSequence("ci`");
        expect(result.commands[0]).toEqual({
          matched: "ci`",
          explanation: "change inside ``",
        });
      });

      it("explains di` (delete inside backticks)", () => {
        const result = explainSequence("di`");
        expect(result.commands[0]).toEqual({
          matched: "di`",
          explanation: "delete inside ``",
        });
      });
    });

    describe("counted change and insert mode transitions", () => {
      it("explains 2cw and properly enters and exits insert mode", () => {
        const result = explainSequence(`2cwhello${SPECIAL_KEYS.ESCAPE}`);
        expect(result.commands).toEqual([
          { matched: "2cw", explanation: "change 2 words forward" },
          { matched: "hello", explanation: 'type "hello"' },
          { matched: SPECIAL_KEYS.ESCAPE, explanation: "exit insert mode" },
        ]);
      });

      it("explains 3ciw and properly handles insert text", () => {
        const result = explainSequence(`3ciwfoo${SPECIAL_KEYS.ESCAPE}`);
        expect(result.commands).toEqual([
          { matched: "3ciw", explanation: "change 3 inner words" },
          { matched: "foo", explanation: 'type "foo"' },
          { matched: SPECIAL_KEYS.ESCAPE, explanation: "exit insert mode" },
        ]);
      });

      it("explains 2cc (change lines) and enters insert mode", () => {
        const result = explainSequence(`2ccnew line${SPECIAL_KEYS.ESCAPE}`);
        expect(result.commands).toEqual([
          { matched: "2cc", explanation: "change 2 lines" },
          { matched: "new line", explanation: 'type "new line"' },
          { matched: SPECIAL_KEYS.ESCAPE, explanation: "exit insert mode" },
        ]);
      });

      it("explains 2s (substitute chars) and enters insert mode", () => {
        const result = explainSequence(`2sbar${SPECIAL_KEYS.ESCAPE}`);
        expect(result.commands).toEqual([
          {
            matched: "2s",
            explanation: "substitute 2 characters and enter insert mode",
          },
          { matched: "bar", explanation: 'type "bar"' },
          { matched: SPECIAL_KEYS.ESCAPE, explanation: "exit insert mode" },
        ]);
      });
    });

    describe("search and command mode cancellation and editing", () => {
      it("cancels search with [Esc] and returns to normal mode", () => {
        const result = explainSequence(`/test${SPECIAL_KEYS.ESCAPE}dd`);
        expect(result.commands).toEqual([
          { matched: SPECIAL_KEYS.ESCAPE, explanation: "cancel search" },
          { matched: "dd", explanation: "delete line" },
        ]);
      });

      it("resets searchBuffer on Esc cancellation so subsequent searches start fresh", () => {
        const result = explainSequence(
          `/foo${SPECIAL_KEYS.ESCAPE}/bar${SPECIAL_KEYS.ENTER}`,
        );
        expect(result.commands).toEqual([
          { matched: SPECIAL_KEYS.ESCAPE, explanation: "cancel search" },
          { matched: "/bar", explanation: 'search forward for "bar"' },
        ]);
      });

      it("handles [Backspace] with subsequent characters in search mode", () => {
        const result = explainSequence(
          `/ab${SPECIAL_KEYS.BACKSPACE}c${SPECIAL_KEYS.ENTER}`,
        );
        expect(result.commands).toEqual([
          { matched: "/ac", explanation: 'search forward for "ac"' },
        ]);
      });

      it("ignores arrow keys and continues parsing subsequent characters in search mode", () => {
        const result = explainSequence(
          `/ab${SPECIAL_KEYS.ARROW_LEFT}c${SPECIAL_KEYS.ENTER}`,
        );
        expect(result.commands).toEqual([
          { matched: "/abc", explanation: 'search forward for "abc"' },
        ]);
      });

      it("flushes backward search buffer without trailing Enter", () => {
        const result = explainSequence("?foo");
        expect(result.commands).toEqual([
          { matched: "?foo", explanation: 'search backward for "foo"' },
        ]);
      });

      it("cancels ex command with [Esc] and returns to normal mode", () => {
        const result = explainSequence(`:w${SPECIAL_KEYS.ESCAPE}dd`);
        expect(result.commands).toEqual([
          { matched: SPECIAL_KEYS.ESCAPE, explanation: "cancel command" },
          { matched: "dd", explanation: "delete line" },
        ]);
      });

      it("resets exBuffer on Esc cancellation so subsequent ex commands start fresh", () => {
        const result = explainSequence(
          `:w${SPECIAL_KEYS.ESCAPE}:q${SPECIAL_KEYS.ENTER}`,
        );
        expect(result.commands).toEqual([
          { matched: SPECIAL_KEYS.ESCAPE, explanation: "cancel command" },
          { matched: ":q", explanation: "quit" },
        ]);
      });

      it("handles [Backspace] with subsequent characters in ex command mode", () => {
        const result = explainSequence(
          `:w${SPECIAL_KEYS.BACKSPACE}q${SPECIAL_KEYS.ENTER}`,
        );
        expect(result.commands).toEqual([
          { matched: ":q", explanation: "quit" },
        ]);
      });

      it("handles [Backspace] in ex command mode", () => {
        const result = explainSequence(
          `:wq${SPECIAL_KEYS.BACKSPACE}${SPECIAL_KEYS.ENTER}`,
        );
        expect(result.commands).toEqual([
          { matched: ":w", explanation: "write file" },
        ]);
      });

      it("explains additional ex commands", () => {
        expect(
          explainSequence(`:wq!${SPECIAL_KEYS.ENTER}`).commands[0],
        ).toEqual({
          matched: ":wq!",
          explanation: "force write and quit",
        });
        expect(explainSequence(`:x${SPECIAL_KEYS.ENTER}`).commands[0]).toEqual({
          matched: ":x",
          explanation: "write and quit",
        });
        expect(explainSequence(`:e${SPECIAL_KEYS.ENTER}`).commands[0]).toEqual({
          matched: ":e",
          explanation: "edit file",
        });
        expect(
          explainSequence(`:nohl${SPECIAL_KEYS.ENTER}`).commands[0],
        ).toEqual({
          matched: ":nohl",
          explanation: "clear search highlights",
        });
        expect(
          explainSequence(`:set nu${SPECIAL_KEYS.ENTER}`).commands[0],
        ).toEqual({
          matched: ":set nu",
          explanation: "show line numbers",
        });
        expect(
          explainSequence(`:set nonu${SPECIAL_KEYS.ENTER}`).commands[0],
        ).toEqual({
          matched: ":set nonu",
          explanation: "hide line numbers",
        });
        expect(
          explainSequence(`:set rnu${SPECIAL_KEYS.ENTER}`).commands[0],
        ).toEqual({
          matched: ":set rnu",
          explanation: "show relative line numbers",
        });
        expect(
          explainSequence(`:set nornu${SPECIAL_KEYS.ENTER}`).commands[0],
        ).toEqual({
          matched: ":set nornu",
          explanation: "hide relative line numbers",
        });
        expect(
          explainSequence(`:s/foo/bar${SPECIAL_KEYS.ENTER}`).commands[0],
        ).toEqual({
          matched: ":s/foo/bar",
          explanation: "substitute",
        });
      });

      it("does not flush empty search or ex buffers when input ends immediately after trigger", () => {
        expect(explainSequence("/").commands).toEqual([]);
        expect(explainSequence("?").commands).toEqual([]);
        expect(explainSequence(":").commands).toEqual([]);
      });
    });

    describe("scrolling and paging motions", () => {
      it("explains half-page scroll down [C-d]", () => {
        const result = explainSequence(SPECIAL_KEYS.CTRL_D);
        expect(result.commands[0]).toEqual({
          matched: "[C-d]",
          explanation: "scroll down (half page)",
        });
      });

      it("explains counted scroll down 5[C-d]", () => {
        const result = explainSequence(`5${SPECIAL_KEYS.CTRL_D}`);
        expect(result.commands[0]).toEqual({
          matched: "5[C-d]",
          explanation: "scroll down 5 lines",
        });
      });

      it("explains half-page scroll up [C-u]", () => {
        const result = explainSequence(SPECIAL_KEYS.CTRL_U);
        expect(result.commands[0]).toEqual({
          matched: "[C-u]",
          explanation: "scroll up (half page)",
        });
      });

      it("explains counted scroll up 4[C-u]", () => {
        const result = explainSequence(`4${SPECIAL_KEYS.CTRL_U}`);
        expect(result.commands[0]).toEqual({
          matched: "4[C-u]",
          explanation: "scroll up 4 lines",
        });
      });

      it("explains full-page scroll forward [C-f]", () => {
        const result = explainSequence(SPECIAL_KEYS.CTRL_F);
        expect(result.commands[0]).toEqual({
          matched: "[C-f]",
          explanation: "scroll forward (full page)",
        });
      });

      it("explains counted scroll forward 2[C-f]", () => {
        const result = explainSequence(`2${SPECIAL_KEYS.CTRL_F}`);
        expect(result.commands[0]).toEqual({
          matched: "2[C-f]",
          explanation: "scroll forward 2 pages",
        });
      });

      it("explains full-page scroll backward [C-b]", () => {
        const result = explainSequence(SPECIAL_KEYS.CTRL_B);
        expect(result.commands[0]).toEqual({
          matched: "[C-b]",
          explanation: "scroll backward (full page)",
        });
      });

      it("explains counted scroll backward 2[C-b]", () => {
        const result = explainSequence(`2${SPECIAL_KEYS.CTRL_B}`);
        expect(result.commands[0]).toEqual({
          matched: "2[C-b]",
          explanation: "scroll backward 2 pages",
        });
      });

      it("explains line scrolling [C-e] and [C-y]", () => {
        expect(explainSequence(SPECIAL_KEYS.CTRL_E).commands[0]).toEqual({
          matched: "[C-e]",
          explanation: "scroll window down one line",
        });
        expect(explainSequence(SPECIAL_KEYS.CTRL_Y).commands[0]).toEqual({
          matched: "[C-y]",
          explanation: "scroll window up one line",
        });
      });

      it("explains [C-c] cancel", () => {
        expect(explainSequence(SPECIAL_KEYS.CTRL_C).commands[0]).toEqual({
          matched: "[C-c]",
          explanation: "cancel / return to normal mode",
        });
      });
    });
  });
});
