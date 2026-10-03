/**
 * Vimsplain Types
 * Types for the Vim command explanation system.
 */

/** A single explained command from a sequence */
export type ExplainedCommand = {
  /** The matched key sequence */
  matched: string;
  /** Human-readable explanation */
  explanation: string;
};

/** Result of explaining a full command sequence */
export type ExplainResult = {
  /** Array of explained commands */
  commands: ExplainedCommand[];
  /** Any remaining unparsed input */
  remaining: string;
};

export type VimMode =
  | "Normal"
  | "Insert"
  | "Visual"
  | "VisualLine"
  | "VisualBlock"
  | "Command" // Ex mode
  | "Search";

export type ParsingContext = {
  remaining: string;
  commands: ExplainedCommand[];
  activeMode: VimMode;
  insertBuffer: string;
  exBuffer: string;
  searchBuffer: string;
  searchDirection: "/" | "?";
};

/** Command definition with pattern and description */
export type CommandDefinition = {
  /** Regex pattern to match the command */
  pattern: RegExp;
  /** Description template (can include $1, $2 for captures) */
  description: string;
  /** Whether this is a motion command */
  isMotion: boolean;
  /** Whether this command expects a motion after it */
  expectsMotion?: boolean;
};

/** Special key representations for motion logging */
export const SPECIAL_KEYS = {
  ESCAPE: "[Esc]",
  ENTER: "[Enter]",
  BACKSPACE: "[Backspace]",
  ARROW_UP: "[Up]",
  ARROW_DOWN: "[Down]",
  ARROW_LEFT: "[Left]",
  ARROW_RIGHT: "[Right]",
  CTRL_R: "[C-r]",
  DELETE: "[Delete]",
  CTRL_W: "[C-w]",
  CTRL_O: "[C-o]",
  CTRL_I: "[C-i]",
  CTRL_D: "[C-d]",
  CTRL_U: "[C-u]",
  CTRL_F: "[C-f]",
  CTRL_B: "[C-b]",
  CTRL_V: "[C-v]",
  CTRL_C: "[C-c]",
  CTRL_E: "[C-e]",
  CTRL_Y: "[C-y]",
} as const;

/** Key mapping for modifier combinations */
export const MODIFIER_KEY_MAP = {
  // Ctrl+key combinations
  "ctrl+r": SPECIAL_KEYS.CTRL_R,
  "ctrl+w": SPECIAL_KEYS.CTRL_W,
  "ctrl+o": SPECIAL_KEYS.CTRL_O,
  "ctrl+i": SPECIAL_KEYS.CTRL_I,
  "ctrl+d": SPECIAL_KEYS.CTRL_D,
  "ctrl+u": SPECIAL_KEYS.CTRL_U,
  "ctrl+f": SPECIAL_KEYS.CTRL_F,
  "ctrl+b": SPECIAL_KEYS.CTRL_B,
  "ctrl+v": SPECIAL_KEYS.CTRL_V,
  "ctrl+c": SPECIAL_KEYS.CTRL_C,
  "ctrl+e": SPECIAL_KEYS.CTRL_E,
  "ctrl+y": SPECIAL_KEYS.CTRL_Y,
} as const;
