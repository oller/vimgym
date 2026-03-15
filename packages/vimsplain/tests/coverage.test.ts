/**
 * Pattern coverage tests.
 *
 * One test per entry in NORMAL_COMMANDS that was previously untested.
 * These tests are intentionally minimal — they confirm each pattern matches
 * and produces the correct explanation. Behavioural and sequence tests live
 * in vimsplain.test.ts.
 *
 * When a pattern uses a capture group (e.g. dF(.)), we test a concrete
 * example (e.g. "dF)") and verify the $1 substitution is correct.
 */
import { describe, expect, it } from "vitest";
import { explainSequence, SPECIAL_KEYS } from "../src/index.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cmd(input: string) {
  return explainSequence(input).commands[0];
}

// ---------------------------------------------------------------------------
// Registers
// ---------------------------------------------------------------------------

describe("registers", () => {
  it('"_dd — delete line to black hole register', () => {
    expect(cmd('"_dd')).toMatchObject({
      matched: '"_dd',
      explanation: "delete line (discard)",
    });
  });

  it('"_dw — delete word to black hole register', () => {
    expect(cmd('"_dw')).toMatchObject({
      matched: '"_dw',
      explanation: "delete word (discard)",
    });
  });

  it('"+yy — yank line to system clipboard', () => {
    expect(cmd('"+yy')).toMatchObject({
      matched: '"+yy',
      explanation: "yank line to system clipboard",
    });
  });

  it('"+p — paste from system clipboard after cursor', () => {
    expect(cmd('"+p')).toMatchObject({
      matched: '"+p',
      explanation: "paste from system clipboard after cursor",
    });
  });

  it('"+P — paste from system clipboard before cursor', () => {
    expect(cmd('"+P')).toMatchObject({
      matched: '"+P',
      explanation: "paste from system clipboard before cursor",
    });
  });

  it('"ayy — yank line into register a', () => {
    expect(cmd('"ayy')).toMatchObject({
      matched: '"ayy',
      explanation: "yank line into register 'a'",
    });
  });

  it('"add — delete line into register a', () => {
    expect(cmd('"add')).toMatchObject({
      matched: '"add',
      explanation: "delete line into register 'a'",
    });
  });

  it('"ap — paste from register a after cursor', () => {
    expect(cmd('"ap')).toMatchObject({
      matched: '"ap',
      explanation: "paste from register 'a' after cursor",
    });
  });

  it('"aP — paste from register a before cursor', () => {
    expect(cmd('"aP')).toMatchObject({
      matched: '"aP',
      explanation: "paste from register 'a' before cursor",
    });
  });
});

// ---------------------------------------------------------------------------
// Delete operators (untested targets)
// ---------------------------------------------------------------------------

describe("delete operators", () => {
  it("d0 — delete to start of line", () => {
    expect(cmd("d0")).toMatchObject({
      matched: "d0",
      explanation: "delete to start of line",
    });
  });

  it("d^ — delete to first non-blank", () => {
    expect(cmd("d^")).toMatchObject({
      matched: "d^",
      explanation: "delete to first non-blank",
    });
  });

  it("dgg — delete to start of file", () => {
    expect(cmd("dgg")).toMatchObject({
      matched: "dgg",
      explanation: "delete to start of file",
    });
  });

  it("dG — delete to end of file", () => {
    expect(cmd("dG")).toMatchObject({
      matched: "dG",
      explanation: "delete to end of file",
    });
  });

  it("db — delete word backward", () => {
    expect(cmd("db")).toMatchObject({
      matched: "db",
      explanation: "delete word backward",
    });
  });

  it("d2b — delete 2 words backward", () => {
    expect(cmd("d2b")).toMatchObject({
      matched: "d2b",
      explanation: "delete 2 word backward",
    });
  });

  it("de — delete to end of word", () => {
    expect(cmd("de")).toMatchObject({
      matched: "de",
      explanation: "delete to end of word",
    });
  });

  it("dj — delete line down", () => {
    expect(cmd("dj")).toMatchObject({
      matched: "dj",
      explanation: "delete line down",
    });
  });

  it("dk — delete line up", () => {
    expect(cmd("dk")).toMatchObject({
      matched: "dk",
      explanation: "delete line up",
    });
  });

  it("dF) — delete back through char", () => {
    expect(cmd("dF)")).toMatchObject({
      matched: "dF)",
      explanation: "delete back through ')'",
    });
  });
});

