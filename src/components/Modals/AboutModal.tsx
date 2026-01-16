import { Modal } from "./Modal";

type AboutModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const TechLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <a
    className="hover:text-gray-300 underline decoration-gray-600 hover:decoration-gray-400"
    href={href}
    rel="noopener noreferrer"
    target="_blank"
  >
    {children}
  </a>
);

export const AboutModal = ({ isOpen, onClose }: AboutModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-roboto-mono text-white mb-4">
        About VimGym <span>💪</span>
      </h2>

      <div className="space-y-4 text-gray-300">
        <p className="font-bold">The 2nd best time to learn Vim is now.</p>
        <p>
          Hotdog, Dreamweaver, TextMate, Sublime Text and VS Code. In 20+ years
          as a software engineer, your tools evolve with the technologies. I
          took pride in becoming a ninja with multi-cursor. All the while,
          avoiding the elephant in the room: Vim. Inspired by younger and wiser
          colleagues, I finally decided to give it a try. This little game is a
          result of that ongoing and satisfying journey.
        </p>
        <p>
          VimGym is an interactive playground designed to help you build muscle
          memory for Vim motions and operators.
        </p>
        <p>
          Built by{" "}
          <a
            className="text-yellow-500 hover:text-yellow-400 underline decoration-yellow-500/30 hover:decoration-yellow-400 transition-all"
            href="https://davidollerhead.com"
            rel="noopener noreferrer"
            target="_blank"
          >
            David
          </a>{" "}
          during Christmas 2025 🎄🎁
        </p>
        <p>Dedicated to Grace &amp; Clara 👶👶</p>
        <p className="text-sm text-gray-400">
          Powered by{" "}
          <TechLink href="https://tanstack.com/start">tanstack start</TechLink>,{" "}
          <TechLink href="https://tailwindcss.com">tailwindcss</TechLink>,{" "}
          <TechLink href="https://motion.dev">motion</TechLink> &amp;{" "}
          <TechLink href="https://github.com/replit/codemirror-vim">
            codemirror-vim
          </TechLink>
        </p>
      </div>
    </Modal>
  );
};
