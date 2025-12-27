/**
 * Vimsplain Types
 * Types for the Vim command explanation system.
 */

/** Represents a Vim mode */
export type VimMode = "normal" | "insert" | "visual";

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