// ---------------------------------------------------------------------------
// Change operators (untested targets)
// ---------------------------------------------------------------------------

describe("change operators", () => {
  it("c$ — change to end of line", () => {
    expect(cmd("c$")).toMatchObject({
      matched: "c$",
      explanation: "change to end of line",
    });
  });

  it("c0 — change to start of line", () => {
    expect(cmd("c0")).toMatchObject({
      matched: "c0",
      explanation: "change to start of line",
    });
  });

  it("c^ — change to first non-blank", () => {
    expect(cmd("c^")).toMatchObject({
      matched: "c^",
      explanation: "change to first non-blank",
    });
  });

  it("cb — change word backward", () => {
    expect(cmd("cb")).toMatchObject({
      matched: "cb",
      explanation: "change word backward",
    });
  });

  it("ce — change to end of word", () => {
    expect(cmd("ce")).toMatchObject({
      matched: "ce",
      explanation: "change to end of word",
    });
  });

  it("cF: — change back through char", () => {
    expect(cmd("cF:")).toMatchObject({
      matched: "cF:",
      explanation: "change back through ':'",
    });
  });

  it("ct; — change till char", () => {
    expect(cmd("ct;")).toMatchObject({
      matched: "ct;",
      explanation: "change till ';'",
    });
  });

  it("cT; — change back till char", () => {
    expect(cmd("cT;")).toMatchObject({
      matched: "cT;",
      explanation: "change back till ';'",
    });
  });

  it("S — substitute entire line", () => {
    expect(cmd("S")).toMatchObject({
      matched: "S",
      explanation: "substitute entire line",
    });
  });

  it("s — substitute character", () => {
    expect(cmd("s")).toMatchObject({
      matched: "s",
      explanation: "substitute character and enter insert mode",
    });
  });
});

// ---------------------------------------------------------------------------
// Yank operators (untested targets)
// ---------------------------------------------------------------------------

describe("yank operators", () => {
  it("y$ — yank to end of line", () => {
    expect(cmd("y$")).toMatchObject({
      matched: "y$",
      explanation: "yank to end of line",
    });
  });

  it("y0 — yank to start of line", () => {
    expect(cmd("y0")).toMatchObject({
      matched: "y0",
      explanation: "yank to start of line",
    });
  });

  it("y^ — yank to first non-blank", () => {
    expect(cmd("y^")).toMatchObject({
      matched: "y^",
      explanation: "yank to first non-blank",
    });
  });

  it("yF. — yank back through char", () => {
    expect(cmd("yF.")).toMatchObject({
      matched: "yF.",
      explanation: "yank back through '.'",
    });
  });

  it("yT, — yank back till char", () => {
    expect(cmd("yT,")).toMatchObject({
      matched: "yT,",
      explanation: "yank back till ','",
    });
  });

  it("Y — yank line (alias)", () => {
    expect(cmd("Y")).toMatchObject({
      matched: "Y",
      explanation: "yank line",
    });
  });

  it("3yy — yank 3 lines", () => {
    expect(cmd("3yy")).toMatchObject({
      matched: "3yy",
      explanation: "yank 3 lines",
    });
  });
});

// ---------------------------------------------------------------------------
// Text objects — change (untested variants)
// ---------------------------------------------------------------------------

