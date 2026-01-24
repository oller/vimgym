import { ENV } from "varlock/env";

export const supabaseConfig = {
  url: ENV.VITE_SUPABASE_URL ?? "",
  anonKey: ENV.VITE_SUPABASE_ANON_KEY ?? "",
  isEnabled: Boolean(ENV.VITE_SUPABASE_URL && ENV.VITE_SUPABASE_ANON_KEY),
};
