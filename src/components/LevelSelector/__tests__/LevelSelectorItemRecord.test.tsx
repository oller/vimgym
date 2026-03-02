import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LevelSelectorItemRecord } from "../LevelSelectorItemRecord";

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
});
