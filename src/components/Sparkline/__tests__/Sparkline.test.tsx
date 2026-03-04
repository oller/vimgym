import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Sparkline } from "../Sparkline";

// Improved ResizeObserver mock to trigger state updates
class ResizeObserverMock {
  callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  observe(target: Element) {
    // Simulate initial resize
    this.callback(
      [
        {
          contentRect: { width: 100, height: 50 },
          target,
        } as ResizeObserverEntry,
      ],
      this,
    );
  }
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver =
  ResizeObserverMock as unknown as typeof ResizeObserver;

describe("Sparkline", () => {
  const mockData = [
    { score: 10, count: 5 },
    { score: 15, count: 10 },
    { score: 20, count: 2 },
  ];

  it("renders null when data is empty", () => {
    const { container } = render(<Sparkline data={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders an SVG when data and dimensions are provided", () => {
    render(<Sparkline data={mockData} />);
    const svg = screen.getByLabelText("Score distribution chart");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "100");
    expect(svg).toHaveAttribute("height", "50");
  });

  it("calls onHover when mouse moves over the chart", async () => {
    const user = userEvent.setup();
    const onHover = vi.fn();
    render(<Sparkline data={mockData} onHover={onHover} />);
    const svg = screen.getByLabelText("Score distribution chart");

    // Mock getBoundingClientRect for the SVG
    vi.spyOn(svg, "getBoundingClientRect").mockReturnValue({
      left: 0,
      top: 0,
      width: 100,
      height: 50,
      bottom: 50,
      right: 100,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    // Move mouse to approximately the second point (score 15)
    // score range is 10 to 20 (range 10), width 100
    // x = ((15 - 10) / 10) * 100 = 50
    await user.pointer({ target: svg, coords: { clientX: 50, clientY: 25 } });

    expect(onHover).toHaveBeenCalledWith(mockData[1]);
  });

  it("calls onHover with null when mouse leaves the chart", async () => {
    const user = userEvent.setup();
    const onHover = vi.fn();
    render(<Sparkline data={mockData} onHover={onHover} />);
    const svg = screen.getByLabelText("Score distribution chart");

    await user.hover(svg);
    await user.unhover(svg);
    expect(onHover).toHaveBeenCalledWith(null);
  });
});
