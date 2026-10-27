import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Database } from "../../types/database";
import { getUserId, submitCompletionAnalytics } from "../analytics";
import { queryClient } from "../react-query";
import { getSupabaseClient } from "../supabase/client";

vi.mock("../supabase/client");

describe("analytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("getUserId", () => {
    it("generates a UUID on first call and persists it in localStorage", () => {
      const firstId = getUserId();
      expect(firstId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
      expect(localStorage.getItem("vimgym-user-id")).toBe(firstId);
      expect(getUserId()).toBe(firstId);
    });
  });

  describe("submitCompletionAnalytics", () => {
    it("exits gracefully when Supabase is not configured", async () => {
      vi.mocked(getSupabaseClient).mockReturnValue(null);
      await expect(
        submitCompletionAnalytics("delete-words", 6, ["d", "w"]),
      ).resolves.toBeUndefined();
    });

    it("submits RPC payload and invalidates dashboard and distribution queries", async () => {
      const mockRpc = vi
        .fn()
        .mockResolvedValue({ data: "completion-123", error: null });
      vi.mocked(getSupabaseClient).mockReturnValue({
        rpc: mockRpc,
      } as unknown as SupabaseClient<Database>);
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      localStorage.setItem("vimgym-user-id", "user-abc");
      await submitCompletionAnalytics("delete-words", 6, [
        "f",
        "s",
        "l",
        "d",
        "t",
        ".",
      ]);

      expect(mockRpc).toHaveBeenCalledWith("submit_level_completion", {
        p_user_id: "user-abc",
        p_level_id: "delete-words",
        p_keystrokes_count: 6,
        p_keystrokes: ["f", "s", "l", "d", "t", "."],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["playerDashboard", "user-abc"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["level-distribution", "delete-words"],
      });
    });

    it("swallows RPC errors without throwing or invalidating cache", async () => {
      const mockRpc = vi
        .fn()
        .mockResolvedValue({ data: null, error: new Error("DB down") });
      vi.mocked(getSupabaseClient).mockReturnValue({
        rpc: mockRpc,
      } as unknown as SupabaseClient<Database>);
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      await expect(
        submitCompletionAnalytics("delete-words", 6, ["d", "w"]),
      ).resolves.toBeUndefined();
      expect(invalidateSpy).not.toHaveBeenCalled();
    });
  });
});