describe("text objects — change", () => {
  it('ci" — change inside double quotes', () => {
    expect(cmd('ci"')).toMatchObject({
      matched: 'ci"',
      explanation: 'change inside ""',
    });
  });
  it('ca" — change around double quotes', () => {
    expect(cmd('ca"')).toMatchObject({
      matched: 'ca"',
      explanation: 'change around ""',
    });
  });
  it("ci' — change inside single quotes", () => {
    expect(cmd("ci'")).toMatchObject({
      matched: "ci'",
      explanation: "change inside ''",
    });
  });
  it("ca' — change around single quotes", () => {
    expect(cmd("ca'")).toMatchObject({
      matched: "ca'",
      explanation: "change around ''",
    });
  });
  it("ci( — change inside parens", () => {
    expect(cmd("ci(")).toMatchObject({
      matched: "ci(",
      explanation: "change inside ()",
    });
  });
  it("ca( — change around parens", () => {
    expect(cmd("ca(")).toMatchObject({
      matched: "ca(",
      explanation: "change around ()",
    });
  });
  it("ci[ — change inside brackets", () => {
    expect(cmd("ci[")).toMatchObject({
      matched: "ci[",
      explanation: "change inside []",
    });
  });
  it("ca[ — change around brackets", () => {
    expect(cmd("ca[")).toMatchObject({
      matched: "ca[",
      explanation: "change around []",
    });
  });
  it("ci{ — change inside braces", () => {
    expect(cmd("ci{")).toMatchObject({
      matched: "ci{",
      explanation: "change inside {}",
    });
  });
  it("ca{ — change around braces", () => {
    expect(cmd("ca{")).toMatchObject({
      matched: "ca{",
      explanation: "change around {}",
    });
  });
  it("cit — change inside tag", () => {
    expect(cmd("cit")).toMatchObject({
      matched: "cit",
      explanation: "change inside tag",
    });
  });
  it("cat — change around tag", () => {
    expect(cmd("cat")).toMatchObject({
      matched: "cat",
      explanation: "change around tag",
    });
  });
  it("ci> — change inside angle brackets", () => {
    expect(cmd("ci>")).toMatchObject({
      matched: "ci>",
      explanation: "change inside <>",
    });
  });
  it("ca> — change around angle brackets", () => {
    expect(cmd("ca>")).toMatchObject({
      matched: "ca>",
      explanation: "change around <>",
    });
  });
  it("ci` — change inside backticks", () => {
    expect(cmd("ci`")).toMatchObject({
      matched: "ci`",
      explanation: "change inside ``",
    });
  });
  it("ca` — change around backticks", () => {
    expect(cmd("ca`")).toMatchObject({
      matched: "ca`",
      explanation: "change around ``",
    });
  });
});

// ---------------------------------------------------------------------------
// Text objects — delete (untested variants)
// ---------------------------------------------------------------------------

describe("text objects — delete", () => {
  it("daw — delete a word with space", () => {
    expect(cmd("daw")).toMatchObject({
      matched: "daw",
      explanation: "delete a word (with space)",
    });
  });
  it('di" — delete inside double quotes', () => {
    expect(cmd('di"')).toMatchObject({
      matched: 'di"',
      explanation: 'delete inside ""',
    });
  });
  it('da" — delete around double quotes', () => {
    expect(cmd('da"')).toMatchObject({
      matched: 'da"',
      explanation: 'delete around ""',
    });
  });
  it("di' — delete inside single quotes", () => {
    expect(cmd("di'")).toMatchObject({
      matched: "di'",
      explanation: "delete inside ''",
    });
  });
  it("da' — delete around single quotes", () => {
    expect(cmd("da'")).toMatchObject({
      matched: "da'",
      explanation: "delete around ''",
    });
  });
  it("da( — delete around parens", () => {
    expect(cmd("da(")).toMatchObject({
      matched: "da(",
      explanation: "delete around ()",
    });
  });
  it("di[ — delete inside brackets", () => {
    expect(cmd("di[")).toMatchObject({
      matched: "di[",
      explanation: "delete inside []",
    });
  });
  it("da[ — delete around brackets", () => {
    expect(cmd("da[")).toMatchObject({
      matched: "da[",
      explanation: "delete around []",
    });
  });
  it("di{ — delete inside braces", () => {
    expect(cmd("di{")).toMatchObject({
      matched: "di{",
      explanation: "delete inside {}",
    });
  });
  it("da{ — delete around braces", () => {
    expect(cmd("da{")).toMatchObject({
      matched: "da{",
      explanation: "delete around {}",
    });
  });
  it("dat — delete around tag", () => {
    expect(cmd("dat")).toMatchObject({
      matched: "dat",
      explanation: "delete around tag",
    });
  });
  it("da> — delete around angle brackets", () => {
    expect(cmd("da>")).toMatchObject({
      matched: "da>",
      explanation: "delete around <>",
    });
  });
  it("di` — delete inside backticks", () => {
    expect(cmd("di`")).toMatchObject({
      matched: "di`",
      explanation: "delete inside ``",
    });
  });
  it("da` — delete around backticks", () => {
    expect(cmd("da`")).toMatchObject({
      matched: "da`",
      explanation: "delete around ``",
    });
  });
});

