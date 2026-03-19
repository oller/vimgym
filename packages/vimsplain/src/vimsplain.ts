/**
 * Vimsplain - Vim Command Explainer
 *
 * Parses Vim command sequences and returns human-readable explanations.
 * Based on the Python vimsplain script, simplified for common VimGym commands.
 */

import {
  handleNormalMode,
  INSERT_MODE_TRIGGERS,
  NORMAL_COMMANDS,
} from "./handlers/normal.js";
import type { ExplainResult, ParsingContext } from "./vimsplain.types.js";
import { SPECIAL_KEYS } from "./vimsplain.types.js";

// Re-export for external consumers (e.g., tests, table generation)
export { INSERT_MODE_TRIGGERS, NORMAL_COMMANDS };

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

/** Known ex commands and their explanations */
const EX_COMMANDS: Record<string, string> = {
  w: "write file",
  q: "quit",
  wq: "write and quit",
  "q!": "force quit (discard changes)",
  "wq!": "force write and quit",
  x: "write and quit",
  e: "edit file",
  noh: "clear search highlights",
  nohl: "clear search highlights",
  "set nu": "show line numbers",
  "set nonu": "hide line numbers",
  "set rnu": "show relative line numbers",
  "set nornu": "hide relative line numbers",
};

function explainExCommand(cmd: string): string {
  const trimmed = cmd.trim();
  if (trimmed in EX_COMMANDS) {
    return EX_COMMANDS[trimmed];
  }
  if (/^s\//.test(trimmed)) {
    return "substitute";
  }
  return `run ex command '${trimmed}'`;
}

/**
 * Explain a full Vim command sequence.
 * Returns an array of explained commands.
 * Handles insert mode: after commands that enter insert mode,
 * subsequent characters are grouped as "typed text" until Esc.
 * Handles search mode: / and ? start search, characters collected until Enter.
 */
