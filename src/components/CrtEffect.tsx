import { AnimatePresence, motion } from "motion/react";
import { type PropsWithChildren, useEffect, useRef } from "react";
import { useGameStore } from "../store/useGameStore";

type CrtEffectProps = PropsWithChildren<{
  onPowerOnComplete: () => void;
  onPowerOffStart: () => void;
}>;

export const CrtEffect = ({
  children,
  onPowerOnComplete,
  onPowerOffStart,
}: CrtEffectProps) => {
  const isPoweredOff = useGameStore((state) => state.isPoweredOff);
  const setPoweredOff = useGameStore((state) => state.setPoweredOff);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const wasPoweredOff = useRef(isPoweredOff);

  // Detect when isPoweredOff changes from false to true (power off starts)
  useEffect(() => {
    if (isPoweredOff && !wasPoweredOff.current) {
      onPowerOffStart();
    }
    wasPoweredOff.current = isPoweredOff;
  }, [isPoweredOff, onPowerOffStart]);

  // Focus the resume button when the animation completes
  const handleAnimationComplete = () => {
    if (isPoweredOff) {
      setTimeout(() => {
        buttonRef.current?.focus();
      }, 100);
    } else {
      // Logic for when turning ON completes
      onPowerOnComplete();
    }
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* The actual App Content - We animate this container */}
      <motion.div
        animate={
          isPoweredOff
            ? {
                scaleY: [1, 0.005, 0.005],
                scaleX: [1, 1, 0],
                filter: ["brightness(1)", "brightness(2)", "brightness(0)"],
              }
            : {
                scaleY: [0.005, 0.005, 1],
                scaleX: [0, 1, 1],
                filter: "brightness(1)",
              }
        }
        className="w-full h-full bg-tokyo-night"
        onAnimationComplete={handleAnimationComplete}
        transition={{
          duration: isPoweredOff ? 0.6 : 0.6,
          times: isPoweredOff ? [0, 0.6, 1] : [0, 0.4, 1],
          ease: "easeInOut",
        }}
      >
        {children}

        {/* White line overlay that appears during the squeeze */}
        <motion.div
          animate={isPoweredOff ? { opacity: [0, 1, 0] } : { opacity: 0 }}
          className="absolute inset-0 bg-white pointer-events-none"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.6, times: [0, 0.5, 1] }}
        />
      </motion.div>

      {/* Post-collapse black screen with noise and button */}
      <AnimatePresence>
        {isPoweredOff && (
          <motion.div
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center pointer-events-auto"
            initial={{ opacity: 0 }}
            transition={{ delay: 0.7, duration: 0.1 }}
          >
            {/* Scanlines */}
            <div
              className="absolute inset-0 pointer-events-none opacity-10"
              style={{
                background:
                  "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))",
                backgroundSize: "100% 2px, 3px 100%",
              }}
            />

            {/* Noise */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.03] animate-noise"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              }}
            />

            {/* Resume Button */}
            <motion.div
              animate={{ scale: 1, opacity: 1 }}
              className="relative z-10 text-center"
              initial={{ scale: 0, opacity: 0 }}
              transition={{ delay: 1, type: "spring", bounce: 0.5 }}
            >
              <div className="text-gray-500 font-roboto-mono mb-4 text-sm animate-pulse">
                SIGNAL LOST
              </div>
              <button
                className="px-6 py-2 border-2 border-gray-700 text-gray-400 font-roboto-mono uppercase tracking-widest hover:border-tokyo-night-blue hover:text-tokyo-night-blue hover:shadow-[0_0_15px_rgba(122,162,247,0.5)] transition-all duration-300 bg-black rounded-sm cursor-pointer outline-none focus:border-tokyo-night-blue focus:text-tokyo-night-blue focus:shadow-[0_0_15px_rgba(122,162,247,0.5)]"
                onClick={() => {
                  setPoweredOff(false);
                }}
                ref={buttonRef}
                type="button"
              >
                Reconnect
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
