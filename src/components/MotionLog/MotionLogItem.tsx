import { motion } from "motion/react";

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
// biome-ignore lint/style/useComponentExportOnlyModules: Utility function used by component
export const formatKeyForDisplay = (key: string): string => {
  let formatted = key.replace(/ /g, "␣");

  // Apply special key mappings
  // The regex escapes all special regex characters in the pattern to treat
  // literal strings like "[C-r]" as literal characters, not regex patterns
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

type MotionItemProps = {
  command: {
    matched: string;
    explanation: string;
  };
};

export const MotionLogItem = ({ command }: MotionItemProps) => {
  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-1 bg-slate-700/50 rounded overflow-hidden"
      initial={{ opacity: 0, scale: 0.8 }}
      layout
    >
      <motion.kbd
        className="px-1.5 py-0.5 bg-slate-800/80 rounded text-yellow-500 min-w-[20px] text-center"
        layout
      >
        {formatKeyForDisplay(command.matched)}
      </motion.kbd>
      <motion.span
        className="text-gray-400 text-xs px-1 whitespace-nowrap"
        layout
      >
        {command.explanation}
      </motion.span>
    </motion.div>
  );
};
