import type { ParsingContext } from "../vimsplain.types.js";
import { SPECIAL_KEYS } from "../vimsplain.types.js";

export function handleSearchMode(context: ParsingContext): void {
  // Check for [Enter] to complete search
  if (context.remaining.startsWith(SPECIAL_KEYS.ENTER)) {
    const direction = context.searchDirection === "/" ? "forward" : "backward";
    context.commands.push({
      matched: `${context.searchDirection}${context.searchBuffer}`,
      explanation: `search ${direction} for "${context.searchBuffer}"`,
    });
    context.activeMode = "Normal";
    context.remaining = context.remaining.slice(SPECIAL_KEYS.ENTER.length);
    return;
  }

  // Check for [Backspace] in search mode (remove last char from search buffer)
  if (context.remaining.startsWith(SPECIAL_KEYS.BACKSPACE)) {
    context.searchBuffer = context.searchBuffer.slice(0, -1);
    context.remaining = context.remaining.slice(SPECIAL_KEYS.BACKSPACE.length);
    return;
  }

  // In search mode, accumulate pattern characters
  // Ignore arrow keys in search mode (or handle as search termination if desired)
  const arrowKey = [
    SPECIAL_KEYS.ARROW_UP,
    SPECIAL_KEYS.ARROW_DOWN,
    SPECIAL_KEYS.ARROW_LEFT,
    SPECIAL_KEYS.ARROW_RIGHT,
  ].find((key) => context.remaining.startsWith(key));

  if (arrowKey) {
    context.remaining = context.remaining.slice(arrowKey.length);
    return;
  }

  context.searchBuffer += context.remaining[0];
  context.remaining = context.remaining.slice(1);
}
