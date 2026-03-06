import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "../../../store/useGameStore";
import { MotionLog } from "../MotionLog";

describe("MotionLog", () => {
  beforeEach(() => {
    useGameStore.setState({ history: [] });
  });

  it("renders empty state when history is empty", () => {
    render(<MotionLog />);

    expect(screen.getByText("Start typing...")).toBeInTheDocument();
  });

  it("renders explained commands from keystroke history", () => {
    useGameStore.setState({ history: ["d", "w"] });

    render(<MotionLog />);

    // vimsplain should explain "dw" as "delete word forward"
    expect(screen.getByText("delete word forward")).toBeInTheDocument();
  });

  it("renders multiple commands", () => {
    useGameStore.setState({ history: ["w", "d", "d"] });

    render(<MotionLog />);

    // "w" → move word forward, "dd" → delete line
    expect(screen.getByText("move word forward")).toBeInTheDocument();
    expect(screen.getByText("delete line")).toBeInTheDocument();
  });

  it("renders the matched key sequences", () => {
    useGameStore.setState({ history: ["d", "w"] });

    render(<MotionLog />);

    // The VimKbd component should display the matched sequence "dw"
    expect(screen.getByText("dw")).toBeInTheDocument();
  });

  it("hides empty state once history has entries", () => {
    useGameStore.setState({ history: ["j"] });

    render(<MotionLog />);

    expect(screen.queryByText("Start typing...")).not.toBeInTheDocument();
    expect(screen.getByText("move line down")).toBeInTheDocument();
  });
});
