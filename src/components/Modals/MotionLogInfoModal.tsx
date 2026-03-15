import type { PropsWithChildren } from "react";
import { Modal } from "./Modal";

type MotionLogInfoModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const InfoLink = ({ href, children }: PropsWithChildren<{ href: string }>) => (
  <a
    className="hover:text-gray-300 underline decoration-gray-600 hover:decoration-gray-400"
    href={href}
    rel="noopener noreferrer"
    target="_blank"
  >
    {children}
  </a>
);

export const MotionLogInfoModal = ({
  isOpen,
  onClose,
}: MotionLogInfoModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-roboto-mono text-white mb-4">
        About the Motion Log
      </h2>
      <div className="space-y-4 text-gray-300 text-sm">
        <p>
          The motion log parses your Vim keystrokes in real time and explains
          each command as you type, helping you build an understanding of what
          you&apos;re doing — not just muscle memory.
        </p>
        <p>
          Powered by{" "}
          <InfoLink href="https://www.npmjs.com/package/vimsplain">
            vimsplain
          </InfoLink>
          , an open source npm package written for this project. It parses Vim
          keystroke sequences and returns structured, human-readable
          explanations for each command.
        </p>
        <p>
          Inspired by{" "}
          <InfoLink href="https://github.com/pafcu/vimsplain">
            pafcu/vimsplain
          </InfoLink>
          , a Python script that parses Vim keystroke sequences using Vim&apos;s
          official{" "}
          <code className="text-xs bg-gray-800 px-1 rounded">index.txt</code>{" "}
          help file.
        </p>
      </div>
    </Modal>
  );
};
