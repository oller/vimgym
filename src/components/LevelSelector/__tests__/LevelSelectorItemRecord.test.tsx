import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as vimsplain from "vimsplain";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LevelSelectorItemRecord } from "../LevelSelectorItemRecord";

globalThis.ResizeObserver ??= class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

vi.mock("vimsplain", { spy: true });

describe("LevelSelectorItemRecord", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders nothing when globalBest is missing", () => {
    const { container } = render(
      <LevelSelectorItemRecord bestScoreLog={["x"]} globalBest={null} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the global best score", () => {
    render(<LevelSelectorItemRecord bestScoreLog={["x"]} globalBest={42} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("calls onShowStats when stats button is clicked", async () => {
    const user = userEvent.setup();
    const onShowStats = vi.fn();
    render(
      <LevelSelectorItemRecord
        bestScoreLog={["x"]}
        globalBest={42}
        onShowStats={onShowStats}
      />,
    );

    const statsButton = screen.getByRole("button", { name: /view stats/i });
    await user.click(statsButton);

    expect(onShowStats).toHaveBeenCalledTimes(1);
  });

  it("opens the popover on trophy click and shows raw keys and vimsplain explanation", async () => {
    const user = userEvent.setup();
    render(
      <LevelSelectorItemRecord bestScoreLog={["d", "w"]} globalBest={2} />,
    );

    const trophyButton = screen.getByRole("button", { name: /trophy/i });
    expect(trophyButton).toHaveAttribute("aria-expanded", "false");

    await user.click(trophyButton);

    const dialog = await screen.findByRole("dialog");
    expect(trophyButton).toHaveAttribute("aria-expanded", "true");
    expect(within(dialog).getByText("d")).toBeInTheDocument();
    expect(within(dialog).getByText("w")).toBeInTheDocument();
    expect(within(dialog).getByText("dw")).toBeInTheDocument();
    expect(within(dialog).getByText("delete word forward")).toBeInTheDocument();
  });

  it("shows tooltip with hint on hover without calling explainSequence, and hides tooltip when popover opens", async () => {
    const user = userEvent.setup();
    const explainSpy = vi.spyOn(vimsplain, "explainSequence");

    render(
      <LevelSelectorItemRecord bestScoreLog={["d", "w"]} globalBest={2} />,
    );

    const trophyButton = screen.getByRole("button", { name: /trophy/i });
    await user.hover(trophyButton);

    const tooltip = await screen.findByRole("tooltip");
    expect(within(tooltip).getByText(/click to explain/i)).toBeInTheDocument();
    expect(explainSpy).not.toHaveBeenCalled();

    await user.click(trophyButton);

    await screen.findByRole("dialog");
    expect(explainSpy).toHaveBeenCalledWith("dw");
    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });

    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(trophyButton).toHaveAttribute("aria-expanded", "false");
    });
  });

  it("does not trigger a parent onClick when the trophy is clicked", async () => {
    const user = userEvent.setup();
    const onParentClick = vi.fn();
    render(
      // biome-ignore lint/a11y/useKeyWithClickEvents: test wrapper for click propagation
      // biome-ignore lint/a11y/noStaticElementInteractions: test wrapper for click propagation
      <div onClick={onParentClick}>
        <LevelSelectorItemRecord bestScoreLog={["d", "w"]} globalBest={2} />
      </div>,
    );

    const trophyButton = screen.getByRole("button", { name: /trophy/i });
    await user.click(trophyButton);

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(onParentClick).not.toHaveBeenCalled();
  });

  it.each([
    ["empty array", [] as string[]],
    ["null", null],
    ["undefined", undefined],
  ])(
    "does not show popover or tooltip content when bestScoreLog is %s",
    async (_label, bestScoreLog) => {
      const user = userEvent.setup();
      render(
        <LevelSelectorItemRecord bestScoreLog={bestScoreLog} globalBest={5} />,
      );

      const trophyButton = screen.getByRole("button", { name: /trophy/i });
      await user.hover(trophyButton);
      await user.click(trophyButton);

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(screen.queryByText(/optimum run/i)).not.toBeInTheDocument();
      });
    },
  );

  it("shows a final row for remaining keys with no explanation when remaining is non-empty", async () => {
    const user = userEvent.setup();
    vi.mocked(vimsplain.explainSequence).mockReturnValueOnce({
      commands: [{ matched: "dw", explanation: "delete word forward" }],
      remaining: "z",
    });

    render(
      <LevelSelectorItemRecord bestScoreLog={["d", "w", "z"]} globalBest={3} />,
    );

    const trophyButton = screen.getByRole("button", { name: /trophy/i });
    await user.click(trophyButton);

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("dw")).toBeInTheDocument();
    expect(within(dialog).getByText("delete word forward")).toBeInTheDocument();

    const zElements = within(dialog).getAllByText("z");
    // One in the raw keystroke row, one in the final remaining breakdown row
    expect(zElements).toHaveLength(2);
    const remainingRow = zElements[1].parentElement;
    expect(remainingRow).toHaveTextContent(/^z$/);
  });
});
