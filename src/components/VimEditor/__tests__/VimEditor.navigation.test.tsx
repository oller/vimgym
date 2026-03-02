import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LEVELS } from "../../../data/levels";
import { useGameStore } from "../../../store/useGameStore";
import { VimEditor } from "../VimEditor";

const mockSetLevelId = vi.fn();

// Mock nuqs router query hooks since LevelSelector uses them inside VimEditor
vi.mock("nuqs", () => ({
  useQueryState: vi
    .fn()
    .mockImplementation(() => [LEVELS[0].id, mockSetLevelId]),
  parseAsString: {
    withDefault: vi.fn().mockReturnThis(),
    withOptions: vi.fn().mockReturnThis(),
  },
}));

describe("VimEditor - Enter Key Navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store to a clean state
    useGameStore.setState({
      currentLevel: LEVELS[0].id,
      isCompleted: false,
    });
  });

  it("navigates to next level when Enter is pressed and level is completed", async () => {
    const user = userEvent.setup();

    // Set level as completed
    useGameStore.setState({
      currentLevel: LEVELS[0].id,
      isCompleted: true,
    });

    render(<VimEditor />);

    // Simulate pressing Enter on the window
    await user.keyboard("{Enter}");

    // Verify setLevelId was called with next level ID
    expect(mockSetLevelId).toHaveBeenCalledWith(LEVELS[1].id);
  });

  it("does not navigate when Enter is pressed and level is NOT completed", async () => {
    const user = userEvent.setup();

    // Set level as NOT completed
    useGameStore.setState({
      currentLevel: LEVELS[0].id,
      isCompleted: false,
    });

    render(<VimEditor />);

    // Simulate pressing Enter on the window
    await user.keyboard("{Enter}");

    // Verify setLevelId was NOT called
    expect(mockSetLevelId).not.toHaveBeenCalled();
  });
});