// ---------------------------------------------------------------------------
// Text objects — yank (untested variants)
// ---------------------------------------------------------------------------

describe("text objects — yank", () => {
  it("yiw — yank inner word", () => {
    expect(cmd("yiw")).toMatchObject({
      matched: "yiw",
      explanation: "yank inner word",
    });
  });
  it("yaw — yank a word with space", () => {
    expect(cmd("yaw")).toMatchObject({
      matched: "yaw",
      explanation: "yank a word (with space)",
    });
  });
  it('yi" — yank inside double quotes', () => {
    expect(cmd('yi"')).toMatchObject({
      matched: 'yi"',
      explanation: 'yank inside ""',
    });
  });
  it('ya" — yank around double quotes', () => {
    expect(cmd('ya"')).toMatchObject({
      matched: 'ya"',
      explanation: 'yank around ""',
    });
  });
  it("yi' — yank inside single quotes", () => {
    expect(cmd("yi'")).toMatchObject({
      matched: "yi'",
      explanation: "yank inside ''",
    });
  });
  it("ya' — yank around single quotes", () => {
    expect(cmd("ya'")).toMatchObject({
      matched: "ya'",
      explanation: "yank around ''",
    });
  });
  it("yi( — yank inside parens", () => {
    expect(cmd("yi(")).toMatchObject({
      matched: "yi(",
      explanation: "yank inside ()",
    });
  });
  it("ya( — yank around parens", () => {
    expect(cmd("ya(")).toMatchObject({
      matched: "ya(",
      explanation: "yank around ()",
    });
  });
  it("yi< — yank inside angle brackets", () => {
    expect(cmd("yi<")).toMatchObject({
      matched: "yi<",
      explanation: "yank inside <>",
    });
  });
  it("ya< — yank around angle brackets", () => {
    expect(cmd("ya<")).toMatchObject({
      matched: "ya<",
      explanation: "yank around <>",
    });
  });
  it("yi` — yank inside backticks", () => {
    expect(cmd("yi`")).toMatchObject({
      matched: "yi`",
      explanation: "yank inside ``",
    });
  });
  it("ya` — yank around backticks", () => {
    expect(cmd("ya`")).toMatchObject({
      matched: "ya`",
      explanation: "yank around ``",
    });
  });
});

// ---------------------------------------------------------------------------
// Text objects — visual select (untested variants)
// ---------------------------------------------------------------------------

describe("text objects — visual select", () => {
  it("viw — select inner word", () => {
    expect(cmd("viw")).toMatchObject({
      matched: "viw",
      explanation: "select inner word",
    });
  });
  it("vaw — select a word with space", () => {
    expect(cmd("vaw")).toMatchObject({
      matched: "vaw",
      explanation: "select a word (with space)",
    });
  });
  it('vi" — select inside double quotes', () => {
    expect(cmd('vi"')).toMatchObject({
      matched: 'vi"',
      explanation: 'select inside ""',
    });
  });
  it('va" — select around double quotes', () => {
    expect(cmd('va"')).toMatchObject({
      matched: 'va"',
      explanation: 'select around ""',
    });
  });
  it("vi' — select inside single quotes", () => {
    expect(cmd("vi'")).toMatchObject({
      matched: "vi'",
      explanation: "select inside ''",
    });
  });
  it("va' — select around single quotes", () => {
    expect(cmd("va'")).toMatchObject({
      matched: "va'",
      explanation: "select around ''",
    });
  });
  it("vi( — select inside parens", () => {
    expect(cmd("vi(")).toMatchObject({
      matched: "vi(",
      explanation: "select inside ()",
    });
  });
  it("va( — select around parens", () => {
    expect(cmd("va(")).toMatchObject({
      matched: "va(",
      explanation: "select around ()",
    });
  });
  it("vi[ — select inside brackets", () => {
    expect(cmd("vi[")).toMatchObject({
      matched: "vi[",
      explanation: "select inside []",
    });
  });
  it("va[ — select around brackets", () => {
    expect(cmd("va[")).toMatchObject({
      matched: "va[",
      explanation: "select around []",
    });
  });
  it("vi{ — select inside braces", () => {
    expect(cmd("vi{")).toMatchObject({
      matched: "vi{",
      explanation: "select inside {}",
    });
  });
  it("va{ — select around braces", () => {
    expect(cmd("va{")).toMatchObject({
      matched: "va{",
      explanation: "select around {}",
    });
  });
  it("vi> — select inside angle brackets", () => {
    expect(cmd("vi>")).toMatchObject({
      matched: "vi>",
      explanation: "select inside <>",
    });
  });
  it("va> — select around angle brackets", () => {
    expect(cmd("va>")).toMatchObject({
      matched: "va>",
      explanation: "select around <>",
    });
  });
  it("vi` — select inside backticks", () => {
    expect(cmd("vi`")).toMatchObject({
      matched: "vi`",
      explanation: "select inside ``",
    });
  });
  it("va` — select around backticks", () => {
    expect(cmd("va`")).toMatchObject({
      matched: "va`",
      explanation: "select around ``",
    });
  });
});

