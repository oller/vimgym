import "@testing-library/jest-dom/vitest";
import { beforeEach, vi } from "vitest";

// Global fetch mock to prevent any network requests during tests
vi.stubGlobal(
  "fetch",
  vi.fn(() => {
    return Promise.reject(new Error("Network request attempted during test!"));
  }),
);

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

// Suppress "act" warnings and Supabase noise
const originalConsoleError = console.error;
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;

console.log = (...args) => {
  if (
    typeof args[0] === "string" &&
    (args[0].includes("🚀 Submitting completion analytics") ||
      args[0].includes("✅ Successfully submitted to Supabase") ||
      args[0].includes("📡 submitLevelCompletion called with") ||
      args[0].includes("✅ Supabase client exists") ||
      args[0].includes("✅ Data validated") ||
      args[0].includes("📤 Sending to Supabase"))
  ) {
    return;
  }
  originalConsoleLog(...args);
};

console.warn = (...args) => {
  if (
    typeof args[0] === "string" &&
    args[0].includes("⚠️ Supabase not configured")
  ) {
    return;
  }
  originalConsoleWarn(...args);
};

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
// jsdom provides a localStorage object, but its methods (like getItem) are often undefined
// in this vitest setup, causing "TypeError: localStorage.getItem is not a function".
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
