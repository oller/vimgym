import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EditorErrorBoundary } from "../EditorErrorBoundary";

// biome-ignore lint/style/useComponentExportOnlyModules: Test fixture component
const ThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("Simulated CodeMirror Vim crash");
  }
  return <div data-testid="editor-ok">Editor Active</div>;
};

describe("EditorErrorBoundary", () => {
  // biome-ignore lint/suspicious/noConsole: Spy on console.error during tests
  const originalConsoleError = console.error;

  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it("renders children when no error occurs", () => {
    render(
      <EditorErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </EditorErrorBoundary>,
    );

    expect(screen.getByTestId("editor-ok")).toBeInTheDocument();
  });

  it("renders fallback UI when child throws", () => {
    render(
      <EditorErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </EditorErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/VIM ENGINE SUBSYSTEM CRASH/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Simulated CodeMirror Vim crash/i),
    ).toBeInTheDocument();
  });

  it("calls onReset callback when clicking Reset Level", async () => {
    const user = userEvent.setup();
    const handleReset = vi.fn();

    render(
      <EditorErrorBoundary onReset={handleReset}>
        <ThrowingComponent shouldThrow={true} />
      </EditorErrorBoundary>,
    );

    const resetBtn = screen.getByRole("button", { name: /reset level/i });
    await user.click(resetBtn);

    expect(handleReset).toHaveBeenCalledTimes(1);
  });
});
