import * as fc from "fast-check";
import { describe, expect, it } from "vitest";
import { explainSequence } from "../src/index.js";
import {
  INSERT_MODE_TRIGGERS,
  NORMAL_COMMANDS,
  VISUAL_G_OPERATORS,
  VISUAL_OPERATORS,
} from "../src/vimsplain.js";
import { SPECIAL_KEYS } from "../src/vimsplain.types.js";

// Programmatically generate a list of valid commands from the source code
const generatedCommands = NORMAL_COMMANDS.map((cmd) => {
  let s = cmd.pattern.source;
  s = s.replace(/^\^/, ""); // remove start anchor
  s = s.replace(/\\\//g, "/"); // unescape slash
  s = s.replace(/\\\$/g, "$"); // unescape $
  s = s.replace(/\\\^/g, "^"); // unescape ^
  s = s.replace(/\\\(/g, "("); // unescape (
  s = s.replace(/\\\)/g, ")"); // unescape )
  s = s.replace(/\\\[/g, "["); // unescape [
  s = s.replace(/\\\]/g, "]"); // unescape ]
  s = s.replace(/\\\{/g, "{"); // unescape {
  s = s.replace(/\\\}/g, "}"); // unescape }
  s = s.replace(/\\\+/g, "+"); // unescape +
  s = s.replace(/\(\\d\+\)/g, "10"); // replace mandatory numbers with 10
  s = s.replace(/\(\\d\*\)/g, "99"); // replace optional numbers with 99
  s = s.replace(/\(\.\)/g, "x"); // replace any char with 'x'
  s = s.replace(/\(\[a-z\]\)/g, "a"); // replace lowercase letter with 'a'
  return s;
}).filter((s) => !s.includes("\\")); // filter out any remaining complex regexes

const allCommands = [
  ...generatedCommands,
  ...Array.from(INSERT_MODE_TRIGGERS),
  ...Object.keys(VISUAL_OPERATORS),
  ...Object.keys(VISUAL_G_OPERATORS).map((k) => `g${k}`),
  ...Object.values(SPECIAL_KEYS),
  "1",
  "2",
  "3",
  "5",
  "10",
  "99",
  "[C-v]",
  "[C-w]", // modifiers
];

// Extract the arbitrary into a shared variable to keep the test DRY
const vimInputArbitrary = fc.oneof(
  fc.string(),
  fc.array(fc.constantFrom(...allCommands)).map((arr) => arr.join("")),
);

// Default to 100 runs locally for performance, scale up to 10000 in CI
const numRuns = process.env.CI ? 10000 : 100;

describe("vimsplain fuzzing", () => {
  it("never crashes on arbitrary strings", () => {
    fc.assert(
      fc.property(vimInputArbitrary, (input) => {
        const result = explainSequence(input);
        expect(result).toBeDefined();
        expect(Array.isArray(result.commands)).toBe(true);
        expect(typeof result.remaining).toBe("string");
      }),
      { numRuns },
    );
  });

  it("never returns undefined explanations", () => {
    fc.assert(
      fc.property(vimInputArbitrary, (input) => {
        const result = explainSequence(input);
        for (const cmd of result.commands) {
          expect(cmd.matched).toBeDefined();
          expect(cmd.matched.length).toBeGreaterThan(0);
          expect(cmd.explanation).toBeDefined();
          // Explanation should always be a non-empty string
          expect(typeof cmd.explanation).toBe("string");
          expect(cmd.explanation.length).toBeGreaterThan(0);
        }
      }),
      { numRuns },
    );
  });

  it("correctly groups typed text and exits to normal mode on [Esc]", () => {
    const insertTriggerArb = fc.constantFrom(
      "i",
      "a",
      "o",
      "O",
      "s",
      "S",
      "C",
      "ciw",
    );
    const typedTextArb = fc.stringMatching(/^[a-zA-Z0-9 _-]{1,20}$/);

    fc.assert(
      fc.property(insertTriggerArb, typedTextArb, (trigger, text) => {
        const sequence = `${trigger}${text}[Esc]`;
        const result = explainSequence(sequence);

        expect(result.commands.length).toBeGreaterThanOrEqual(2);
        const lastCmd = result.commands[result.commands.length - 1];
        expect(lastCmd.matched).toBe("[Esc]");
        expect(lastCmd.explanation).toBe("exit insert mode");

        // The typed text command exists before [Esc]
        const textCmd = result.commands.find((c) =>
          c.explanation.startsWith('type "'),
        );
        expect(textCmd).toBeDefined();
        expect(textCmd?.matched).toBe(text);
      }),
      { numRuns },
    );
  });
});
