import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { usePlayerDashboard } from "../../hooks/api";
import { getUserId } from "../../lib/analytics";
import { useGameStore } from "../../store/useGameStore";
import { cn } from "../../utils/cn";
import { Modal } from "./Modal";

type CompletionModalProps = {
  onNext: () => void;
  hasNextLevel: boolean;
};

export const CompletionModal = ({
  onNext,
  hasNextLevel,
}: CompletionModalProps) => {
  const history = useGameStore((state) => state.history);
  const currentLevel = useGameStore((state) => state.currentLevel);
  const [showConfetti, setShowConfetti] = useState(false);

  const userId = getUserId();
  const { data: dashboard = {} } = usePlayerDashboard(userId);
  const levelStats = dashboard[currentLevel];
  const bestScore = levelStats?.user?.best;
  const isNewBest =
    bestScore !== null && history.length > 0 && history.length < bestScore;

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Modal
      className="border-tokyo-night-turquoise max-w-sm text-center"
      showCloseButton={false}
    >
      <motion.h2
        animate={{ y: 0, opacity: 1 }}
        className="text-3xl mb-2 font-roboto-mono text-tokyo-night-turquoise"
        data-testid="level-complete"
        initial={{ y: -20, opacity: 0 }}
        transition={{ delay: 0.1 }}
      >
        Level Complete
      </motion.h2>

      <motion.div
        animate={{ opacity: 1 }}
        className="space-y-4 font"
        initial={{ opacity: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="py-4">
          <div className="text-gray-400 text-sm">Keystrokes</div>
          <output
            aria-label="keystrokes"
            className="text-4xl font-roboto-mono text-tokyo-night-turquoise flex flex-col gap-2"
          >
            {history.length}
            {isNewBest && (
              <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded border border-yellow-500/50 animate-pulse">
                NEW BEST!
              </span>
            )}
          </output>
        </div>

        {hasNextLevel ? (
          <div className="space-y-2">
            <button
              className="w-full cursor-pointer bg-tokyo-night-turquoise/20 hover:bg-tokyo-night-turquoise/30 text-white py-3 px-6 transition-colors font-roboto-mono"
              onClick={onNext}
              type="button"
            >
              Next Level
            </button>
            <p className="text-xs text-gray-500">
              Press{" "}
              <kbd className="px-1 bg-gray-800 rounded text-gray-300">
                Enter
              </kbd>{" "}
              to continue
            </p>
          </div>
        ) : (
          <div className="text-yellow-400 font-normal">
            🎉 All levels completed!
          </div>
        )}
      </motion.div>

      {/* Simple CSS Confetti (simulated with dots) */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(100)].map((_, i) => (
            <motion.div
              animate={{
                left: `${50 + (Math.random() * 100 - 50)}%`,
                top: `${50 + (Math.random() * 100 - 50)}%`,
                scale: [0, 1, 0],
                opacity: [1, 1, 0],
              }}
              className={cn(
                "absolute size-1.5 rounded-full",
                [
                  "bg-yellow-600",
                  "bg-yellow-500",
                  "bg-yellow-400",
                  "bg-yellow-300",
                ][i % 4],
              )}
              initial={{
                left: "50%",
                top: "50%",
                x: "-50%",
                y: "-50%",
                scale: 0,
              }}
              // biome-ignore lint/suspicious/noArrayIndexKey: Visual-only particles, stable count
              key={i}
              transition={{
                duration: 1,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}
    </Modal>
  );
};
