import { beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";

beforeEach(() => {
  document.createRange = () => {
    const range = new Range();
    range.getBoundingClientRect = () => ({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      toJSON: () => {},
    });
    range.getClientRects = () => ({
      length: 0,
      item: () => null,
      [Symbol.iterator]: [][Symbol.iterator],
    });
    return range;
  };
});

// Suppress "act" warnings
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === "string" &&
    (args[0].includes("inside a test was not wrapped in act(...)") ||
      args[0].includes(
        "The current testing environment is not configured to support act(...)",
      ))
  ) {
    return;
  }
  originalConsoleError(...args);
};
