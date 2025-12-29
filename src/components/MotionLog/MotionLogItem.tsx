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
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-1 bg-slate-700/50 rounded overflow-hidden"
    >
      <motion.kbd
        layout
        className="px-1.5 py-0.5 bg-slate-800/80 rounded text-yellow-500 min-w-[20px] text-center"
      >
        {formatKeyForDisplay(command.matched)}
      </motion.kbd>
      <motion.span
        layout
        className="text-gray-400 text-xs px-1 whitespace-nowrap"
      >
        {command.explanation}
      </motion.span>
    </motion.div>
  );
};
