import { getRole } from "./roles";

/**
 * Permission matrix.
 *
 * Maps a permission key to the list of roles that hold it. Wildcards: `*` grants
 * everything (reserved for an explicit super-admin), and `ceo_cfo` is granted the
 * full executive set by default.
 *
 * These checks gate UI and routing. The authoritative enforcement lives in
 * Supabase RLS policies in supabase/schema.sql.
 */
export const PERMISSIONS = {
  "company.view": ["ceo_cfo", "cso_cgo", "cmo_cso", "cpo_cto", "clo_coo", "cno"],

  "executive.view": ["ceo_cfo"],

  "finance.view": ["ceo_cfo"],
  "finance.manage": ["ceo_cfo"],
  "finance.submit_expense": ["ceo_cfo", "cso_cgo", "cmo_cso", "cpo_cto", "clo_coo", "cno"],

  "founders.view": ["ceo_cfo"],
  "founders.manage": ["ceo_cfo"],

  "governance.view": ["ceo_cfo"],
  "governance.manage": ["ceo_cfo"],
  "approvals.manage": ["ceo_cfo"],
  "risk.manage": ["ceo_cfo"],

  "strategy.view": ["ceo_cfo", "cso_cgo", "cmo_cso"],
  "strategy.manage": ["ceo_cfo", "cso_cgo"],

  "growth.view": ["ceo_cfo", "cso_cgo"],
  "growth.manage": ["ceo_cfo", "cso_cgo"],

  "partnerships.view": ["ceo_cfo", "cso_cgo", "cno"],
  "partnerships.manage": ["ceo_cfo", "cso_cgo", "cno"],

  "marketing.view": ["ceo_cfo", "cmo_cso"],
  "marketing.manage": ["ceo_cfo", "cmo_cso"],

  "product.view": ["ceo_cfo", "cpo_cto"],
  "product.manage": ["ceo_cfo", "cpo_cto"],
  "technology.view": ["ceo_cfo", "cpo_cto"],
  "technology.manage": ["ceo_cfo", "cpo_cto"],

  "operations.view": ["ceo_cfo", "clo_coo"],
  "operations.manage": ["ceo_cfo", "clo_coo"],
  "legal.view": ["ceo_cfo", "clo_coo"],
  "legal.manage": ["ceo_cfo", "clo_coo"],

  "network.view": ["ceo_cfo", "cno"],
  "network.manage": ["ceo_cfo", "cno"],

  "tasks.view": ["ceo_cfo", "cso_cgo", "cmo_cso", "cpo_cto", "clo_coo", "cno"],
  "tasks.create": ["ceo_cfo", "cso_cgo", "cmo_cso", "cpo_cto", "clo_coo", "cno"],
  "tasks.assign": ["ceo_cfo", "cso_cgo", "cmo_cso", "cpo_cto", "clo_coo", "cno"],

  "kpis.view": ["ceo_cfo", "cso_cgo", "cmo_cso", "cpo_cto", "clo_coo", "cno"],
  "kpis.manage": ["ceo_cfo", "cso_cgo", "cmo_cso", "cpo_cto", "clo_coo", "cno"],

  "reports.view_all": ["ceo_cfo"],
  "reports.create": ["ceo_cfo", "cso_cgo", "cmo_cso", "cpo_cto", "clo_coo", "cno"],
  "reports.approve": ["ceo_cfo"],

  "meetings.view": ["ceo_cfo", "cso_cgo", "cmo_cso", "cpo_cto", "clo_coo", "cno"],
  "meetings.manage": ["ceo_cfo", "cso_cgo", "cmo_cso", "cpo_cto", "clo_coo", "cno"],

  "audit.view": ["ceo_cfo"],

  "decisions.view": ["ceo_cfo", "cso_cgo", "cmo_cso", "cpo_cto", "clo_coo", "cno"],
  "decisions.manage": ["ceo_cfo"],
};

/** Returns true when the given role key holds the permission. */
export function roleHasPermission(roleKey, permission) {
  const allowed = PERMISSIONS[permission];
  if (!allowed) return false;
  if (allowed.includes("*")) return true;
  return allowed.includes(roleKey);
}

/**
 * hasPermission(user, "finance.view")
 * `user` may be a profile object, a role key string, or { role }.
 */
export function hasPermission(userOrRole, permission) {
  const roleKey =
    typeof userOrRole === "string" ? userOrRole : userOrRole?.role;
  return roleHasPermission(roleKey, permission);
}

/** True when any of the supplied permissions is held. */
export function hasAnyPermission(userOrRole, permissions = []) {
  return permissions.some((p) => hasPermission(userOrRole, p));
}

/** Convenience: role-aware label for the current user. */
export function describeRole(roleKey) {
  return getRole(roleKey);
}
