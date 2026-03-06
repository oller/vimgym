import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LEVELS } from "../../../data/levels";
import { useGameStore } from "../../../store/useGameStore";
import { CompletionModal } from "../CompletionModal";

// Mock usePlayerDashboard to control dashboard data per test
vi.mock("../../../hooks/api", () => ({
  usePlayerDashboard: vi.fn(() => ({ data: {}, isLoading: false })),
}));

import { usePlayerDashboard } from "../../../hooks/api";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const renderModal = (props: { hasNextLevel: boolean; onNext?: () => void }) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <CompletionModal
        hasNextLevel={props.hasNextLevel}
        onNext={props.onNext ?? vi.fn()}
      />
    </QueryClientProvider>,
  );
};

describe("CompletionModal", () => {
  beforeEach(() => {
    useGameStore.setState({
      currentLevel: LEVELS[0].id,
      history: ["f", "s", "l", "d", "t", "."],
      isCompleted: true,
    });
    vi.mocked(usePlayerDashboard).mockReturnValue({
      data: {},
      isLoading: false,
    } as unknown as ReturnType<typeof usePlayerDashboard>);
  });

  it("displays the keystroke count", () => {
    renderModal({ hasNextLevel: true });

    const output = screen.getByLabelText("keystrokes");
    expect(output.textContent).toContain("6");
  });

  it("shows 'Next Level' button when hasNextLevel is true", () => {
    renderModal({ hasNextLevel: true });

    expect(screen.getByText("Next Level")).toBeInTheDocument();
  });

  it("shows 'All levels completed!' when hasNextLevel is false", () => {
    renderModal({ hasNextLevel: false });

    expect(screen.getByText(/All levels completed/)).toBeInTheDocument();
    expect(screen.queryByText("Next Level")).not.toBeInTheDocument();
  });

  it("calls onNext when 'Next Level' is clicked", async () => {
    const onNext = vi.fn();
    const user = userEvent.setup();
    renderModal({ hasNextLevel: true, onNext });

    await user.click(screen.getByText("Next Level"));
    expect(onNext).toHaveBeenCalledOnce();
  });

  it("shows NEW BEST when score beats previous best", () => {
    // Current history length is 6, previous best was 10 → new best
    vi.mocked(usePlayerDashboard).mockReturnValue({
      data: {
        [LEVELS[0].id]: {
          user: { best: 10, percentile: null },
          global: {
            best: null,
            average: null,
            completions: null,
            best_score_log: null,
          },
        },
      },
      isLoading: false,
    } as unknown as ReturnType<typeof usePlayerDashboard>);

    renderModal({ hasNextLevel: true });

    expect(screen.getByText("NEW BEST!")).toBeInTheDocument();
  });

  it("does not show NEW BEST on first completion (no previous best)", () => {
    // No dashboard data → no previous best
    vi.mocked(usePlayerDashboard).mockReturnValue({
      data: {},
      isLoading: false,
    } as unknown as ReturnType<typeof usePlayerDashboard>);

    renderModal({ hasNextLevel: true });

    expect(screen.queryByText("NEW BEST!")).not.toBeInTheDocument();
  });

  it("does not show NEW BEST when score equals previous best", () => {
    vi.mocked(usePlayerDashboard).mockReturnValue({
      data: {
        [LEVELS[0].id]: {
          user: { best: 6, percentile: null },
          global: {
            best: null,
            average: null,
            completions: null,
            best_score_log: null,
          },
        },
      },
      isLoading: false,
    } as unknown as ReturnType<typeof usePlayerDashboard>);

    renderModal({ hasNextLevel: true });

    expect(screen.queryByText("NEW BEST!")).not.toBeInTheDocument();
  });

  it("does not show NEW BEST when score is worse than previous best", () => {
    // Current is 6, previous best was 4 → 6 > 4, not a new best
    vi.mocked(usePlayerDashboard).mockReturnValue({
      data: {
        [LEVELS[0].id]: {
          user: { best: 4, percentile: null },
          global: {
            best: null,
            average: null,
            completions: null,
            best_score_log: null,
          },
        },
      },
      isLoading: false,
    } as unknown as ReturnType<typeof usePlayerDashboard>);

    renderModal({ hasNextLevel: true });

    expect(screen.queryByText("NEW BEST!")).not.toBeInTheDocument();
  });
});
