import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { loadWorkspaceData, db } from "../lib/dataApi";

/**
 * Single source of truth for authentication, the current profile/role, and the
 * workspace data snapshot.
 *
 * Supabase-only. When Supabase is not configured the app renders a
 * "configuration required" screen instead of fabricating any data.
 */
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [status, setStatus] = useState(isSupabaseConfigured ? "loading" : "unconfigured");
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [data, setData] = useState(null);
  const [dataState, setDataState] = useState("idle"); // idle | loading | ready | error
  const [error, setError] = useState(null);

  const configured = isSupabaseConfigured;

  const refresh = useCallback(async () => {
    if (!configured) return null;
    setDataState("loading");
    try {
      const snapshot = await loadWorkspaceData();
      setData(snapshot);
      setDataState("ready");
      return snapshot;
    } catch (e) {
      setDataState("error");
      setError(e);
      throw e;
    }
  }, [configured]);

  const loadProfile = useCallback(async (user) => {
    if (!user) {
      setProfile(null);
      return null;
    }
    const { data: row, error: pErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (pErr) {
      setError(pErr);
      setProfile(null);
      return null;
    }
    setProfile(row || null);
    return row || null;
  }, []);

  useEffect(() => {
    if (!configured) return undefined;
    let active = true;

    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (!active) return;
      setSession(s);
      if (s?.user) {
        await loadProfile(s.user);
        setStatus("authenticated");
        refresh();
      } else {
        setStatus("unauthenticated");
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, s) => {
      if (!active) return;
      setSession(s);
      if (s?.user) {
        await loadProfile(s.user);
        setStatus("authenticated");
        db.audit(s.user.id, "auth.login", "auth", null, { via: "password" });
        refresh();
      } else {
        setProfile(null);
        setStatus("unauthenticated");
        setData(null);
      }
    });

    return () => {
      active = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, [configured, loadProfile, refresh]);

  const signIn = useCallback(async (email, password) => {
    setError(null);
    const { data: res, error: e } = await supabase.auth.signInWithPassword({ email, password });
    if (e) {
      setError(e);
      throw e;
    }
    return res;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  /** Update the signed-in user's own profile (name, department, avatar). */
  const updateOwnProfile = useCallback(
    async (patch) => {
      if (!profile?.id) return null;
      const { data: row, error: e } = await supabase
        .from("profiles")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", profile.id)
        .select()
        .single();
      if (e) throw e;
      setProfile(row);
      setData((d) => (d ? { ...d, profiles: d.profiles.map((p) => (p.id === row.id ? row : p)) } : d));
      return row;
    },
    [profile?.id]
  );

  const value = useMemo(
    () => ({
      configured,
      status,
      session,
      user: session?.user || null,
      profile,
      role: profile?.role || null,
      data: data || {},
      dataState,
      error,
      refresh,
      signIn,
      signOut,
      updateOwnProfile,
    }),
    [configured, status, session, profile, data, dataState, error, refresh, signIn, signOut, updateOwnProfile]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within <AppProvider>");
  return ctx;
}
