import type {
  CommandDefinition,
  ExplainedCommand,
  ParsingContext,
} from "../vimsplain.types.js";

/** Commands that enter insert mode */
export const INSERT_MODE_TRIGGERS = new Set([
  "i", // insert before cursor
  "I", // insert at beginning of line
  "a", // append after cursor
  "A", // append at end of line
  "o", // open new line below
  "O", // open new line above
  "s", // substitute character under cursor
  "S", // substitute entire line
  "C", // change to end of line
  "cc", // change entire line
  "R", // enter replace mode
]);

/**
 * Command definitions for normal mode.
 * Order matters - more specific patterns should come first.
 */
export const NORMAL_COMMANDS: CommandDefinition[] = [
  // --- Space motion (same as l - move char right) ---
  { pattern: /^(\d+) /, description: "move $1 chars right", isMotion: true },
  { pattern: /^ /, description: "move char right", isMotion: true },

  // --- Registers ---
  { pattern: /^"_dd/, description: "delete line (discard)", isMotion: false },
  {
    pattern: /^"_d(\d*)w/,
    description: "delete $1 word(s) (discard)",
    isMotion: false,
  },
  {
    pattern: /^"\+yy/,
    description: "yank line to system clipboard",
    isMotion: false,
  },
  {
    pattern: /^"\+p/,
    description: "paste from system clipboard after cursor",
    isMotion: false,
  },
  {
    pattern: /^"\+P/,
    description: "paste from system clipboard before cursor",
    isMotion: false,
  },
  {
    pattern: /^"([a-z])yy/,
    description: "yank line into register '$1'",
    isMotion: false,
  },
  {
    pattern: /^"([a-z])dd/,
    description: "delete line into register '$1'",
    isMotion: false,
  },
  {
    pattern: /^"([a-z])p/,
    description: "paste from register '$1' after cursor",
    isMotion: false,
  },
  {
    pattern: /^"([a-z])P/,
    description: "paste from register '$1' before cursor",
    isMotion: false,
  },

  // --- Operators with motions (must come before simple motions) ---
  // Delete operators
  { pattern: /^d\$/, description: "delete to end of line", isMotion: false },
  { pattern: /^d0/, description: "delete to start of line", isMotion: false },
  {
    pattern: /^d\^/,
    description: "delete to first non-blank",
    isMotion: false,
  },
  { pattern: /^dgg/, description: "delete to start of file", isMotion: false },
  { pattern: /^dG/, description: "delete to end of file", isMotion: false },
  {
    pattern: /^d(\d*)w/,
    description: "delete $1 word(s) forward",
    isMotion: false,
  },
  {
    pattern: /^d(\d*)b/,
    description: "delete $1 word(s) backward",
    isMotion: false,
  },
  {
    pattern: /^d(\d*)e/,
    description: "delete to end of $1 word(s)",
    isMotion: false,
  },
  {
    pattern: /^d(\d*)j/,
    description: "delete $1 line(s) down",
    isMotion: false,
  },
  { pattern: /^d(\d*)k/, description: "delete $1 line(s) up", isMotion: false },
  // Delete with find/till
  { pattern: /^df(.)/, description: "delete through '$1'", isMotion: false },
  {
    pattern: /^dF(.)/,
    description: "delete back through '$1'",
    isMotion: false,
  },
  { pattern: /^dt(.)/, description: "delete till '$1'", isMotion: false },
  { pattern: /^dT(.)/, description: "delete back till '$1'", isMotion: false },
  { pattern: /^dd/, description: "delete line", isMotion: false },
  {
    pattern: /^(\d+)dd/,
    description: "delete $1 lines",
    isMotion: false,
  },
  { pattern: /^D/, description: "delete to end of line", isMotion: false },

  // Change operators
  { pattern: /^c\$/, description: "change to end of line", isMotion: false },
  { pattern: /^c0/, description: "change to start of line", isMotion: false },
  {
    pattern: /^c\^/,
    description: "change to first non-blank",
    isMotion: false,
  },
  {
    pattern: /^c(\d*)w/,
    description: "change $1 word(s) forward",
    isMotion: false,
  },
  {
    pattern: /^c(\d*)b/,
    description: "change $1 word(s) backward",
    isMotion: false,
  },
  {
    pattern: /^c(\d*)e/,
    description: "change to end of $1 word(s)",
    isMotion: false,
  },
  // Change with find/till
  { pattern: /^cf(.)/, description: "change through '$1'", isMotion: false },
  {
    pattern: /^cF(.)/,
    description: "change back through '$1'",
    isMotion: false,
  },
  { pattern: /^ct(.)/, description: "change till '$1'", isMotion: false },
  { pattern: /^cT(.)/, description: "change back till '$1'", isMotion: false },
  { pattern: /^cc/, description: "change entire line", isMotion: false },
  { pattern: /^C/, description: "change to end of line", isMotion: false },
  { pattern: /^S/, description: "substitute entire line", isMotion: false },
  {
    pattern: /^s/,
    description: "substitute character and enter insert mode",
    isMotion: false,
  },

  // Yank operators
  { pattern: /^y\$/, description: "yank to end of line", isMotion: false },
  { pattern: /^y0/, description: "yank to start of line", isMotion: false },
  { pattern: /^y\^/, description: "yank to first non-blank", isMotion: false },
  {
    pattern: /^y(\d*)w/,
    description: "yank $1 word(s) forward",
    isMotion: false,
  },
  // Yank with find/till
  { pattern: /^yf(.)/, description: "yank through '$1'", isMotion: false },
  { pattern: /^yF(.)/, description: "yank back through '$1'", isMotion: false },
  { pattern: /^yt(.)/, description: "yank till '$1'", isMotion: false },
  { pattern: /^yT(.)/, description: "yank back till '$1'", isMotion: false },
  { pattern: /^yy/, description: "yank line", isMotion: false },
  { pattern: /^Y/, description: "yank line", isMotion: false },
  {
    pattern: /^(\d+)yy/,
    description: "yank $1 lines",
    isMotion: false,
  },

  // --- Text objects (inner and around) ---
  { pattern: /^ciw/, description: "change inner word", isMotion: false },
  {
    pattern: /^caw/,
    description: "change a word (with space)",
    isMotion: false,
  },
  { pattern: /^ci"/, description: 'change inside ""', isMotion: false },
  { pattern: /^ca"/, description: 'change around ""', isMotion: false },
  { pattern: /^ci'/, description: "change inside ''", isMotion: false },
  { pattern: /^ca'/, description: "change around ''", isMotion: false },
  { pattern: /^ci\(/, description: "change inside ()", isMotion: false },
  { pattern: /^ci\)/, description: "change inside ()", isMotion: false },
  { pattern: /^ca\(/, description: "change around ()", isMotion: false },
  { pattern: /^ca\)/, description: "change around ()", isMotion: false },
  { pattern: /^ci\[/, description: "change inside []", isMotion: false },
  { pattern: /^ci\]/, description: "change inside []", isMotion: false },
  { pattern: /^ca\[/, description: "change around []", isMotion: false },
  { pattern: /^ca\]/, description: "change around []", isMotion: false },
  { pattern: /^ci\{/, description: "change inside {}", isMotion: false },
  { pattern: /^ci\}/, description: "change inside {}", isMotion: false },
  { pattern: /^ca\{/, description: "change around {}", isMotion: false },
  { pattern: /^ca\}/, description: "change around {}", isMotion: false },
  { pattern: /^cit/, description: "change inside tag", isMotion: false },
  { pattern: /^cat/, description: "change around tag", isMotion: false },

  { pattern: /^diw/, description: "delete inner word", isMotion: false },
  {
    pattern: /^daw/,
    description: "delete a word (with space)",
    isMotion: false,
  },
  { pattern: /^di"/, description: 'delete inside ""', isMotion: false },
  { pattern: /^da"/, description: 'delete around ""', isMotion: false },
  { pattern: /^di'/, description: "delete inside ''", isMotion: false },
  { pattern: /^da'/, description: "delete around ''", isMotion: false },
  { pattern: /^di\(/, description: "delete inside ()", isMotion: false },
  { pattern: /^di\)/, description: "delete inside ()", isMotion: false },
  { pattern: /^da\(/, description: "delete around ()", isMotion: false },
  { pattern: /^da\)/, description: "delete around ()", isMotion: false },
  { pattern: /^di\[/, description: "delete inside []", isMotion: false },
  { pattern: /^di\]/, description: "delete inside []", isMotion: false },
  { pattern: /^da\[/, description: "delete around []", isMotion: false },
  { pattern: /^da\]/, description: "delete around []", isMotion: false },
  { pattern: /^di\{/, description: "delete inside {}", isMotion: false },
  { pattern: /^di\}/, description: "delete inside {}", isMotion: false },
  { pattern: /^da\{/, description: "delete around {}", isMotion: false },
  { pattern: /^da\}/, description: "delete around {}", isMotion: false },
  { pattern: /^dit/, description: "delete inside tag", isMotion: false },
  { pattern: /^dat/, description: "delete around tag", isMotion: false },

  { pattern: /^yiw/, description: "yank inner word", isMotion: false },
  { pattern: /^yaw/, description: "yank a word (with space)", isMotion: false },
  { pattern: /^yi"/, description: 'yank inside ""', isMotion: false },
  { pattern: /^ya"/, description: 'yank around ""', isMotion: false },
  { pattern: /^yi'/, description: "yank inside ''", isMotion: false },
  { pattern: /^ya'/, description: "yank around ''", isMotion: false },
  { pattern: /^yi\(/, description: "yank inside ()", isMotion: false },
  { pattern: /^yi\)/, description: "yank inside ()", isMotion: false },
  { pattern: /^ya\(/, description: "yank around ()", isMotion: false },
  { pattern: /^ya\)/, description: "yank around ()", isMotion: false },

  // Visual mode text objects
  { pattern: /^viw/, description: "select inner word", isMotion: false },
  {
    pattern: /^vaw/,
    description: "select a word (with space)",
    isMotion: false,
  },
  { pattern: /^vi"/, description: 'select inside ""', isMotion: false },
  { pattern: /^va"/, description: 'select around ""', isMotion: false },
  { pattern: /^vi'/, description: "select inside ''", isMotion: false },
  { pattern: /^va'/, description: "select around ''", isMotion: false },
  { pattern: /^vi\(/, description: "select inside ()", isMotion: false },
  { pattern: /^va\(/, description: "select around ()", isMotion: false },
  { pattern: /^vi\)/, description: "select inside ()", isMotion: false },
  { pattern: /^va\)/, description: "select around ()", isMotion: false },
  { pattern: /^vi\[/, description: "select inside []", isMotion: false },
  { pattern: /^va\[/, description: "select around []", isMotion: false },
  { pattern: /^vi\]/, description: "select inside []", isMotion: false },
  { pattern: /^va\]/, description: "select around []", isMotion: false },
  { pattern: /^vi\{/, description: "select inside {}", isMotion: false },
  { pattern: /^va\{/, description: "select around {}", isMotion: false },
  { pattern: /^vi\}/, description: "select inside {}", isMotion: false },
  { pattern: /^va\}/, description: "select around {}", isMotion: false },
  { pattern: /^vit/, description: "select inside tag", isMotion: false },
  { pattern: /^vat/, description: "select around tag", isMotion: false },

  // Angle bracket text objects
  { pattern: /^ci</, description: "change inside <>", isMotion: false },
  { pattern: /^ci>/, description: "change inside <>", isMotion: false },
  { pattern: /^ca</, description: "change around <>", isMotion: false },
  { pattern: /^ca>/, description: "change around <>", isMotion: false },
  { pattern: /^di</, description: "delete inside <>", isMotion: false },
  { pattern: /^di>/, description: "delete inside <>", isMotion: false },
  { pattern: /^da</, description: "delete around <>", isMotion: false },
  { pattern: /^da>/, description: "delete around <>", isMotion: false },
  { pattern: /^yi</, description: "yank inside <>", isMotion: false },
  { pattern: /^yi>/, description: "yank inside <>", isMotion: false },
  { pattern: /^ya</, description: "yank around <>", isMotion: false },
  { pattern: /^ya>/, description: "yank around <>", isMotion: false },
  { pattern: /^vi</, description: "select inside <>", isMotion: false },
  { pattern: /^vi>/, description: "select inside <>", isMotion: false },
  { pattern: /^va</, description: "select around <>", isMotion: false },
  { pattern: /^va>/, description: "select around <>", isMotion: false },
  // Backtick text objects
  { pattern: /^ci`/, description: "change inside ``", isMotion: false },
  { pattern: /^ca`/, description: "change around ``", isMotion: false },
  { pattern: /^di`/, description: "delete inside ``", isMotion: false },
  { pattern: /^da`/, description: "delete around ``", isMotion: false },
  { pattern: /^yi`/, description: "yank inside ``", isMotion: false },
  { pattern: /^ya`/, description: "yank around ``", isMotion: false },
  { pattern: /^vi`/, description: "select inside ``", isMotion: false },
  { pattern: /^va`/, description: "select around ``", isMotion: false },

  // --- Find and till ---
  { pattern: /^f(.)/, description: "find '$1' forward", isMotion: true },
  { pattern: /^F(.)/, description: "find '$1' backward", isMotion: true },
  { pattern: /^t(.)/, description: "till '$1' forward", isMotion: true },
  { pattern: /^T(.)/, description: "till '$1' backward", isMotion: true },
  { pattern: /^;/, description: "repeat last f/t/F/T", isMotion: true },
  { pattern: /^,/, description: "repeat last f/t/F/T reverse", isMotion: true },

  // --- Simple motions ---
  { pattern: /^(\d+)w/, description: "move $1 words forward", isMotion: true },
  { pattern: /^w/, description: "move word forward", isMotion: true },
  { pattern: /^(\d+)W/, description: "move $1 WORDS forward", isMotion: true },
  { pattern: /^W/, description: "move WORD forward", isMotion: true },
  { pattern: /^(\d+)b/, description: "move $1 words backward", isMotion: true },
  { pattern: /^b/, description: "move word backward", isMotion: true },
  { pattern: /^(\d+)B/, description: "move $1 WORDS backward", isMotion: true },
  { pattern: /^B/, description: "move WORD backward", isMotion: true },
  {
    pattern: /^(\d+)e/,
    description: "move to end of $1 words",
    isMotion: true,
  },
  { pattern: /^e/, description: "move to end of word", isMotion: true },
  {
    pattern: /^(\d+)E/,
    description: "move to end of $1 WORDS",
    isMotion: true,
  },
  { pattern: /^E/, description: "move to end of WORD", isMotion: true },
  {
    pattern: /^ge/,
    description: "move to end of previous word",
    isMotion: true,
  },
  {
    pattern: /^gE/,
    description: "move to end of previous WORD",
    isMotion: true,
  },

  // Line motions
  { pattern: /^0/, description: "move to start of line", isMotion: true },
  { pattern: /^\$/, description: "move to end of line", isMotion: true },
  { pattern: /^\^/, description: "move to first non-blank", isMotion: true },
  { pattern: /^_/, description: "move to first non-blank", isMotion: true },

  // Vertical motions
  {
    pattern: /^(\d+)j/,
    description: "move $1 lines down",
    isMotion: true,
  },
  { pattern: /^j/, description: "move line down", isMotion: true },
  { pattern: /^(\d+)k/, description: "move $1 lines up", isMotion: true },
  { pattern: /^k/, description: "move line up", isMotion: true },
  { pattern: /^(\d+)h/, description: "move $1 chars left", isMotion: true },
  { pattern: /^h/, description: "move char left", isMotion: true },
  { pattern: /^(\d+)l/, description: "move $1 chars right", isMotion: true },
  { pattern: /^l/, description: "move char right", isMotion: true },

  // File motions
  { pattern: /^gg/, description: "go to start of file", isMotion: true },
  { pattern: /^(\d+)gg/, description: "go to line $1", isMotion: true },
  { pattern: /^G/, description: "go to end of file", isMotion: true },
  { pattern: /^(\d+)G/, description: "go to line $1", isMotion: true },

  // Paragraph/sentence motions
  { pattern: /^\{/, description: "move paragraph backward", isMotion: true },
  { pattern: /^\}/, description: "move paragraph forward", isMotion: true },
  { pattern: /^\(/, description: "move sentence backward", isMotion: true },
  { pattern: /^\)/, description: "move sentence forward", isMotion: true },

  // --- Insert mode triggers ---
  { pattern: /^i/, description: "insert before cursor", isMotion: false },
  { pattern: /^I/, description: "insert at start of line", isMotion: false },
  { pattern: /^a/, description: "append after cursor", isMotion: false },
  { pattern: /^A/, description: "append at end of line", isMotion: false },
  { pattern: /^o/, description: "open line below", isMotion: false },
  { pattern: /^O/, description: "open line above", isMotion: false },

  // --- Simple edits ---
  { pattern: /^(\d+)x/, description: "delete $1 chars", isMotion: false },
  { pattern: /^x/, description: "delete char under cursor", isMotion: false },
  { pattern: /^X/, description: "delete char before cursor", isMotion: false },
  { pattern: /^r(.)/, description: "replace with '$1'", isMotion: false },
  { pattern: /^R/, description: "enter replace mode", isMotion: false },
  { pattern: /^~/, description: "toggle case", isMotion: false },
  { pattern: /^J/, description: "join lines", isMotion: false },
  { pattern: /^gJ/, description: "join lines (no space)", isMotion: false },

  // --- Undo/redo ---
  { pattern: /^u/, description: "undo", isMotion: false },
  { pattern: /^U/, description: "undo line", isMotion: false },
  { pattern: /^\[C-r\]/, description: "redo", isMotion: false },

  // --- Put/paste ---
  { pattern: /^p/, description: "paste after cursor", isMotion: false },
  { pattern: /^P/, description: "paste before cursor", isMotion: false },

  // --- Repeat ---
  { pattern: /^\./, description: "repeat last change", isMotion: false },

  // --- Visual mode ---
  { pattern: /^v/, description: "enter visual mode", isMotion: false },
  { pattern: /^V/, description: "enter visual line mode", isMotion: false },
  {
    pattern: /^\[C-v\]/,
    description: "enter visual block mode",
    isMotion: false,
  },

  // --- Marks ---
  { pattern: /^m(.)/, description: "set mark '$1'", isMotion: false },
  { pattern: /^'(.)/, description: "go to mark '$1' (line)", isMotion: true },
  { pattern: /^`(.)/, description: "go to mark '$1' (exact)", isMotion: true },

  // --- Macros ---
  {
    pattern: /^q([a-z])/,
    description: "start recording macro '$1'",
    isMotion: false,
  },
  { pattern: /^q/, description: "stop recording macro", isMotion: false },
  { pattern: /^@@/, description: "replay last macro", isMotion: false },
  { pattern: /^@([a-z])/, description: "play macro '$1'", isMotion: false },

  // --- Search ---
  { pattern: /^n/, description: "next search match", isMotion: true },
  { pattern: /^N/, description: "previous search match", isMotion: true },
  {
    pattern: /^\*/,
    description: "search word under cursor forward",
    isMotion: true,
  },
  {
    pattern: /^#/,
    description: "search word under cursor backward",
    isMotion: true,
  },
  { pattern: /^%/, description: "go to matching bracket", isMotion: true },

  // --- Folding ---
  {
    pattern: /^zO/,
    description: "open all folds recursively",
    isMotion: false,
  },
  { pattern: /^zR/, description: "open all folds", isMotion: false },
  { pattern: /^zM/, description: "close all folds", isMotion: false },
  { pattern: /^zo/, description: "open fold", isMotion: false },
  { pattern: /^zc/, description: "close fold", isMotion: false },
  { pattern: /^za/, description: "toggle fold", isMotion: false },
  // --- Spell ---
  {
    pattern: /^z=/,
    description: "suggest spelling corrections",
    isMotion: false,
  },
  { pattern: /^zg/, description: "add word to dictionary", isMotion: false },
  { pattern: /^zw/, description: "mark word as incorrect", isMotion: false },
  { pattern: /^\]s/, description: "next misspelling", isMotion: true },
  { pattern: /^\[s/, description: "previous misspelling", isMotion: true },

  // --- Scroll ---
  { pattern: /^zz/, description: "center cursor line", isMotion: false },
  { pattern: /^zt/, description: "scroll cursor to top", isMotion: false },
  { pattern: /^zb/, description: "scroll cursor to bottom", isMotion: false },

  // --- Case change ---
  {
    pattern: /^gu(\d*)w/,
    description: "lowercase $1 word(s)",
    isMotion: false,
  },
  {
    pattern: /^gU(\d*)w/,
    description: "uppercase $1 word(s)",
    isMotion: false,
  },
  { pattern: /^guw/, description: "lowercase word", isMotion: false },
  { pattern: /^gUw/, description: "uppercase word", isMotion: false },
  { pattern: /^guu/, description: "lowercase line", isMotion: false },
  { pattern: /^gUU/, description: "uppercase line", isMotion: false },
  { pattern: /^g~~/, description: "toggle case line", isMotion: false },

  // --- Comment ---
  { pattern: /^gcc/, description: "toggle comment line", isMotion: false },
  {
    pattern: /^gc(\d*)w/,
    description: "toggle comment $1 word(s) forward",
    isMotion: false,
  },
  {
    pattern: /^gc(\d*)j/,
    description: "toggle comment $1 line(s) down",
    isMotion: false,
  },
  {
    pattern: /^gc(\d*)k/,
    description: "toggle comment $1 line(s) up",
    isMotion: false,
  },
  {
    pattern: /^gciw/,
    description: "toggle comment inner word",
    isMotion: false,
  },
  { pattern: /^gcaw/, description: "toggle comment a word", isMotion: false },
  {
    pattern: /^gci\(/,
    description: "toggle comment inside ()",
    isMotion: false,
  },
  {
    pattern: /^gca\(/,
    description: "toggle comment around ()",
    isMotion: false,
  },
  { pattern: /^gc/, description: "toggle comment selection", isMotion: false },

  // Extended indentation
  { pattern: /^=ap/, description: "auto-indent paragraph", isMotion: false },
  {
    pattern: /^=G/,
    description: "auto-indent to end of file",
    isMotion: false,
  },
  {
    pattern: /^=%/,
    description: "auto-indent to matching bracket",
    isMotion: false,
  },
  {
    pattern: /^=(\d*)j/,
    description: "auto-indent $1 lines down",
    isMotion: false,
  },

  // --- Indent ---
  { pattern: /^>>/, description: "indent line", isMotion: false },
  { pattern: /^<</, description: "dedent line", isMotion: false },
  { pattern: /^>(\d*)j/, description: "indent $1 lines down", isMotion: false },
  { pattern: /^<(\d*)j/, description: "dedent $1 lines down", isMotion: false },

  // --- Window commands ---
  {
    pattern: /^\[C-w\]s/,
    description: "split window horizontally",
    isMotion: false,
  },
  {
    pattern: /^\[C-w\]v/,
    description: "split window vertically",
    isMotion: false,
  },
  { pattern: /^\[C-w\]h/, description: "move to window left", isMotion: false },
  {
    pattern: /^\[C-w\]j/,
    description: "move to window below",
    isMotion: false,
  },
  {
    pattern: /^\[C-w\]k/,
    description: "move to window above",
    isMotion: false,
  },
  {
    pattern: /^\[C-w\]l/,
    description: "move to window right",
    isMotion: false,
  },
  { pattern: /^\[C-w\]q/, description: "close window", isMotion: false },
  // --- Jump list ---
  { pattern: /^\[C-o\]/, description: "jump back", isMotion: true },
  { pattern: /^\[C-i\]/, description: "jump forward", isMotion: true },

  // --- Special keys (in normal mode) ---
  {
    pattern: /^\[Esc\]/,
    description: "return to normal mode",
    isMotion: false,
  },
  { pattern: /^\[Enter\]/, description: "execute/confirm", isMotion: false },
  {
    pattern: /^\[Backspace\]/,
    description: "delete char left",
    isMotion: false,
  },
  {
    pattern: /^\[Delete\]/,
    description: "delete char under cursor",
    isMotion: false,
  },
  { pattern: /^\[Up\]/, description: "move up", isMotion: true },
  { pattern: /^\[Down\]/, description: "move down", isMotion: true },
  { pattern: /^\[Left\]/, description: "move left", isMotion: true },
  { pattern: /^\[Right\]/, description: "move right", isMotion: true },

  // Fallback: bare operator keys (when no motion follows)
  { pattern: /^d/, description: "delete char under cursor", isMotion: false },
];

/**
 * Parse a single command from the input string.
 * Returns the matched command and remaining input.
 */
function parseCommand(input: string): {
  command: ExplainedCommand | null;
  remaining: string;
} {
  /* v8 ignore start */
  if (!input) {
    return { command: null, remaining: "" };
  }
  /* v8 ignore stop */

  for (const cmd of NORMAL_COMMANDS) {
    const match = input.match(cmd.pattern);
    if (match) {
      let description = cmd.description;

      // Replace $1, $2, etc. with captured groups
      for (let i = 1; i < match.length; i++) {
        const value = match[i] || "1"; // Default to "1" for optional counts
        description = description.replace(`$${i}`, value);
      }

      // Clean up "1 word(s)" -> "word" etc.
      description = description
        .replace(/\b1 (word|line|char|WORD)s?\(s\)/g, "$1")
        .replace(/\(s\)/g, "");

      return {
        command: {
          matched: match[0],
          explanation: description,
        },
        remaining: input.slice(match[0].length),
      };
    }
  }

  // Unknown command - return single character
  return {
    command: {
      matched: input[0],
      explanation: `unknown command '${input[0]}'`,
    },
    remaining: input.slice(1),
  };
}

export function handleNormalMode(context: ParsingContext): ParsingContext {
  // Only handle Normal and Visual modes
  /* v8 ignore start */
  if (
    context.activeMode !== "Normal" &&
    context.activeMode !== "Visual" &&
    context.activeMode !== "VisualLine" &&
    context.activeMode !== "VisualBlock"
  ) {
    return context;
  }
  /* v8 ignore stop */

  const result = parseCommand(context.remaining);
  /* v8 ignore start */
  if (!result.command) {
    return context;
  }
  /* v8 ignore stop */

  const newCommands = [...context.commands, result.command];
  const matched = result.command.matched;

  // Check if this command enters insert mode
  if (
    INSERT_MODE_TRIGGERS.has(matched) ||
    matched.startsWith("c") || // cw, ciw, ct, etc.
    matched === "s"
  ) {
    return {
      activeMode: "Insert",
      remaining: result.remaining,
      commands: newCommands,
      insertBuffer: "",
    };
  }

  // Check if this command enters visual mode
  if (matched === "v" || matched === "V" || matched === "[C-v]") {
    let mode: "Visual" | "VisualLine" | "VisualBlock" = "Visual";
    if (matched === "V") mode = "VisualLine";
    if (matched === "[C-v]") mode = "VisualBlock";

    return {
      activeMode: mode,
      remaining: result.remaining,
      commands: newCommands,
    };
  }

  return {
    ...context,
    remaining: result.remaining,
    commands: newCommands,
  };
}
