// Public API
export {
  explainSequence,
  formatExplanation,
  summarizeSequence,
  VISUAL_G_OPERATORS,
  VISUAL_OPERATORS,
} from "./vimsplain.js";

// Types
export type {
  CommandDefinition,
  ExplainedCommand,
  ExplainResult,
  ParsingContext,
  VimMode,
} from "./vimsplain.types.js";

// Constants (used by consumers like keyboard.ts)
export { MODIFIER_KEY_MAP, SPECIAL_KEYS } from "./vimsplain.types.js";
