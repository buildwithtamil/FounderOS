import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useApp } from "../../hooks/useAuth";
import { hasPermission } from "../../lib/permissions";
import { AccessDenied } from "../common/States";
import { LoadingBlock } from "../common/Spinner";

/** Requires an authenticated session; otherwise redirects to /login. */
export function RequireAuth({ children }) {
  const { status } = useApp();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50">
        <LoadingBlock label="Signing you in…" />
      </div>
    );
  }

  if (status !== "authenticated") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children ?? <Outlet />;
}

/**
 * Requires a permission (string) or any of several (array). Missing permissions
 * render Access Denied — the URL is not simply hidden.
 */
export function RequirePermission({ permission, anyOf, children }) {
  const { profile } = useApp();
  const granted = anyOf
    ? anyOf.some((p) => hasPermission(profile?.role, p))
    : hasPermission(profile?.role, permission);

  if (!granted) return <AccessDenied />;
  return children ?? <Outlet />;
}
