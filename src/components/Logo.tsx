import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "../utils/cn";

const TYPING_SPEED_MS = 60;

export const Logo = () => {
  const text = "VimGym";
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [isBlinking, setIsBlinking] = useState(false);
  const [cursorIndex, setCursorIndex] = useState<number | null>(null);

  // Typing animation on mount
  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayedText(text.slice(0, currentIndex));
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

  return (
    <motion.div
      className="relative text-xl font-roboto-mono cursor-default select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onHoverStart={() => setCursorIndex(0)}
      onHoverEnd={() => setCursorIndex(null)}
    >
      <div className="flex">
        {text.split("").map((char, i) => {
          // Determine if this character is currently "active" (being typed or hovered)
          const isTypingActive =
            isTyping &&
            i === displayedText.length - 1 &&
            displayedText.length > 0;
          const isBlinkingActive = isBlinking && i === text.length - 1;
          const isHoverActive = !isTyping && !isBlinking && cursorIndex === i;

          // Show cursor on this character?
          const showCursor =
            isTypingActive || isBlinkingActive || isHoverActive;

          return (
            <motion.span
              // biome-ignore lint/suspicious/noArrayIndexKey: Characters are static and stable
              key={i}
              className={cn(
                "relative px-px transition-colors duration-100 text-gray-400",
              )}
              onMouseEnter={() => !isTyping && !isBlinking && setCursorIndex(i)}
            >
              {/* The Character */}
              <span className="relative z-10">
                {/* Only show char if it's been typed already */}
                {i < displayedText.length ? char : ""}
              </span>

              {/* The Cursor Block */}
              {showCursor && (
                <motion.span
                  layoutId="logo-cursor"
                  className="absolute inset-0 bg-tokyo-night-pink z-0 block"
                  animate={
                    isBlinkingActive ? { opacity: [1, 0, 1] } : { opacity: 1 }
                  }
                  transition={{
                    opacity: {
                      duration: 0.8,
                      ease: "easeInOut",
                      repeat: 1, // Repeat once to get on-off-on
                    },
                    layout: {
                      // During typing, match the interval exactly so cursor lands as char appears
                      duration: isTyping ? TYPING_SPEED_MS / 1000 : 0.15,
                      ease: isTyping ? "linear" : "easeOut",
                    },
                  }}
                />
              )}
            </motion.span>
          );
        })}
        {/* Blinking cursor at the end during typing phase if needed, 
            but the design above puts cursor ON the character. 
            Standard Vim cursor is a block ON the char. */}
      </div>
    </motion.div>
  );
};
