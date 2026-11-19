import { MAX_DAILY_ATTEMPTS } from "../../schemas/daily";
import { TIER_META } from "../../utils/daily";
import { Modal } from "../Modals/Modal";

type HowToPlayDailyModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const HowToPlayDailyModal = ({
  isOpen,
  onClose,
}: HowToPlayDailyModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <h2 className="text-xl font-roboto-mono text-white">
          How to Play Vimdle
        </h2>

        <ul className="space-y-2 text-sm text-gray-300 list-disc pl-5">
          <li>
            One new multi-line Vim puzzle drops every day at{" "}
            <strong className="text-white">00:00 UTC</strong>.
          </li>
          <li>
            Transform the editor buffer to match the{" "}
            <strong className="text-white">Target</strong> in as few keystrokes
            as possible.
          </li>
          <li>
            You have{" "}
            <strong className="text-tokyo-night-pink">
              {MAX_DAILY_ATTEMPTS} official attempts
            </strong>
            . Both completing a solve and resetting after typing consume an
            attempt — plan your motions before you type!
          </li>
          <li>
            Happy with your best score?{" "}
            <strong className="text-tokyo-night-turquoise">Lock In</strong>{" "}
            early to see community stats, reveal the Par &amp; Global Best
            solutions, and unlock unlimited Free Practice.
          </li>
        </ul>

        <div className="rounded-md border border-gray-800 bg-tokyo-night/70 p-3 space-y-2">
          <div className="text-[10px] font-roboto-mono uppercase tracking-wider text-gray-400">
            Par Tiers
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-roboto-mono">
            <div className={TIER_META.under_par.textClass}>
              {TIER_META.under_par.emoji} Under Par (&lt; Par)
            </div>
            <div className={TIER_META.par.textClass}>
              {TIER_META.par.emoji} Par (= Par)
            </div>
            <div className={TIER_META.close.textClass}>
              {TIER_META.close.emoji} Close (Par + 1 to 3)
            </div>
            <div className={TIER_META.over.textClass}>
              {TIER_META.over.emoji} Over Par (Par + 4+)
            </div>
            <div className={TIER_META.abandoned.textClass}>
              {TIER_META.abandoned.emoji} Reset / Abandoned
            </div>
          </div>
        </div>

        <button
          className="w-full cursor-pointer py-2.5 rounded bg-tokyo-night-turquoise/20 hover:bg-tokyo-night-turquoise/30 border border-tokyo-night-turquoise/50 font-roboto-mono text-xs uppercase text-white transition-colors"
          onClick={onClose}
          type="button"
        >
          Got It
        </button>
      </div>
    </Modal>
  );
};
