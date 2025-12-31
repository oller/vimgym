import "@testing-library/jest-dom";
import { beforeEach } from "vitest";

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
