import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { CrtEffect } from "../../src/components/CrtEffect";
import { useGameStore } from "../../src/store/useGameStore";

describe("CRT Easter Egg", () => {
  afterEach(() => {
    useGameStore.setState({ isPoweredOff: false }); // Reset store
  });

  describe("CrtEffect Component", () => {
    it("should render 'SIGNAL LOST' and 'Reconnect' button when powered off", () => {
      useGameStore.setState({ isPoweredOff: true });

      render(
        <CrtEffect>
          <div>App Content</div>
        </CrtEffect>,
      );

      expect(screen.getByText("SIGNAL LOST")).toBeInTheDocument();
      expect(screen.getByText("Reconnect")).toBeInTheDocument();
    });

    it("should set isPoweredOff to false when Reconnect button is clicked", async () => {
      const user = userEvent.setup();
      useGameStore.setState({ isPoweredOff: true });

      render(
        <CrtEffect>
          <div>App Content</div>
        </CrtEffect>,
      );

      const button = screen.getByText("Reconnect");
      await user.click(button);

      expect(useGameStore.getState().isPoweredOff).toBe(false);
    });

    it("should render children when not powered off", () => {
      useGameStore.setState({ isPoweredOff: false });

      render(
        <CrtEffect>
          <div data-testid="child-content">App Content</div>
        </CrtEffect>,
      );

      expect(screen.getByTestId("child-content")).toBeInTheDocument();
    });
  });

  describe("Store Actions", () => {
    it("should toggle isPoweredOff state via setPoweredOff", () => {
      expect(useGameStore.getState().isPoweredOff).toBe(false);

      useGameStore.getState().setPoweredOff(true);
      expect(useGameStore.getState().isPoweredOff).toBe(true);

      useGameStore.getState().setPoweredOff(false);
      expect(useGameStore.getState().isPoweredOff).toBe(false);
    });
  });
});
