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

  it("shows raw keys and vimsplain explanation in tooltip on trophy hover", async () => {
    const user = userEvent.setup();
    render(
      <LevelSelectorItemRecord bestScoreLog={["d", "w"]} globalBest={2} />,
    );

    const trophyButton = screen.getByRole("button", { name: /trophy/i });
    await user.hover(trophyButton);

    const tooltip = await screen.findByRole("tooltip");
    expect(within(tooltip).getByText("d")).toBeInTheDocument();
    expect(within(tooltip).getByText("w")).toBeInTheDocument();
    expect(within(tooltip).getByText("dw")).toBeInTheDocument();
    expect(
      within(tooltip).getByText("delete word forward"),
    ).toBeInTheDocument();
  });

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
    await user.hover(trophyButton);

    const tooltip = await screen.findByRole("tooltip");
    expect(within(tooltip).getByText("dw")).toBeInTheDocument();
    expect(
      within(tooltip).getByText("delete word forward"),
    ).toBeInTheDocument();

    const zElements = within(tooltip).getAllByText("z");
    expect(zElements).toHaveLength(2);
    const remainingRow = zElements[1].parentElement;
    expect(remainingRow).toHaveTextContent(/^z$/);
  });

  it.each([
    ["empty array", [] as string[]],
    ["null", null],
    ["undefined", undefined],
  ])(
    "does not show tooltip content when bestScoreLog is %s",
    async (_label, bestScoreLog) => {
      const user = userEvent.setup();
      render(
        <LevelSelectorItemRecord bestScoreLog={bestScoreLog} globalBest={5} />,
      );

      const trophyButton = screen.getByRole("button", { name: /trophy/i });
      await user.hover(trophyButton);

      await waitFor(() => {
        expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
        expect(screen.queryByText(/optimum run/i)).not.toBeInTheDocument();
      });
    },
  );
});
