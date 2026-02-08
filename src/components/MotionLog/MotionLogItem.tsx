import { motion } from "motion/react";
import type { ExplainedCommand } from "../../utils/vimsplain.types";
import { VimKbd } from "../VimKbd";

type MotionItemProps = {
  command: ExplainedCommand;
};

export const MotionLogItem = ({ command }: MotionItemProps) => {
  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-1 bg-slate-700/50 rounded overflow-hidden"
      initial={{ opacity: 0, scale: 0.8 }}
      layout
    >
      <VimKbd className="text-tokyo-night-gold">{command.matched}</VimKbd>
      <motion.span
        className="text-gray-400 text-xs px-1 whitespace-nowrap"
        layout
      >
        {command.explanation}
      </motion.span>
    </motion.div>
  );
};
