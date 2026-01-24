import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "../../types/database";
import { supabaseConfig } from "./config";

let supabaseClient: SupabaseClient<Database, "public"> | null = null;

export const getSupabaseClient = () => {
  if (supabaseClient) {
    return supabaseClient;
  }

  if (!supabaseConfig.isEnabled) {
    return null;
  }

  supabaseClient = createClient<Database, "public">(
    supabaseConfig.url,
    supabaseConfig.anonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );

  return supabaseClient;
};
