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
