import { MODIFIER_KEY_MAP, SPECIAL_KEYS } from "vimsplain";

/** Display mapping for special key sequences */
const SPECIAL_KEY_DISPLAY_MAP = {
  "[Up]": "↑",
  "[Down]": "↓",
  "[Left]": "←",
  "[Right]": "→",
  "[Enter]": "↵",
  "[Esc]": "Esc",
  "[Backspace]": "⌫",
  "[Delete]": "Del",
  "[C-r]": "Ctrl+R",
} as const;

/** Format a key sequence for display - replace spaces and specials with visible symbols */
export const formatKeyForDisplay = (key: string): string => {
  let formatted = key.replace(/ /g, "␣");

  for (const [pattern, replacement] of Object.entries(
    SPECIAL_KEY_DISPLAY_MAP,
  )) {
    formatted = formatted.replace(
      new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
      replacement,
    );
  }

  return formatted;
};

/**
 * Normalizes a KeyboardEvent key into VimGym's internal representation.
 * Returns null if the key should be ignored (like modifier keys).
 */
export const normalizeKeydownEvent = (event: KeyboardEvent): string | null => {
  // Skip modifier keys
  if (
    ["Shift", "Control", "Alt", "Meta", "CapsLock", "Tab"].includes(event.key)
  ) {
    return null;
  }

  let key = event.key;

  // Check for modifier combinations first
  if (event.ctrlKey) {
    const modifierKey = `ctrl+${key.toLowerCase()}`;
    if (modifierKey in MODIFIER_KEY_MAP) {
      key = MODIFIER_KEY_MAP[modifierKey as keyof typeof MODIFIER_KEY_MAP];
    }
  }
  // Then check for standalone special keys (only if not already handled by modifier)
  else if (key === "Escape") key = SPECIAL_KEYS.ESCAPE;
  else if (key === "Enter") key = SPECIAL_KEYS.ENTER;
  else if (key === "Backspace") key = SPECIAL_KEYS.BACKSPACE;
  else if (key === "Delete") key = SPECIAL_KEYS.DELETE;
  else if (key === "ArrowUp") key = SPECIAL_KEYS.ARROW_UP;
  else if (key === "ArrowDown") key = SPECIAL_KEYS.ARROW_DOWN;
  else if (key === "ArrowLeft") key = SPECIAL_KEYS.ARROW_LEFT;
  else if (key === "ArrowRight") key = SPECIAL_KEYS.ARROW_RIGHT;

  return key;
};

/** Map from vim's special key format to VimGym's internal representation */
const VIM_KEY_MAP: Record<string, string> = {
  "<Esc>": SPECIAL_KEYS.ESCAPE,
  "<CR>": SPECIAL_KEYS.ENTER,
  "<BS>": SPECIAL_KEYS.BACKSPACE,
  "<Del>": SPECIAL_KEYS.DELETE,
  "<Up>": SPECIAL_KEYS.ARROW_UP,
  "<Down>": SPECIAL_KEYS.ARROW_DOWN,
  "<Left>": SPECIAL_KEYS.ARROW_LEFT,
  "<Right>": SPECIAL_KEYS.ARROW_RIGHT,
  "<C-r>": SPECIAL_KEYS.CTRL_R,
};

/**
 * Normalizes a vim key string (from Vim.handleKey) into VimGym's internal
 * representation. Vim uses angle-bracket notation for special keys
 * (e.g. `<Esc>`, `<CR>`, `<C-r>`), which this function maps to our
 * bracket format (`[Esc]`, `[Enter]`, `[C-r]`).
 *
 * Returns null if the key should be ignored.
 */
export const normalizeVimKey = (vimKey: string): string | null => {
  // Map known vim special keys
  if (vimKey in VIM_KEY_MAP) {
    return VIM_KEY_MAP[vimKey];
  }

  // Single printable characters pass through unchanged
  if (vimKey.length === 1) {
    return vimKey;
  }

  // Unknown multi-char sequences — ignore (e.g. unmapped modifier combos)
  return null;
};
