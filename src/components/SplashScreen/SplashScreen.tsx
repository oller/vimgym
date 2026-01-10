import { useEffect, useState } from "react";
import { cn } from "../../utils/cn";

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

// ASCII art inspired by the blocky SVG style of "opencode"
// Each line split at column 24 (after the M in VIM)
const LOGO_LINES = [
  { vim: "██╗   ██╗██╗███╗   ███╗", gym: " ██████╗ ██╗   ██╗███╗   ███╗" },
  { vim: "██║   ██║██║████╗ ████║", gym: "██╔════╝ ╚██╗ ██╔╝████╗ ████║" },
  { vim: "██║   ██║██║██╔████╔██║", gym: "██║  ███╗ ╚████╔╝ ██╔████╔██║" },
  { vim: "╚██╗ ██╔╝██║██║╚██╔╝██║", gym: "██║   ██║  ╚██╔╝  ██║╚██╔╝██║" },
  { vim: " ╚████╔╝ ██║██║ ╚═╝ ██║", gym: "╚██████╔╝   ██║   ██║ ╚═╝ ██║" },
  { vim: "  ╚═══╝  ╚═╝╚═╝     ╚═╝", gym: " ╚═════╝    ╚═╝   ╚═╝     ╚═╝" },
];

export function SplashScreen({
  onComplete,
  duration = 1500,
}: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Start fade out after showing the splash
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, duration - 500); // Start fading 500ms before completion

    // Complete and unmount
    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-tokyo-night transition-opacity duration-500",
        isFading ? "opacity-0" : "opacity-100",
      )}
      data-testid="splash-screen"
    >
      <pre
        aria-label="VIMGYM"
        className="font-roboto-mono text-[0.5rem] sm:text-xs md:text-sm lg:text-base select-none"
        role="img"
      >
        {LOGO_LINES.map((line) => (
          <div key={line.vim}>
            <span className="text-tokyo-night-pink/70">{line.vim}</span>
            <span className="text-tokyo-night-pink">{line.gym}</span>
          </div>
        ))}
      </pre>
    </div>
  );
}
