import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LevelSelectorItemRecord } from "../LevelSelectorItemRecord";

globalThis.ResizeObserver ??= class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe("LevelSelectorItemRecord", () => {
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

  it("does not show tooltip content when there is no key log", async () => {
    const user = userEvent.setup();
    render(<LevelSelectorItemRecord bestScoreLog={[]} globalBest={5} />);

    await user.hover(screen.getByRole("button", { name: /trophy/i }));

    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
  });
});
