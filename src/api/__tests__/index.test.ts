import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getSupabaseClient } from "../../lib/supabase/client";
import type { Database } from "../../types/database";
import { submitLevelCompletion } from "../index";

vi.mock("../../lib/supabase/client");

describe("API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("submitLevelCompletion", () => {
    it("returns error when Supabase is not configured", async () => {
      vi.mocked(getSupabaseClient).mockReturnValue(null);

      const result = await submitLevelCompletion({
        userId: "test-uuid",
        level: "delete-words",
        score: 10,
        keystrokes: ["h", "j", "k"],
      });

      expect(result).toEqual({
        success: false,
        error: "Supabase not configured",
      });
    });

    it("validates data with Zod schema", async () => {
      const mockClient = {
        from: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn(),
      };

      vi.mocked(getSupabaseClient).mockReturnValue(
        mockClient as unknown as SupabaseClient<Database>,
      );

      const invalidData = {
        userId: "not-a-uuid",
        level: "delete-words",
        score: 10,
        keystrokes: ["h", "j"],
      };

      const result1 = await submitLevelCompletion(invalidData);
      expect(result1.success).toBe(false);
      expect(result1.error).toContain("Invalid UUID");

      const result2 = await submitLevelCompletion({
        userId: "123e4567-e89b-42d3-a456-426614174000",
        level: "delete-words",
        score: -1,
        keystrokes: ["h", "j"],
      });
      expect(result2.success).toBe(false);
      expect(result2.error).toContain("Too small");
    });

    it("submits valid completion to Supabase", async () => {
      const mockClient = {
        from: vi.fn().mockReturnThis(),
        insert: vi.fn().mockResolvedValue({ error: null }),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: "123e4567-e89b-12d3-a456-426614174000" },
          error: null,
        }),
      };

      vi.mocked(getSupabaseClient).mockReturnValue(
        mockClient as unknown as SupabaseClient<Database>,
      );

      const result = await submitLevelCompletion({
        userId: "123e4567-e89b-42d3-a456-426614174001",
        level: "delete-words",
        score: 10,
        keystrokes: ["h", "j", "k"],
      });

      expect(result).toEqual({
        success: true,
      });
      expect(mockClient.insert).toHaveBeenCalledWith({
        user_id: "123e4567-e89b-42d3-a456-426614174001",
        level_id: "delete-words",
        keystrokes_count: 10,
        keystrokes: ["h", "j", "k"],
      });
    });

    it("handles Supabase errors", async () => {
      const mockClient = {
        from: vi.fn().mockReturnThis(),
        insert: vi
          .fn()
          .mockResolvedValue({ error: { message: "Database error" } }),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Database error" },
        }),
      };

      vi.mocked(getSupabaseClient).mockReturnValue(
        mockClient as unknown as SupabaseClient<Database>,
      );

      const result = await submitLevelCompletion({
        userId: "123e4567-e89b-42d3-a456-426614174001",
        level: "delete-words",
        score: 10,
        keystrokes: ["h", "j"],
      });

      expect(result).toEqual({
        success: false,
        error: "Database error",
      });
    });
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
  });
});
