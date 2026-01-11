import { useEffect, useRef } from "react";

/**
 * A hook that scrolls an element into view when a dependency changes.
 * Returns a ref to be attached to the target element.
 */
export const useScrollIntoView = <T extends HTMLElement>(
  trigger: unknown,
  options: ScrollIntoViewOptions = { behavior: "smooth", block: "nearest" },
) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    void trigger;
    if (ref.current) {
      const rafId = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (ref.current && typeof ref.current.scrollIntoView === "function") {
            ref.current.scrollIntoView(options);
          }
        });
      });
      return () => cancelAnimationFrame(rafId);
    }
  }, [trigger, options]);

  return ref;
};
