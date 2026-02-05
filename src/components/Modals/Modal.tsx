import { motion } from "motion/react";
import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { cn } from "../../utils/cn";
import { CloseIcon } from "../icons/CloseIcon";

type ModalProps = {
  isOpen?: boolean; // Optional if controlled by AnimatePresence in parent
  onClose?: () => void;
  className?: string;
  showCloseButton?: boolean;
};

export const Modal = ({
  isOpen = true,
  onClose,
  children,
  className,
  showCloseButton = true,
}: PropsWithChildren<ModalProps>) => {
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
        animate={{ opacity: 1, backdropFilter: "blur(0px)" }}
        aria-hidden="true"
        className="absolute inset-0 bg-black/50"
        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
        onClick={onClose}
      />

      {/* Modal Content */}
      <motion.div
        animate={{ scale: 1, opacity: 1, y: 0 }}
        aria-modal="true"
        className={cn(
          "relative w-full max-w-lg bg-tokyo-night-storm border border-gray-700 rounded-lg shadow-xl p-6 overflow-hidden",
          className,
        )}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        role="dialog"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {showCloseButton && onClose && (
          <button
            aria-label="Close"
            className="cursor-pointer absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
            onClick={onClose}
            type="button"
          >
            <CloseIcon height={20} width={20} />
          </button>
        )}
        {children}
      </motion.div>
    </div>
  );
};
