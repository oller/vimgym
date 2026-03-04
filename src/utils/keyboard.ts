import { MODIFIER_KEY_MAP, SPECIAL_KEYS } from "./vimsplain.types";

/** Display mapping for special key sequences */
const SPECIAL_KEY_DISPLAY_MAP = {
  "[Up]": "↑",
  "[Down]": "↓",
  "[Left]": "←",
  "[Right]": "→",
  "[Enter]": "↵",
  "[Esc]": "Esc",
  "[Backspace]": "⌫",
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
  else if (key === "ArrowUp") key = SPECIAL_KEYS.ARROW_UP;
  else if (key === "ArrowDown") key = SPECIAL_KEYS.ARROW_DOWN;
  else if (key === "ArrowLeft") key = SPECIAL_KEYS.ARROW_LEFT;
  else if (key === "ArrowRight") key = SPECIAL_KEYS.ARROW_RIGHT;

  return key;
};

/**
 * Resolves a mobile soft keyboard beforeinput event into a VimGym keystroke.
 * Maps standard inputTypes to special keys.
 */
export const resolveBeforeInputEvent = (event: InputEvent): string | null => {
  if (
    event.inputType === "insertText" &&
    event.data &&
    event.data.length === 1
  ) {
    return event.data;
  }

  if (event.inputType === "insertLineBreak") {
    return SPECIAL_KEYS.ENTER;
  }

  if (
    event.inputType === "deleteContentBackward" ||
    event.inputType === "deleteWordBackward"
  ) {
    return SPECIAL_KEYS.BACKSPACE;
  }

  return null;
};