// ---------------------------------------------------------------------------
// WORD motions (uppercase W/B/E — entirely untested)
// ---------------------------------------------------------------------------

describe("WORD motions", () => {
  it("W — move WORD forward", () => {
    expect(cmd("W")).toMatchObject({
      matched: "W",
      explanation: "move WORD forward",
    });
  });
  it("3W — move 3 WORDS forward", () => {
    expect(cmd("3W")).toMatchObject({
      matched: "3W",
      explanation: "move 3 WORDS forward",
    });
  });
  it("B — move WORD backward", () => {
    expect(cmd("B")).toMatchObject({
      matched: "B",
      explanation: "move WORD backward",
    });
  });
  it("3B — move 3 WORDS backward", () => {
    expect(cmd("3B")).toMatchObject({
      matched: "3B",
      explanation: "move 3 WORDS backward",
    });
  });
  it("E — move to end of WORD", () => {
    expect(cmd("E")).toMatchObject({
      matched: "E",
      explanation: "move to end of WORD",
    });
  });
  it("3E — move to end of 3 WORDS", () => {
    expect(cmd("3E")).toMatchObject({
      matched: "3E",
      explanation: "move to end of 3 WORDS",
    });
  });
  it("ge — move to end of previous word", () => {
    expect(cmd("ge")).toMatchObject({
      matched: "ge",
      explanation: "move to end of previous word",
    });
  });
  it("gE — move to end of previous WORD", () => {
    expect(cmd("gE")).toMatchObject({
      matched: "gE",
      explanation: "move to end of previous WORD",
    });
  });
});

// ---------------------------------------------------------------------------
// Count motions (untested count variants)
// ---------------------------------------------------------------------------

describe("count motions", () => {
  it("3h — move 3 chars left", () => {
    expect(cmd("3h")).toMatchObject({
      matched: "3h",
      explanation: "move 3 chars left",
    });
  });
  it("3l — move 3 chars right", () => {
    expect(cmd("3l")).toMatchObject({
      matched: "3l",
      explanation: "move 3 chars right",
    });
  });
  it("15G — go to line 15", () => {
    expect(cmd("15G")).toMatchObject({
      matched: "15G",
      explanation: "go to line 15",
    });
  });
  it("3e — move to end of 3 words", () => {
    expect(cmd("3e")).toMatchObject({
      matched: "3e",
      explanation: "move to end of 3 words",
    });
  });
});

// ---------------------------------------------------------------------------
// Paragraph and sentence motions
// ---------------------------------------------------------------------------

describe("paragraph and sentence motions", () => {
  it("{ — move paragraph backward", () => {
    expect(cmd("{")).toMatchObject({
      matched: "{",
      explanation: "move paragraph backward",
    });
  });
  it("} — move paragraph forward", () => {
    expect(cmd("}")).toMatchObject({
      matched: "}",
      explanation: "move paragraph forward",
    });
  });
  it("( — move sentence backward", () => {
    expect(cmd("(")).toMatchObject({
      matched: "(",
      explanation: "move sentence backward",
    });
  });
  it(") — move sentence forward", () => {
    expect(cmd(")")).toMatchObject({
      matched: ")",
      explanation: "move sentence forward",
    });
  });
});

// ---------------------------------------------------------------------------
// Line motion aliases
// ---------------------------------------------------------------------------

describe("line motion aliases", () => {
  it("_ — move to first non-blank (alias for ^)", () => {
    expect(cmd("_")).toMatchObject({
      matched: "_",
      explanation: "move to first non-blank",
    });
  });
  it("T; — till char backward", () => {
    expect(cmd("T;")).toMatchObject({
      matched: "T;",
      explanation: "till ';' backward",
    });
  });
});

