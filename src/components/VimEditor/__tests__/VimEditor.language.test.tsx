import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useGameStore } from "../../../store/useGameStore";
import { VimEditor } from "../VimEditor";

// Mock nuqs router query hooks
vi.mock("nuqs", () => ({
  useQueryState: vi.fn().mockReturnValue(["delete-words", vi.fn()]),
  parseAsString: {
    withDefault: vi.fn().mockReturnThis(),
    withOptions: vi.fn().mockReturnThis(),
  },
}));

// Mock language extensions
vi.mock("@codemirror/lang-html", () => ({ html: vi.fn(() => []) }));
vi.mock("@codemirror/lang-javascript", () => ({ javascript: vi.fn(() => []) }));
vi.mock("@codemirror/lang-markdown", () => ({ markdown: vi.fn(() => []) }));
vi.mock("@codemirror/lang-json", () => ({ json: vi.fn(() => []) }));

import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";

describe("VimEditor - Language Switching", () => {
  const originalStore = useGameStore.getState();

  // Need to mock getLevel for these tests
  vi.mock("../../../data/levels", async (importOriginal) => {
    const actual =
      await importOriginal<typeof import("../../../data/levels")>();
    return {
      ...actual,
      getLevel: (id: string) => {
        if (id === "test-html") return { id, language: "html" };
        if (id === "test-js") return { id, language: "javascript" };
        if (id === "test-md") return { id, language: "markdown" };
        if (id === "test-json") return { id, language: "json" };
        if (id === "test-default") return { id }; // No language specified
        return actual.getLevel(id);
      },
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    useGameStore.setState(originalStore);
  });

  it("loads markdown extension for markdown levels", () => {
    useGameStore.setState({ currentLevel: "test-md", isCompleted: false });
    render(<VimEditor />);
    expect(markdown).toHaveBeenCalled();
  });

  it("loads json extension for json levels", () => {
    useGameStore.setState({ currentLevel: "test-json", isCompleted: false });
    render(<VimEditor />);
    expect(json).toHaveBeenCalled();
  });

  it("defaults to markdown if no language is specified", () => {
    useGameStore.setState({ currentLevel: "test-default", isCompleted: false });
    render(<VimEditor />);
    expect(markdown).toHaveBeenCalled();
  });
});
