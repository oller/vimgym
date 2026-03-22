import type { ParsingContext } from "../vimsplain.types.js";
import { SPECIAL_KEYS } from "../vimsplain.types.js";

export function handleInsertMode(context: ParsingContext): void {
  // Check for [Esc] to exit insert mode
  if (context.remaining.startsWith(SPECIAL_KEYS.ESCAPE)) {
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
    context.activeMode = "Normal";
    context.remaining = context.remaining.slice(SPECIAL_KEYS.ESCAPE.length);
    return;
  }

  // Check for [Backspace] in insert mode (display separately)
  if (context.remaining.startsWith(SPECIAL_KEYS.BACKSPACE)) {
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
    context.remaining = context.remaining.slice(SPECIAL_KEYS.BACKSPACE.length);
    return;
  }

  // Check for [Delete] in insert mode
  if (context.remaining.startsWith(SPECIAL_KEYS.DELETE)) {
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
    return;
  }

  // Check for [Enter] in insert mode (display separately)
  if (context.remaining.startsWith(SPECIAL_KEYS.ENTER)) {
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
    return;
  }

  // Check for arrow keys in insert mode (flush buffer and log motion)
  const arrowKey = [
    SPECIAL_KEYS.ARROW_UP,
    SPECIAL_KEYS.ARROW_DOWN,
    SPECIAL_KEYS.ARROW_LEFT,
    SPECIAL_KEYS.ARROW_RIGHT,
  ].find((key) => context.remaining.startsWith(key));

  if (arrowKey) {
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
    return;
  }

  // In insert mode, accumulate characters
  context.insertBuffer += context.remaining[0];
  context.remaining = context.remaining.slice(1);
}