export function explainSequence(input: string): ExplainResult {
  let context: ParsingContext = {
    activeMode: "Normal",
    remaining: input,
    commands: [],
  };

  while (context.remaining.length > 0) {
    // Check for [Esc] to exit insert mode
    if (
      context.activeMode === "Insert" &&
      context.remaining.startsWith(SPECIAL_KEYS.ESCAPE)
    ) {
      if (context.insertBuffer.length > 0) {
        context.commands.push({
          matched: context.insertBuffer,
          explanation: `type "${context.insertBuffer}"`,
        });
      }
      context.commands.push({
        matched: SPECIAL_KEYS.ESCAPE,
        explanation: "exit insert mode",
      });
      context = {
        activeMode: "Normal",
        remaining: context.remaining.slice(SPECIAL_KEYS.ESCAPE.length),
        commands: context.commands,
      };
      continue;
    }

    // Check for [Backspace] in insert mode (display separately)
    if (
      context.activeMode === "Insert" &&
      context.remaining.startsWith(SPECIAL_KEYS.BACKSPACE)
    ) {
      if (context.insertBuffer.length > 0) {
        context.commands.push({
          matched: context.insertBuffer,
          explanation: `type "${context.insertBuffer}"`,
        });
        context.insertBuffer = "";
      }
      context.commands.push({
        matched: SPECIAL_KEYS.BACKSPACE,
        explanation: "delete character",
      });
      context.remaining = context.remaining.slice(
        SPECIAL_KEYS.BACKSPACE.length,
      );
      continue;
    }

    // Check for [Delete] in insert mode
    if (
      context.activeMode === "Insert" &&
      context.remaining.startsWith(SPECIAL_KEYS.DELETE)
    ) {
      if (context.insertBuffer.length > 0) {
        context.commands.push({
          matched: context.insertBuffer,
          explanation: `type "${context.insertBuffer}"`,
        });
        context.insertBuffer = "";
      }
      context.commands.push({
        matched: SPECIAL_KEYS.DELETE,
        explanation: "delete char under cursor",
      });
      context.remaining = context.remaining.slice(SPECIAL_KEYS.DELETE.length);
      continue;
    }

    // Check for [Enter] in insert mode (display separately)
    if (
      context.activeMode === "Insert" &&
      context.remaining.startsWith(SPECIAL_KEYS.ENTER)
    ) {
      if (context.insertBuffer.length > 0) {
        context.commands.push({
          matched: context.insertBuffer,
          explanation: `type "${context.insertBuffer}"`,
        });
        context.insertBuffer = "";
      }
      context.commands.push({
        matched: SPECIAL_KEYS.ENTER,
        explanation: "new line",
      });
      context.remaining = context.remaining.slice(SPECIAL_KEYS.ENTER.length);
      continue;
    }

    // Check for arrow keys in insert mode (flush buffer and log motion)
    const arrowKey = [
      SPECIAL_KEYS.ARROW_UP,
      SPECIAL_KEYS.ARROW_DOWN,
      SPECIAL_KEYS.ARROW_LEFT,
      SPECIAL_KEYS.ARROW_RIGHT,
    ].find((key) => context.remaining.startsWith(key));

    if (context.activeMode === "Insert" && arrowKey) {
      if (context.insertBuffer.length > 0) {
        context.commands.push({
          matched: context.insertBuffer,
          explanation: `type "${context.insertBuffer}"`,
        });
        context.insertBuffer = "";
      }
      const direction = arrowKey.slice(1, -1).toLowerCase();
      context.commands.push({
        matched: arrowKey,
        explanation: `move ${direction}`,
      });
      context.remaining = context.remaining.slice(arrowKey.length);
      continue;
    }

    // In insert mode, accumulate characters
    if (context.activeMode === "Insert") {
      context.insertBuffer += context.remaining[0];
      context.remaining = context.remaining.slice(1);
      continue;
    }

    // Check for [Enter] to complete ex command
    if (
      context.activeMode === "Command" &&
      context.remaining.startsWith(SPECIAL_KEYS.ENTER)
    ) {
      const explanation = explainExCommand(context.exBuffer);
      context.commands.push({
        matched: `:${context.exBuffer}`,
        explanation,
      });
      context = {
        activeMode: "Normal",
        remaining: context.remaining.slice(SPECIAL_KEYS.ENTER.length),
        commands: context.commands,
      };
      continue;
    }

    // In ex mode, accumulate command characters
    if (context.activeMode === "Command") {
      context.exBuffer += context.remaining[0];
      context.remaining = context.remaining.slice(1);
      continue;
    }

    // Check for ex command start
    if (context.activeMode === "Normal" && context.remaining[0] === ":") {
      context = {
        activeMode: "Command",
        remaining: context.remaining.slice(1),
        commands: context.commands,
        exBuffer: "",
      };
      continue;
    }

    // Check for [Enter] to complete search
    if (
      context.activeMode === "Search" &&
      context.remaining.startsWith(SPECIAL_KEYS.ENTER)
    ) {
      const direction =
        context.searchDirection === "/" ? "forward" : "backward";
      context.commands.push({
        matched: `${context.searchDirection}${context.searchBuffer}`,
        explanation: `search ${direction} for "${context.searchBuffer}"`,
      });
      context = {
        activeMode: "Normal",
        remaining: context.remaining.slice(SPECIAL_KEYS.ENTER.length),
        commands: context.commands,
      };
      continue;
    }

    // Check for [Backspace] in search mode (remove last char from search buffer)
    if (
      context.activeMode === "Search" &&
      context.remaining.startsWith(SPECIAL_KEYS.BACKSPACE)
    ) {
      context.searchBuffer = context.searchBuffer.slice(0, -1);
      context.remaining = context.remaining.slice(
        SPECIAL_KEYS.BACKSPACE.length,
      );
      continue;
    }

    // In search mode, accumulate pattern characters
    if (context.activeMode === "Search") {
      // Ignore arrow keys in search mode (or handle as search termination if desired)
      const arrowKey = [
        SPECIAL_KEYS.ARROW_UP,
        SPECIAL_KEYS.ARROW_DOWN,
        SPECIAL_KEYS.ARROW_LEFT,
        SPECIAL_KEYS.ARROW_RIGHT,
      ].find((key) => context.remaining.startsWith(key));

      if (arrowKey) {
        context.remaining = context.remaining.slice(arrowKey.length);
        continue;
      }

      context.searchBuffer += context.remaining[0];
      context.remaining = context.remaining.slice(1);
      continue;
    }

    // Check for search start
    if (
      context.activeMode === "Normal" &&
      (context.remaining[0] === "/" || context.remaining[0] === "?")
    ) {
      context = {
        activeMode: "Search",
        searchDirection: context.remaining[0] as "/" | "?",
        searchBuffer: "",
        remaining: context.remaining.slice(1),
        commands: context.commands,
      };
      continue;
    }

    // In visual mode: check for operators or Esc
    if (
      context.activeMode === "Visual" ||
      context.activeMode === "VisualLine" ||
      context.activeMode === "VisualBlock"
    ) {
      // Esc exits visual mode
      if (context.remaining.startsWith(SPECIAL_KEYS.ESCAPE)) {
        context.commands.push({
          matched: SPECIAL_KEYS.ESCAPE,
          explanation: "return to normal mode",
        });
        context = {
          activeMode: "Normal",
          remaining: context.remaining.slice(SPECIAL_KEYS.ESCAPE.length),
          commands: context.commands,
        };
        continue;
      }

      // g-prefixed visual operators (gc, gu, gU, g~, gq)
      if (context.remaining[0] === "g" && context.remaining.length > 1) {
        const nextChar: string = context.remaining[1] as string;
        if (nextChar in VISUAL_G_OPERATORS) {
          const op: string = `g${nextChar}`;
          context.commands.push({
            matched: op,
            explanation: VISUAL_G_OPERATORS[nextChar],
          });
          context = {
            activeMode: "Normal",
            remaining: context.remaining.slice(op.length),
            commands: context.commands,
          };
          continue;
        }
      }

      // Single-char visual operators
      if (context.remaining[0] in VISUAL_OPERATORS) {
        const op: string = context.remaining[0] as string;
        const isChangeOp = op === "c" || op === "C" || op === "s" || op === "S";
        context.commands.push({
          matched: op,
          explanation: VISUAL_OPERATORS[op],
        });

        if (isChangeOp) {
          context = {
            activeMode: "Insert",
            remaining: context.remaining.slice(1),
            commands: context.commands,
            insertBuffer: "",
          };
        } else {
          context = {
            activeMode: "Normal",
            remaining: context.remaining.slice(1),
            commands: context.commands,
          };
        }
        continue;
      }

      // Not an operator — parse as a motion (extends the selection)
      // Fall through to handleNormalMode below
    }

    // Parse normal mode command
    const prevRemaining = context.remaining;
    context = handleNormalMode(context);

    // Safety check to prevent infinite loops
    if (context.remaining === prevRemaining) {
      break;
    }
  }

  // Flush any remaining insert buffer (no Esc at end)
  if (context.activeMode === "Insert" && context.insertBuffer.length > 0) {
    context.commands.push({
      matched: context.insertBuffer,
      explanation: `type "${context.insertBuffer}"`,
    });
  }

  // Flush any remaining search buffer (no Enter at end)
  if (context.activeMode === "Search" && context.searchBuffer.length > 0) {
    const direction = context.searchDirection === "/" ? "forward" : "backward";
    context.commands.push({
      matched: `${context.searchDirection}${context.searchBuffer}`,
      explanation: `search ${direction} for "${context.searchBuffer}"`,
    });
  }

  // Flush any remaining ex buffer (no Enter at end)
  if (context.activeMode === "Command" && context.exBuffer.length > 0) {
    context.commands.push({
      matched: `:${context.exBuffer}`,
      explanation: explainExCommand(context.exBuffer),
    });
  }

  return { commands: context.commands, remaining: context.remaining };
}

/**
 * Format an explained sequence as a human-readable string.
 */
export function formatExplanation(result: ExplainResult): string {
  return result.commands
    .map((cmd) => `${cmd.matched}: ${cmd.explanation}`)
    .join("\n");
}

/**
 * Get a simple summary of a command sequence.
 */
export function summarizeSequence(input: string): string {
  const result = explainSequence(input);
  return result.commands.map((cmd) => cmd.explanation).join(", then ");
}
