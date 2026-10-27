import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NuqsAdapter } from "nuqs/adapters/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LEVELS } from "../../../data/levels";
import { useGameStore } from "../../../store/useGameStore";
import { LevelSelector } from "../LevelSelector";

window.HTMLElement.prototype.scrollIntoView = vi.fn();

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const renderSelector = () =>
  render(
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        <LevelSelector />
      </NuqsAdapter>
    </QueryClientProvider>,
  );

describe("LevelSelector", () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.getState().setLevel(LEVELS[0].id);
  });

  it("renders all categories open by default and toggles collapsed state in localStorage", async () => {
    const user = userEvent.setup();
    renderSelector();

    const textObjectsBtn = screen.getByRole("button", {
      name: /text objects/i,
    });
    expect(textObjectsBtn).toHaveAttribute("aria-expanded", "true");

    await user.click(textObjectsBtn);
    expect(textObjectsBtn).toHaveAttribute("aria-expanded", "false");
    expect(
      JSON.parse(localStorage.getItem("vimgym:category-collapsed") ?? "[]"),
    ).toEqual(["Text Objects"]);
  });

  it("survives malformed localStorage data and auto-expands category when active level enters it", () => {
    localStorage.setItem("vimgym:category-collapsed", "{broken-json");
    const { unmount } = renderSelector();
    expect(
      screen.getByRole("button", { name: /text objects/i }),
    ).toHaveAttribute("aria-expanded", "true");
    unmount();

    // Collapse "Text Objects" in storage, then navigate into a "Text Objects" level
    localStorage.setItem(
      "vimgym:category-collapsed",
      JSON.stringify(["Text Objects", "InvalidCategory"]),
    );
    renderSelector();

    const textObjectsBtn = screen.getByRole("button", {
      name: /text objects/i,
    });
    expect(textObjectsBtn).toHaveAttribute("aria-expanded", "false");

    act(() => {
      useGameStore.getState().setLevel("quote-wrapping");
    });

    expect(textObjectsBtn).toHaveAttribute("aria-expanded", "true");
  });
});