// ---------------------------------------------------------------------------
// Simple edits (untested)
// ---------------------------------------------------------------------------

describe("simple edits", () => {
  it("X — delete char before cursor", () => {
    expect(cmd("X")).toMatchObject({
      matched: "X",
      explanation: "delete char before cursor",
    });
  });
  it("R — enter replace mode", () => {
    expect(cmd("R")).toMatchObject({
      matched: "R",
      explanation: "enter replace mode",
    });
  });
  it("~ — toggle case", () => {
    expect(cmd("~")).toMatchObject({
      matched: "~",
      explanation: "toggle case",
    });
  });
  it("gJ — join lines without space", () => {
    expect(cmd("gJ")).toMatchObject({
      matched: "gJ",
      explanation: "join lines (no space)",
    });
  });
  it("U — undo line", () => {
    expect(cmd("U")).toMatchObject({ matched: "U", explanation: "undo line" });
  });
  it(". — repeat last change", () => {
    expect(cmd(".")).toMatchObject({
      matched: ".",
      explanation: "repeat last change",
    });
  });
});

// ---------------------------------------------------------------------------
// Redo
// ---------------------------------------------------------------------------

describe("redo", () => {
  it("[C-r] — redo", () => {
    expect(cmd(SPECIAL_KEYS.CTRL_R)).toMatchObject({
      matched: SPECIAL_KEYS.CTRL_R,
      explanation: "redo",
    });
  });
});

// ---------------------------------------------------------------------------
// Marks
// ---------------------------------------------------------------------------

describe("marks", () => {
  it("ma — set mark a", () => {
    expect(cmd("ma")).toMatchObject({
      matched: "ma",
      explanation: "set mark 'a'",
    });
  });
  it("'a — go to mark a (line)", () => {
    expect(cmd("'a")).toMatchObject({
      matched: "'a",
      explanation: "go to mark 'a' (line)",
    });
  });
  it("`a — go to mark a (exact)", () => {
    expect(cmd("`a")).toMatchObject({
      matched: "`a",
      explanation: "go to mark 'a' (exact)",
    });
  });
});

// ---------------------------------------------------------------------------
// Search commands
// ---------------------------------------------------------------------------

describe("search commands", () => {
  it("n — next search match", () => {
    expect(cmd("n")).toMatchObject({
      matched: "n",
      explanation: "next search match",
    });
  });
  it("N — previous search match", () => {
    expect(cmd("N")).toMatchObject({
      matched: "N",
      explanation: "previous search match",
    });
  });
  it("* — search word under cursor forward", () => {
    expect(cmd("*")).toMatchObject({
      matched: "*",
      explanation: "search word under cursor forward",
    });
  });
  it("# — search word under cursor backward", () => {
    expect(cmd("#")).toMatchObject({
      matched: "#",
      explanation: "search word under cursor backward",
    });
  });
  it("% — go to matching bracket", () => {
    expect(cmd("%")).toMatchObject({
      matched: "%",
      explanation: "go to matching bracket",
    });
  });
});

// ---------------------------------------------------------------------------
// Scroll commands
// ---------------------------------------------------------------------------

describe("scroll commands", () => {
  it("zz — center cursor line", () => {
    expect(cmd("zz")).toMatchObject({
      matched: "zz",
      explanation: "center cursor line",
    });
  });
  it("zt — scroll cursor to top", () => {
    expect(cmd("zt")).toMatchObject({
      matched: "zt",
      explanation: "scroll cursor to top",
    });
  });
  it("zb — scroll cursor to bottom", () => {
    expect(cmd("zb")).toMatchObject({
      matched: "zb",
      explanation: "scroll cursor to bottom",
    });
  });
});

// ---------------------------------------------------------------------------
// Spell (untested: zw)
// ---------------------------------------------------------------------------

describe("spell — zw", () => {
  it("zw — mark word as incorrect", () => {
    expect(cmd("zw")).toMatchObject({
      matched: "zw",
      explanation: "mark word as incorrect",
    });
  });
});

// ---------------------------------------------------------------------------
// Case change commands
// ---------------------------------------------------------------------------

