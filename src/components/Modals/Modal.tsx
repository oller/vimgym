import { motion } from "motion/react";
import { type ReactNode, useEffect } from "react";
import { cn } from "../../utils/cn";

type ModalProps = {
  isOpen?: boolean; // Optional if controlled by AnimatePresence in parent
  onClose?: () => void;
  children: ReactNode;
  className?: string;
  showCloseButton?: boolean;
};

export const Modal = ({
  isOpen = true,
  onClose,
  children,
  className,
  showCloseButton = true,
}: ModalProps) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
        animate={{ opacity: 1, backdropFilter: "blur(0px)" }}
        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "relative w-full max-w-lg bg-tokyo-night-storm border border-gray-700 rounded-lg shadow-xl p-6 overflow-hidden",
          className,
        )}
        role="dialog"
        aria-modal="true"
      >
        {showCloseButton && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
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
            >
              <title>Close</title>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
        {children}
      </motion.div>
    </div>
  );
};
