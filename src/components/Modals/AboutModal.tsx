import { Modal } from "./Modal";

type AboutModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const AboutModal = ({ isOpen, onClose }: AboutModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-roboto-mono text-white mb-4">
        About VimGym <span>💪</span>
      </h2>

      <div className="space-y-4 text-gray-300">
        <p className="font-bold">The 2nd best time to learn Vim is now.</p>
        <p>
          Having avoided Vim for 20 years as an engineer, insipred by younger
          and wiser colleagues, I finally decided to give it a try. This game is
          a result of that ongoing and fulfilling journey.
        </p>

        <p>
          VimGym is an interactive playground designed to help you build muscle
          memory for Vim motions and operators.
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
    </Modal>
  );
};
