import { motion } from "motion/react";

/** Format a key sequence for display - replace spaces and specials with visible symbols */
const formatKeyForDisplay = (key: string): string => {
  return key
    .replace(/ /g, "␣")
    .replace(/\[Up\]/g, "↑")
    .replace(/\[Down\]/g, "↓")
    .replace(/\[Left\]/g, "←")
    .replace(/\[Right\]/g, "→")
    .replace(/\[Enter\]/g, "↵")
    .replace(/\[Esc\]/g, "Esc")
    .replace(/\[Backspace\]/g, "⌫");
};

type MotionItemProps = {
  command: {
    matched: string;
    explanation: string;
  };
};

export const MotionItem = ({ command }: MotionItemProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="flex items-center gap-1 bg-slate-700/50 rounded"
    >
      <kbd className="px-1.5 py-0.5 bg-slate-800/80 rounded text-yellow-500">
        {formatKeyForDisplay(command.matched)}
      </kbd>
      <span className="text-gray-400 text-xs px-1">{command.explanation}</span>
    </motion.div>
  );
};