describe("case change", () => {
  it("guw — lowercase word", () => {
    expect(cmd("guw")).toMatchObject({
      matched: "guw",
      explanation: "lowercase word",
    });
  });
  it("gUw — uppercase word", () => {
    expect(cmd("gUw")).toMatchObject({
      matched: "gUw",
      explanation: "uppercase word",
    });
  });
  it("guu — lowercase line", () => {
    expect(cmd("guu")).toMatchObject({
      matched: "guu",
      explanation: "lowercase line",
    });
  });
  it("gUU — uppercase line", () => {
    expect(cmd("gUU")).toMatchObject({
      matched: "gUU",
      explanation: "uppercase line",
    });
  });
  it("g~~ — toggle case line", () => {
    expect(cmd("g~~")).toMatchObject({
      matched: "g~~",
      explanation: "toggle case line",
    });
  });
  it("gu2w — lowercase 2 words (count goes between gu and w)", () => {
    expect(cmd("gu2w")).toMatchObject({
      matched: "gu2w",
      explanation: "lowercase 2 word",
    });
  });
  it("gU2w — uppercase 2 words (count goes between gU and w)", () => {
    expect(cmd("gU2w")).toMatchObject({
      matched: "gU2w",
      explanation: "uppercase 2 word",
    });
  });
});

// ---------------------------------------------------------------------------
// Indent commands
// ---------------------------------------------------------------------------

describe("indent commands", () => {
  it(">> — indent line", () => {
    expect(cmd(">>")).toMatchObject({
      matched: ">>",
      explanation: "indent line",
    });
  });
  it("<< — dedent line", () => {
    expect(cmd("<<")).toMatchObject({
      matched: "<<",
      explanation: "dedent line",
    });
  });
  it(">2j — indent 2 lines down", () => {
    expect(cmd(">2j")).toMatchObject({
      matched: ">2j",
      explanation: "indent 2 lines down",
    });
  });
  it("<2j — dedent 2 lines down", () => {
    expect(cmd("<2j")).toMatchObject({
      matched: "<2j",
      explanation: "dedent 2 lines down",
    });
  });
  it("=2j — auto-indent 2 lines down", () => {
    expect(cmd("=2j")).toMatchObject({
      matched: "=2j",
      explanation: "auto-indent 2 lines down",
    });
  });
});

// ---------------------------------------------------------------------------
// Special keys as standalone normal-mode commands
// ---------------------------------------------------------------------------

describe("special keys in normal mode", () => {
  it("[Esc] — return to normal mode", () => {
    expect(cmd(SPECIAL_KEYS.ESCAPE)).toMatchObject({
      matched: SPECIAL_KEYS.ESCAPE,
      explanation: "return to normal mode",
    });
  });
  it("[Enter] — execute/confirm", () => {
    expect(cmd(SPECIAL_KEYS.ENTER)).toMatchObject({
      matched: SPECIAL_KEYS.ENTER,
      explanation: "execute/confirm",
    });
  });
  it("[Backspace] — delete char left", () => {
    expect(cmd(SPECIAL_KEYS.BACKSPACE)).toMatchObject({
      matched: SPECIAL_KEYS.BACKSPACE,
      explanation: "delete char left",
    });
  });
  it("[Delete] — delete char under cursor", () => {
    expect(cmd(SPECIAL_KEYS.DELETE)).toMatchObject({
      matched: SPECIAL_KEYS.DELETE,
      explanation: "delete char under cursor",
    });
  });
  it("[Up] — move up", () => {
    expect(cmd(SPECIAL_KEYS.ARROW_UP)).toMatchObject({
      matched: SPECIAL_KEYS.ARROW_UP,
      explanation: "move up",
    });
  });
  it("[Down] — move down", () => {
    expect(cmd(SPECIAL_KEYS.ARROW_DOWN)).toMatchObject({
      matched: SPECIAL_KEYS.ARROW_DOWN,
      explanation: "move down",
    });
  });
  it("[Left] — move left", () => {
    expect(cmd(SPECIAL_KEYS.ARROW_LEFT)).toMatchObject({
      matched: SPECIAL_KEYS.ARROW_LEFT,
      explanation: "move left",
    });
  });
  it("[Right] — move right", () => {
    expect(cmd(SPECIAL_KEYS.ARROW_RIGHT)).toMatchObject({
      matched: SPECIAL_KEYS.ARROW_RIGHT,
      explanation: "move right",
    });
  });
});
