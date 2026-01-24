import { getSupabaseClient } from "../lib/supabase/client";
import type { LevelCompletionInput, PlayerDashboard } from "../schemas";
import { levelCompletionInputSchema, playerDashboardSchema } from "../schemas";

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

export const getPlayerDashboard = async (
  userId: string,
): Promise<Record<number, PlayerDashboard[string]>> => {
  const client = getSupabaseClient();

  if (!client) {
    return {};
  }

  const { data, error } = await client.rpc("get_player_dashboard", {
    p_user_id: userId,
  });

  if (error || !data) {
    console.error("Failed to fetch player dashboard:", error);
    return {};
  }

  try {
    const validated = playerDashboardSchema.parse(data);
    const result: Record<number, PlayerDashboard[string]> = {};
    for (const [key, value] of Object.entries(validated)) {
      result[Number(key)] = value;
    }
    return result;
  } catch (err) {
    console.error("Failed to parse player dashboard:", err);
    return {};
  }
};
