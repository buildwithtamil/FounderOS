import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * True when the app has been pointed at a real Supabase project. When false the
 * app shows a "configuration required" screen and no data call is attempted.
 * No data is ever mocked or fabricated.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    "[FounderOS] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set. " +
      "Copy .env.example to .env and fill in your project credentials."
  );
}

/**
 * The anon client is the ONLY client the frontend may use. Never place the
 * service-role key here — it must never reach the browser.
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/** Thrown by the data helpers when Supabase is not configured. */
export class NotConfiguredError extends Error {
  constructor() {
    super(
      "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env."
    );
    this.name = "NotConfiguredError";
  }
}
