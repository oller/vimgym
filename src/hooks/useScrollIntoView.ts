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
    // We want to trigger this effect when `trigger` changes,
    // even if we don't use the value directly.
    void trigger;
    if (ref.current) {
      ref.current.scrollIntoView(options);
    }
  }, [trigger, options]);

  return ref;
};
