import { motion } from "motion/react";
import { useEffect, useState } from "react";

const TYPING_SPEED_MS = 60;

export const Logo = () => {
  const LOGO_TEXT = "VimGym";
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [isBlinking, setIsBlinking] = useState(false);
  const [cursorIndex, setCursorIndex] = useState<number | null>(null);

  // Typing animation on mount
  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= LOGO_TEXT.length) {
        setDisplayedText(LOGO_TEXT.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        setIsBlinking(true);
        // Blink for 1.2s (enough for on-off-on) then disappear
        setTimeout(() => setIsBlinking(false), 1200);
      }
    }, TYPING_SPEED_MS);
    return () => clearInterval(interval);
  }, []);

  // Determine which character should show the cursor
  const getActiveCursor = (i: number) => {
    if (isTyping && i === displayedText.length) return "caret";
    if (isBlinking && i === LOGO_TEXT.length - 1) return "block";
    if (!isTyping && !isBlinking && cursorIndex === i) return "block";
    return null;
  };

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="relative text-xl font-roboto-mono cursor-default select-none"
      initial={{ opacity: 0 }}
      onHoverEnd={() => setCursorIndex(null)}
    >
      <div className="relative flex">
        {/* Layer 1: Cursors + invisible placeholders for sizing/events */}
        {LOGO_TEXT.split("").map((char, i) => {
          const cursor = getActiveCursor(i);
          return (
            // biome-ignore lint/a11y/noStaticElementInteractions: Presentational only
            <span
              className="relative px-px"
              // biome-ignore lint/suspicious/noArrayIndexKey: Appropriate here since text is static
              key={i}
              onMouseEnter={() => !isTyping && !isBlinking && setCursorIndex(i)}
            >
              {cursor === "caret" && (
                <motion.span
                  className="absolute left-0 top-0 bottom-0 w-0.5 bg-tokyo-night-pink"
                  layoutId="logo-cursor"
                  transition={{
                    layout: {
                      duration: TYPING_SPEED_MS / 1000,
                      ease: "linear",
                    },
                  }}
                />
              )}
              {cursor === "block" && (
                <motion.span
                  animate={isBlinking ? { opacity: [1, 0, 1] } : { opacity: 1 }}
                  className="absolute inset-0 bg-tokyo-night-pink"
                  layoutId="logo-cursor"
                  transition={{
                    opacity: { duration: 0.8, ease: "easeInOut", repeat: 1 },
                    layout: { duration: 0.15, ease: "easeOut" },
                  }}
                />
              )}
              {/* Invisible char for sizing */}
              <span className="invisible">{char}</span>
            </span>
          );
        })}

        {/* Layer 2: Visible text overlay - blends with all cursors below */}
        <div className="absolute inset-0 flex pointer-events-none">
          {LOGO_TEXT.split("").map((char, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Appropriate here since text is static
            <span className="px-px text-gray-400 mix-blend-difference" key={i}>
              {i < displayedText.length ? char : "\u00A0"}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
