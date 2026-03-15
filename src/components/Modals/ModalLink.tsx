import type { PropsWithChildren } from "react";

export const ModalLink = ({
  href,
  children,
}: PropsWithChildren<{ href: string }>) => (
  <a
    className="text-tokyo-night-pink underline decoration-tokyo-night-pink/30 hover:decoration-tokyo-night-pink transition-all"
    href={href}
    rel="noopener noreferrer"
    target="_blank"
  >
    {children}
  </a>
);
