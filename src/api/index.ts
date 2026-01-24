import { getSupabaseClient } from "../lib/supabase/client";
import {
  type AllLevelStats,
  allLevelStatsSchema,
  type LevelCompletionInput,
  levelCompletionInputSchema,
  userBestScoresSchema,
} from "../schemas";

export const submitLevelCompletion = async (
  data: LevelCompletionInput,
): Promise<{ success: boolean; error?: string }> => {
  console.log("📡 submitLevelCompletion called with:", data);

  const client = getSupabaseClient();

  if (!client) {
    console.warn("⚠️ Supabase not configured, skipping analytics");
    return { success: false, error: "Supabase not configured" };
  }

  console.log("✅ Supabase client exists");

  // Validate input
  try {
    const validatedData = levelCompletionInputSchema.parse(data);
    console.log("✅ Data validated:", validatedData);

    console.log("📤 Sending to Supabase...");
    const { error } = await client.from("level_completions").insert({
      user_id: validatedData.userId,
      level: validatedData.level,
      keystrokes_count: validatedData.score,
      keystrokes: validatedData.keystrokes,
    });

    if (error) {
      console.error("❌ Failed to submit level completion:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Successfully submitted to Supabase!");
    return { success: true };
  } catch (err) {
    console.error("❌ Validation error:", err);
    return { success: false, error: String(err) };
  }
};

export const getAllLevelStats = async (): Promise<AllLevelStats> => {
  const client = getSupabaseClient();

  if (!client) {
    return {};
  }

  const { data, error } = await client.rpc("get_level_stats");

  if (error || !data) {
    console.error("Failed to fetch level stats:", error);
    return {};
  }

  try {
    // Supabase RPC returns Json, so we must validate it matches our Map structure
    // We expect { "1": { ... } }
    const validated = allLevelStatsSchema.parse(data);
    return validated;
  } catch (err) {
    console.error("Failed to parse level stats:", err);
    return {};
  }
};

export const getUserBestScores = async (
  userId: string,
): Promise<Record<number, number>> => {
  const client = getSupabaseClient();

  if (!client) {
    return {};
  }

  const { data, error } = await client.rpc("get_user_best_scores", {
    p_user_id: userId,
  });

  if (error || !data) {
    console.error("Failed to fetch user best scores:", error);
    return {};
  }

  try {
    const validated = userBestScoresSchema.parse(data);
    // Convert string keys to number keys for internal consistency if needed,
    // or just return as is if the app handles string keys?
    const result: Record<number, number> = {};
    for (const [key, value] of Object.entries(validated)) {
      result[Number(key)] = value;
    }
    return result;
  } catch (err) {
    console.error("Failed to parse user best scores:", err);
    return {};
  }
};
