import type { ParsingContext } from "../vimsplain.types.js";
import { SPECIAL_KEYS } from "../vimsplain.types.js";

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

export function explainExCommand(cmd: string): string {
  const trimmed = cmd.trim();
  if (trimmed in EX_COMMANDS) {
    return EX_COMMANDS[trimmed] as string;
  }
  if (/^s\//.test(trimmed)) {
    return "substitute";
  }
  return `run ex command '${trimmed}'`;
}

export function handleCommandMode(context: ParsingContext): void {
  // Check for [Enter] to complete ex command
  if (context.remaining.startsWith(SPECIAL_KEYS.ENTER)) {
    const explanation = explainExCommand(context.exBuffer);
    context.commands.push({
      matched: `:${context.exBuffer}`,
      explanation,
    });
    context.activeMode = "Normal";
    context.remaining = context.remaining.slice(SPECIAL_KEYS.ENTER.length);
    return;
  }

  // In ex mode, accumulate command characters
  context.exBuffer += context.remaining[0];
  context.remaining = context.remaining.slice(1);
}
