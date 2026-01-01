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
