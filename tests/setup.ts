import "@testing-library/jest-dom/vitest";
import { beforeEach, vi } from "vitest";

// Global Supabase Mock
vi.mock("../src/lib/supabase/client", () => ({
  getSupabaseClient: () => ({
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  }),
}));

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

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});
