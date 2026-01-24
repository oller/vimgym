import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "../../lib/supabase/client";
import type { Database } from "../../types/database";
import { getAllLevelStats, submitLevelCompletion } from "../index";

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
        level: 1,
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
        level: 1,
        score: 10,
        keystrokes: ["h", "j"],
      };

      const result1 = await submitLevelCompletion(invalidData);
      expect(result1.success).toBe(false);
      expect(result1.error).toContain("Invalid UUID");

      const result2 = await submitLevelCompletion({
        userId: "123e4567-e89b-12d3-a456-426614174000",
        level: 1,
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
        userId: "123e4567-e89b-12d3-a456-426614174001",
        level: 1,
        score: 10,
        keystrokes: ["h", "j", "k"],
      });

      expect(result).toEqual({
        success: true,
      });
      expect(mockClient.insert).toHaveBeenCalledWith({
        user_id: "123e4567-e89b-12d3-a456-426614174001",
        level: 1,
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
        userId: "123e4567-e89b-12d3-a456-426614174001",
        level: 1,
        score: 10,
        keystrokes: ["h", "j"],
      });

      expect(result).toEqual({
        success: false,
        error: "Database error",
      });
    });
  });

  describe("getAllLevelStats", () => {
    it("returns empty object when Supabase is not configured", async () => {
      vi.mocked(getSupabaseClient).mockReturnValue(null);

      const result = await getAllLevelStats();

      expect(result).toEqual({});
    });

    it("returns empty object on error", async () => {
      const mockClient = {
        rpc: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Error fetching stats" },
        }),
      };

      vi.mocked(getSupabaseClient).mockReturnValue(
        mockClient as unknown as SupabaseClient<Database>,
      );

      const result = await getAllLevelStats();

      expect(result).toEqual({});
    });

    it("returns and validates level stats", async () => {
      const mockClient = {
        rpc: vi.fn().mockResolvedValue({
          data: {
            "1": {
              level: 1,
              totalCompletions: 100,
              avgKeystrokes: 12.5,
              bestScore: 8,
            },
            "2": {
              level: 2,
              totalCompletions: 50,
              avgKeystrokes: 15.2,
              bestScore: 10,
            },
          },
          error: null,
        }),
      };

      vi.mocked(getSupabaseClient).mockReturnValue(
        mockClient as unknown as SupabaseClient<Database>,
      );

      const result = await getAllLevelStats();

      expect(result).toEqual({
        1: {
          level: 1,
          totalCompletions: 100,
          avgKeystrokes: 12.5,
          bestScore: 8,
        },
        2: {
          level: 2,
          totalCompletions: 50,
          avgKeystrokes: 15.2,
          bestScore: 10,
        },
      });
      expect(mockClient.rpc).toHaveBeenCalledWith("get_level_stats");
    });
  });

  describe("getUserBestScores", () => {
    it("returns empty object when Supabase is not configured", async () => {
      vi.mocked(getSupabaseClient).mockReturnValue(null);
      const { getUserBestScores } = await import("../index");
      const result = await getUserBestScores("user-1");
      expect(result).toEqual({});
    });

    it("returns empty object on error", async () => {
      const mockClient = {
        rpc: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Error fetching best scores" },
        }),
      };
      vi.mocked(getSupabaseClient).mockReturnValue(
        mockClient as unknown as SupabaseClient<Database>,
      );
      const { getUserBestScores } = await import("../index");

      const result = await getUserBestScores("user-1");
      expect(result).toEqual({});
    });

    it("returns transformed best scores", async () => {
      const mockClient = {
        rpc: vi.fn().mockResolvedValue({
          data: {
            "1": 10,
            "2": 15,
          },
          error: null,
        }),
      };
      vi.mocked(getSupabaseClient).mockReturnValue(
        mockClient as unknown as SupabaseClient<Database>,
      );
      const { getUserBestScores } = await import("../index");

      const result = await getUserBestScores("user-1");

      expect(result).toEqual({
        1: 10,
        2: 15,
      });
      expect(mockClient.rpc).toHaveBeenCalledWith("get_user_best_scores", {
        p_user_id: "user-1",
      });
    });
  });
});
