import { Modal } from "./Modal";
import { ModalLink } from "./ModalLink";

type MotionLogInfoModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const MotionLogInfoModal = ({
  isOpen,
  onClose,
}: MotionLogInfoModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-roboto-mono text-white mb-4">
        About the Motion Log
      </h2>
      <div className="space-y-4 text-gray-300">
        <p>
          The motion log parses your Vim keystrokes in real time and explains
          each command as you type, helping you build an understanding of what
          you&apos;re doing — not just muscle memory.
        </p>
        <p>
          Powered by{" "}
          <ModalLink href="https://www.npmjs.com/package/vimsplain">
            vimsplain
          </ModalLink>
          , an open source npm package written for this project. It parses Vim
          keystroke sequences and returns structured, human-readable
          explanations for each command.
        </p>
        <p>
          Inspired by{" "}
          <ModalLink href="https://github.com/pafcu/vimsplain">
            pafcu/vimsplain
          </ModalLink>
          , a Python script that parses Vim keystroke sequences using Vim&apos;s
          official{" "}
          <code className="text-xs bg-gray-800 px-1 rounded">index.txt</code>{" "}
          help file.
        </p>
      </div>
    </Modal>
  );
};
