import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CrtEffect } from "../../src/components/CrtEffect";
import { useGameStore } from "../../src/store/useGameStore";

describe("CRT Easter Egg", () => {
  afterEach(() => {
    cleanup();
    useGameStore.setState({ isPoweredOff: false }); // Reset store
  });

  describe("CrtEffect Component", () => {
    it("should render 'SIGNAL LOST' and 'Reconnect' button when powered off", () => {
      useGameStore.setState({ isPoweredOff: true });
      const onPowerOnComplete = vi.fn();
      const onPowerOffStart = vi.fn();

      render(
        <CrtEffect
          onPowerOffStart={onPowerOffStart}
          onPowerOnComplete={onPowerOnComplete}
        >
          <div>App Content</div>
        </CrtEffect>,
      );

      expect(screen.getByText("SIGNAL LOST")).toBeInTheDocument();
      expect(screen.getByText("Reconnect")).toBeInTheDocument();
    });

    it("should set isPoweredOff to false when Reconnect button is clicked", () => {
      useGameStore.setState({ isPoweredOff: true });
      const onPowerOnComplete = vi.fn();
      const onPowerOffStart = vi.fn();

      render(
        <CrtEffect
          onPowerOffStart={onPowerOffStart}
          onPowerOnComplete={onPowerOnComplete}
        >
          <div>App Content</div>
        </CrtEffect>,
      );

      const button = screen.getByText("Reconnect");

      act(() => {
        button.click();
      });

      expect(useGameStore.getState().isPoweredOff).toBe(false);
    });

    it("should render children when not powered off", () => {
      useGameStore.setState({ isPoweredOff: false });
      const onPowerOnComplete = vi.fn();
      const onPowerOffStart = vi.fn();

      render(
        <CrtEffect
          onPowerOffStart={onPowerOffStart}
          onPowerOnComplete={onPowerOnComplete}
        >
          <div data-testid="child-content">App Content</div>
        </CrtEffect>,
      );

      expect(screen.getByTestId("child-content")).toBeInTheDocument();
    });

    it("should call onPowerOffStart when isPoweredOff changes to true", async () => {
      useGameStore.setState({ isPoweredOff: false });
      const onPowerOnComplete = vi.fn();
      const onPowerOffStart = vi.fn();

      render(
        <CrtEffect
          onPowerOffStart={onPowerOffStart}
          onPowerOnComplete={onPowerOnComplete}
        >
          <div>App Content</div>
        </CrtEffect>,
      );

      act(() => {
        useGameStore.getState().setPoweredOff(true);
      });

      await waitFor(() => {
        expect(onPowerOffStart).toHaveBeenCalledTimes(1);
      });
      expect(onPowerOnComplete).not.toHaveBeenCalled();
    });

    it("should call onPowerOnComplete when power on animation completes", async () => {
      useGameStore.setState({ isPoweredOff: true });
      const onPowerOnComplete = vi.fn();
      const onPowerOffStart = vi.fn();

      render(
        <CrtEffect
          onPowerOffStart={onPowerOffStart}
          onPowerOnComplete={onPowerOnComplete}
        >
          <div>App Content</div>
        </CrtEffect>,
      );

      const button = screen.getByText("Reconnect");

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(onPowerOnComplete).toHaveBeenCalledTimes(1);
      });
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
