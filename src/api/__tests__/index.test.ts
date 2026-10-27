import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getSupabaseClient } from "../../lib/supabase/client";
import type { Database } from "../../types/database";

vi.mock("../../lib/supabase/client");

describe("API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPlayerDashboard", () => {
    it("returns empty object when Supabase is not configured", async () => {
      vi.mocked(getSupabaseClient).mockReturnValue(null);
      const { getPlayerDashboard } = await import("../index");
      const result = await getPlayerDashboard("user-1");
      expect(result).toEqual({});
    });

    it("returns empty object on error", async () => {
      const mockClient = {
        rpc: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Error fetching dashboard" },
        }),
      };
      vi.mocked(getSupabaseClient).mockReturnValue(
        mockClient as unknown as SupabaseClient<Database>,
      );
      const { getPlayerDashboard } = await import("../index");

      const result = await getPlayerDashboard("user-1");
      expect(result).toEqual({});
    });

    it("returns transformed dashboard stats", async () => {
      const mockData = {
        "delete-words": {
          user: { best: 10, percentile: 50.5 },
          global: {
            best: 8,
            average: 12.5,
            completions: 100,
            best_score_log: ["h", "j"],
          },
        },
        "flip-ternary": {
          user: { best: null, percentile: null },
          global: {
            best: 10,
            average: 15.0,
            completions: 50,
            best_score_log: ["k", "l"],
          },
        },
      };

      const mockClient = {
        rpc: vi.fn().mockResolvedValue({
          data: mockData,
          error: null,
        }),
      };
      vi.mocked(getSupabaseClient).mockReturnValue(
        mockClient as unknown as SupabaseClient<Database>,
      );
      const { getPlayerDashboard } = await import("../index");

      const result = await getPlayerDashboard("user-1");

      expect(result).toEqual({
        "delete-words": mockData["delete-words"],
        "flip-ternary": mockData["flip-ternary"],
      });
      expect(mockClient.rpc).toHaveBeenCalledWith("get_player_dashboard", {
        p_user_id: "user-1",
        p_level_ids: expect.any(Array),
      });
    });

    it("returns empty object when response fails Zod schema validation", async () => {
      const mockClient = {
        rpc: vi.fn().mockResolvedValue({
          data: { "delete-words": { invalid: true } },
          error: null,
        }),
      };
      vi.mocked(getSupabaseClient).mockReturnValue(
        mockClient as unknown as SupabaseClient<Database>,
      );
      const { getPlayerDashboard } = await import("../index");

      expect(await getPlayerDashboard("user-1")).toEqual({});
    });
  });

  describe("getLevelScoreDistribution", () => {
    it("returns empty array when Supabase is not configured", async () => {
      vi.mocked(getSupabaseClient).mockReturnValue(null);
      const { getLevelScoreDistribution } = await import("../index");
      expect(await getLevelScoreDistribution("delete-words")).toEqual([]);
    });

    it("returns score distribution data", async () => {
      const mockDist = [
        { score: 6, count: 42 },
        { score: 8, count: 15 },
      ];
      const mockClient = {
        rpc: vi.fn().mockResolvedValue({ data: mockDist, error: null }),
      };
      vi.mocked(getSupabaseClient).mockReturnValue(
        mockClient as unknown as SupabaseClient<Database>,
      );
      const { getLevelScoreDistribution } = await import("../index");

      expect(await getLevelScoreDistribution("delete-words")).toEqual(mockDist);
      expect(mockClient.rpc).toHaveBeenCalledWith(
        "get_level_score_distribution",
        { p_level_id: "delete-words" },
      );
    });

    it("throws on Supabase RPC error", async () => {
      const rpcError = new Error("RPC failed");
      const mockClient = {
        rpc: vi.fn().mockResolvedValue({ data: null, error: rpcError }),
      };
      vi.mocked(getSupabaseClient).mockReturnValue(
        mockClient as unknown as SupabaseClient<Database>,
      );
      const { getLevelScoreDistribution } = await import("../index");

      await expect(
        getLevelScoreDistribution("delete-words"),
      ).rejects.toThrowError("RPC failed");
    });
  });
});
