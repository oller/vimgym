import { useEffect } from "react";

type AboutModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const AboutModal = ({ isOpen, onClose }: AboutModalProps) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-tokyo-night-storm border border-gray-700 rounded-lg shadow-xl p-6 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-label="Close"
          >
            <title>Close</title>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <h2 className="text-xl font-roboto-mono text-white mb-4">
          About VimGym
        </h2>

        <div className="space-y-4 text-gray-300">
          <p className="font-bold">The 2nd best time to learn VIM is now.</p>
          <p>
            Having avoided VIM for 20 years as an engineer, insipred by younger
            and wiser colleagues, I finally decided to give it a try. This game
            is a result of that fulfilling journey.
          </p>

          <p>
            VimGym is an interactive playground designed to help you build
            muscle memory for Vim motions and operators.
          </p>
          <p>
            Built by{" "}
            <a
              href="https://davidollerhead.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-500 hover:text-yellow-400 underline decoration-yellow-500/30 hover:decoration-yellow-400 transition-all"
            >
              David Ollerhead
            </a>{" "}
            during Christmas 2025 🎄🎁
          </p>
          <p className="text-sm text-gray-400">
            Powered by{" "}
            <a
              href="https://tanstack.com/start"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300 underline decoration-gray-600 hover:decoration-gray-400"
            >
              tanstack start
            </a>
            ,{" "}
            <a
              href="https://tailwindcss.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300 underline decoration-gray-600 hover:decoration-gray-400"
            >
              tailwindcss
            </a>{" "}
            &amp;{" "}
            <a
              href="https://github.com/replit/codemirror-vim"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300 underline decoration-gray-600 hover:decoration-gray-400"
            >
              codemirror-vim
            </a>
          </p>
        </div>
      </div>
      {/* Backdrop click to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
        aria-hidden="true"
      />
    </div>
  );
};
