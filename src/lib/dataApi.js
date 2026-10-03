import { supabase, isSupabaseConfigured, NotConfiguredError } from "./supabase";

/**
 * Data access layer — Supabase only.
 *
 * All records are read from and written to Supabase. Row Level Security applies
 * automatically because every call runs with the signed-in user's JWT.
 *
 * There is NO demo/mock fallback: if Supabase is not configured, data calls
 * throw NotConfiguredError and the UI shows a configuration screen. No business
 * data is ever fabricated. Less-critical collections can be exported to and
 * imported from Excel via src/lib/excel.js.
 */

/** Default ordering per table. */
const ORDER = {
  profiles: { column: "full_name", ascending: true },
  tasks: { column: "created_at", ascending: false },
  kpis: { column: "created_at", ascending: false },
  strategic_objectives: { column: "created_at", ascending: false },
  decisions: { column: "created_at", ascending: false },
  expenses: { column: "expense_date", ascending: false },
  budgets: { column: "period_start", ascending: false },
  meetings: { column: "meeting_date", ascending: true },
  reports: { column: "created_at", ascending: false },
  notifications: { column: "created_at", ascending: false },
  audit_logs: { column: "created_at", ascending: false },
  policy_register: { column: "created_at", ascending: false },
  risk_register: { column: "created_at", ascending: false },
  partnerships: { column: "created_at", ascending: false },
  campaigns: { column: "created_at", ascending: false },
};

export const TABLES = Object.keys(ORDER);

function requireClient() {
  if (!isSupabaseConfigured) throw new NotConfiguredError();
  return supabase;
}

async function select(table, { filters = {}, limit, order, asc } = {}) {
  const client = requireClient();
  let q = client.from(table).select("*");
  for (const [col, val] of Object.entries(filters)) {
    if (val === undefined) continue;
    if (Array.isArray(val)) q = q.in(col, val);
    else q = q.eq(col, val);
  }
  const conf = ORDER[table] || { column: "created_at", ascending: false };
  q = q.order(order || conf.column, { ascending: asc ?? conf.ascending });
  if (limit) q = q.limit(limit);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export const db = {
  async list(table, opts) {
    return select(table, opts);
  },

  async get(table, id) {
    const client = requireClient();
    const { data, error } = await client.from(table).select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data;
  },

  async insert(table, payload) {
    const client = requireClient();
    const { data, error } = await client.from(table).insert(payload).select().single();
    if (error) throw error;
    return data;
  },

  async insertMany(table, rows) {
    const client = requireClient();
    const { data, error } = await client.from(table).insert(rows).select();
    if (error) throw error;
    return data || [];
  },

  async update(table, id, payload) {
    const client = requireClient();
    const { data, error } = await client
      .from(table)
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(table, id) {
    const client = requireClient();
    const { error } = await client.from(table).delete().eq("id", id);
    if (error) throw error;
    return true;
  },

  /** Append an audit trail entry. Best-effort: never blocks the caller. */
  async audit(actorId, action, table, recordId, metadata = {}) {
    if (!isSupabaseConfigured || !actorId) return;
    try {
      await supabase.from("audit_logs").insert({
        actor_id: actorId,
        action,
        table_name: table,
        record_id: recordId ? String(recordId) : null,
        metadata,
      });
    } catch {
      /* audit is best-effort */
    }
  },

  /** Fan out notifications to one or many users. Best-effort. */
  async notify(userIds, { title, message, type = "info" }) {
    if (!isSupabaseConfigured) return;
    const rows = (Array.isArray(userIds) ? userIds : [userIds])
      .filter(Boolean)
      .map((user_id) => ({ user_id, title, message, type }));
    if (!rows.length) return;
    try {
      await supabase.from("notifications").insert(rows);
    } catch {
      /* notifications are best-effort */
    }
  },

  /** Upload a file to Storage and return its public URL. */
  async upload(bucket, path, file) {
    const client = requireClient();
    const { error: upErr } = await client.storage.from(bucket).upload(path, file, {
      upsert: true,
      cacheControl: "3600",
    });
    if (upErr) throw upErr;
    const { data } = client.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },
};

/** Load every collection the app needs in one parallel pass. */
export async function loadWorkspaceData() {
  const results = await Promise.all(TABLES.map((t) => select(t)));
  const out = {};
  TABLES.forEach((t, i) => {
    out[t] = results[i];
  });
  return out;
}
