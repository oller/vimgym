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
} & (
  | {
      activeMode: Extract<
        VimMode,
        "Normal" | "Visual" | "VisualLine" | "VisualBlock"
      >;
    }
  | { activeMode: Extract<VimMode, "Insert">; insertBuffer: string }
  | { activeMode: Extract<VimMode, "Command">; exBuffer: string }
  | {
      activeMode: Extract<VimMode, "Search">;
      searchBuffer: string;
      searchDirection: "/" | "?";
    }
);

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
} as const;

/** Key mapping for modifier combinations */
export const MODIFIER_KEY_MAP = {
  // Ctrl+key combinations
  "ctrl+r": SPECIAL_KEYS.CTRL_R,
} as const;
