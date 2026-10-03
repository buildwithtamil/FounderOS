import { useMemo } from "react";
import { useApp } from "./useAuth";
import { hasPermission, hasAnyPermission } from "../lib/permissions";
import { getRole } from "../lib/roles";

/** Profile-level helpers for the signed-in user. */
export function useProfile() {
  const { profile, user, configured } = useApp();
  return { profile, user, configured, role: profile?.role || null };
}

/** Permission helpers bound to the current user. */
export function usePermissions() {
  const { profile } = useApp();
  const role = profile?.role;
  return useMemo(
    () => ({
      role,
      roleMeta: getRole(role),
      can: (permission) => hasPermission(role, permission),
      canAny: (permissions) => hasAnyPermission(role, permissions),
    }),
    [role]
  );
}
