import type { ParsingContext } from "../vimsplain.types.js";
import { SPECIAL_KEYS } from "../vimsplain.types.js";
import { handleNormalMode } from "./normal.js";

/** Visual mode operators that act on the selection */
export const VISUAL_OPERATORS: Record<string, string> = {
  d: "delete selection",
  D: "delete selection",
  c: "change selection",
  C: "change selection",
  y: "yank selection",
  Y: "yank selection",
  x: "delete selection",
  X: "delete selection",
  s: "change selection",
  S: "change selection",
  "~": "toggle case of selection",
  ">": "indent selection",
  "<": "dedent selection",
  "=": "auto-indent selection",
  J: "join selection",
  p: "paste over selection",
  P: "paste over selection",
};

/** Visual mode g-prefixed operators */
export const VISUAL_G_OPERATORS: Record<string, string> = {
  c: "toggle comment selection",
  u: "lowercase selection",
  U: "uppercase selection",
  "~": "toggle case of selection",
  q: "format selection",
};

export function handleVisualMode(context: ParsingContext): void {
  // Esc exits visual mode
  if (context.remaining.startsWith(SPECIAL_KEYS.ESCAPE)) {
    context.commands.push({
      matched: SPECIAL_KEYS.ESCAPE,
      explanation: "return to normal mode",
    });
    context.activeMode = "Normal";
    context.remaining = context.remaining.slice(SPECIAL_KEYS.ESCAPE.length);
    return;
  }

  // g-prefixed visual operators (gc, gu, gU, g~, gq)
  if (context.remaining[0] === "g" && context.remaining.length > 1) {
    const nextChar = context.remaining[1] as string;
    if (nextChar in VISUAL_G_OPERATORS) {
      const op = `g${nextChar}`;
      context.commands.push({
        matched: op,
        explanation: VISUAL_G_OPERATORS[nextChar] as string,
      });
      context.activeMode = "Normal";
      context.remaining = context.remaining.slice(op.length);
      return;
    }
  }

  // Single-char visual operators
  if (context.remaining[0] in VISUAL_OPERATORS) {
    const op = context.remaining[0] as string;
    const isChangeOp = op === "c" || op === "C" || op === "s" || op === "S";
    context.commands.push({
      matched: op,
      explanation: VISUAL_OPERATORS[op] as string,
    });

    if (isChangeOp) {
      context.activeMode = "Insert";
      context.insertBuffer = "";
    } else {
      context.activeMode = "Normal";
    }
    context.remaining = context.remaining.slice(1);
    return;
  }

  // Not an operator — parse as a motion (extends the selection)
  // Fall through to handleNormalMode
  handleNormalMode(context);
}
