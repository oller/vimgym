import { getSupabaseClient } from "./supabase/client";

const USER_ID_KEY = "vimgym-user-id";

// Callback to invalidate React Query cache
let invalidateQueriesCallback: ((userId: string) => void) | null = null;

export function setInvalidateQueriesCallback(
  callback: (userId: string) => void,
) {
  invalidateQueriesCallback = callback;
}

// Get or create user ID synchronously
export function getUserId(): string {
  let userId = localStorage.getItem(USER_ID_KEY);

  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, userId);
  }

  return userId;
}

// Submit level completion analytics (fire and forget)
// Uses database function for atomic user creation + completion insert (1 request!)
export async function submitCompletionAnalytics(
  level: number,
  score: number,
  keystrokes: string[],
): Promise<void> {
  try {
    const client = getSupabaseClient();
    if (!client) {
      console.warn("⚠️ Supabase not configured");
      return;
    }

    const userId = getUserId();

    console.log("🚀 Submitting completion analytics:", {
      userId,
      level,
      score,
      keystrokes: keystrokes.length,
    });

    // Call database function - atomic operation (1 request!)
    const { data, error } = await client.rpc("submit_level_completion", {
      p_user_id: userId,
      p_level: level,
      p_keystrokes_count: score,
      p_keystrokes: keystrokes,
    });

    if (error) {
      console.error("❌ Analytics submission failed:", error);
      return;
    }

    console.log("✅ Successfully submitted to Supabase! Completion ID:", data);

    // Invalidate React Query cache so UI updates
    if (invalidateQueriesCallback) {
      invalidateQueriesCallback(userId);
    }
  } catch (error) {
    // Silently fail - don't block the user experience
    console.error("❌ Analytics submission error:", error);
  }
}
