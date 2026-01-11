import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useScrollIntoView } from "../useScrollIntoView";

const mockScrollIntoView = vi.fn();
let rafCallbacks: (() => void)[] = [];

beforeEach(() => {
  vi.clearAllMocks();
  rafCallbacks = [];
  vi.stubGlobal("requestAnimationFrame", (cb: () => void) => {
    rafCallbacks.push(cb);
    return rafCallbacks.length - 1;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => {
    rafCallbacks[id] = () => {};
  });
  window.HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
});

const flushRAF = async () => {
  rafCallbacks.forEach((cb) => {
    cb();
  });
  rafCallbacks.forEach((cb) => {
    cb();
  });
  rafCallbacks = [];
  await new Promise((resolve) => setTimeout(resolve, 0));
};

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
    await flushRAF();

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
    await flushRAF();

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
    await flushRAF();

    rerender({ trigger: 2 });
    await flushRAF();

    rerender({ trigger: 3 });
    await flushRAF();

    expect(mockScrollIntoView).toHaveBeenCalledTimes(3);
  });
});
