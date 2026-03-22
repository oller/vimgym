/**
 * Vimsplain - Vim Command Explainer
 *
 * Parses Vim command sequences and returns human-readable explanations.
 * Based on the Python vimsplain script, simplified for common VimGym commands.
 */

import { explainExCommand, handleCommandMode } from "./handlers/command.js";
import { handleInsertMode } from "./handlers/insert.js";
import {
  handleNormalMode,
  INSERT_MODE_TRIGGERS,
  NORMAL_COMMANDS,
} from "./handlers/normal.js";
import { handleSearchMode } from "./handlers/search.js";
import {
  handleVisualMode,
  VISUAL_G_OPERATORS,
  VISUAL_OPERATORS,
} from "./handlers/visual.js";

import type { ExplainResult, ParsingContext } from "./vimsplain.types.js";

// Re-export for external consumers (e.g., tests, table generation)
export {
  INSERT_MODE_TRIGGERS,
  NORMAL_COMMANDS,
  VISUAL_OPERATORS,
  VISUAL_G_OPERATORS,
};

/**
 * Explain a full Vim command sequence.
 * Returns an array of explained commands.
 * Handles insert mode: after commands that enter insert mode,
 * subsequent characters are grouped as "typed text" until Esc.
 * Handles search mode: / and ? start search, characters collected until Enter.
 */
export function explainSequence(input: string): ExplainResult {
  const context: ParsingContext = {
    activeMode: "Normal",
    remaining: input,
    commands: [],
    insertBuffer: "",
    exBuffer: "",
    searchBuffer: "",
    searchDirection: "/",
  };

  while (context.remaining.length > 0) {
    const prevRemaining = context.remaining;

    switch (context.activeMode) {
      case "Normal":
        handleNormalMode(context);
        break;
      case "Insert":
        handleInsertMode(context);
        break;
      case "Visual":
      case "VisualLine":
      case "VisualBlock":
        handleVisualMode(context);
        break;
      case "Command":
        handleCommandMode(context);
        break;
      case "Search":
        handleSearchMode(context);
        break;
      default: {
        void (context.activeMode satisfies never);
        break;
      }
    }

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
