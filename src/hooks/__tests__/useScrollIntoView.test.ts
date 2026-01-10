import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useScrollIntoView } from "../useScrollIntoView";

const mockScrollIntoView = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  window.HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
});

describe("useScrollIntoView", () => {
  it("returns a ref", () => {
    const { result } = renderHook(() => useScrollIntoView(0));
    expect(result.current).toBeDefined();
    expect(result.current.current).toBeNull();
  });

  it("calls scrollIntoView when trigger changes", async () => {
    const { result, rerender } = renderHook(
      ({ trigger }) => useScrollIntoView(trigger),
      {
        initialProps: { trigger: 0 },
      },
    );

    const div = document.createElement("div");
    result.current.current = div;

    rerender({ trigger: 1 });

    expect(mockScrollIntoView).toHaveBeenCalledExactlyOnceWith({
      behavior: "smooth",
      block: "nearest",
    });
  });

  it("does not call scrollIntoView when ref is null", async () => {
    const { rerender } = renderHook(
      ({ trigger }) => useScrollIntoView(trigger),
      {
        initialProps: { trigger: 0 },
      },
    );

    rerender({ trigger: 1 });

    expect(mockScrollIntoView).not.toHaveBeenCalled();
  });

  it("uses custom options when provided", async () => {
    const { result, rerender } = renderHook(
      ({ trigger, options }) => useScrollIntoView(trigger, options),
      {
        initialProps: {
          trigger: 0,
          options: {
            behavior: "auto",
            block: "start",
            inline: "center",
          } as const,
        },
      },
    );

    const div = document.createElement("div");
    result.current.current = div;

    rerender({
      trigger: 1,
      options: { behavior: "auto", block: "start", inline: "center" } as const,
    });

    expect(mockScrollIntoView).toHaveBeenCalledExactlyOnceWith({
      behavior: "auto",
      block: "start",
      inline: "center",
    });
  });

  it("calls scrollIntoView multiple times when trigger changes multiple times", async () => {
    const { result, rerender } = renderHook(
      ({ trigger }) => useScrollIntoView(trigger),
      {
        initialProps: { trigger: 0 },
      },
    );

    const div = document.createElement("div");
    result.current.current = div;

    rerender({ trigger: 1 });
    rerender({ trigger: 2 });
    rerender({ trigger: 3 });

    expect(mockScrollIntoView).toHaveBeenCalledTimes(3);
  });
});
