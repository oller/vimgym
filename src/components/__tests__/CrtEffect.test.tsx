import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "../../store/useGameStore";
import { CrtEffect } from "../CrtEffect";

describe("CrtEffect", () => {
  beforeEach(() => {
    useGameStore.setState({ isPoweredOff: false });
  });

  it("renders children in normal powered on state", () => {
    render(
      <CrtEffect>
        <div data-testid="app-content">VimGym Active</div>
      </CrtEffect>,
    );

    expect(screen.getByTestId("app-content")).toBeInTheDocument();
    expect(screen.queryByText("SIGNAL LOST")).not.toBeInTheDocument();
  });

  it("shows SIGNAL LOST and Reconnect button when powered off", async () => {
    const user = userEvent.setup();

    render(
      <CrtEffect>
        <div data-testid="app-content">VimGym Active</div>
      </CrtEffect>,
    );

    useGameStore.setState({ isPoweredOff: true });

    expect(await screen.findByText("SIGNAL LOST")).toBeInTheDocument();
    const reconnectBtn = screen.getByRole("button", { name: /reconnect/i });
    expect(reconnectBtn).toBeInTheDocument();

    await user.click(reconnectBtn);
    expect(useGameStore.getState().isPoweredOff).toBe(false);
  });
});
