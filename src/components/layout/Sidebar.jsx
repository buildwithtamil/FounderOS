import { NavLink, useNavigate } from "react-router-dom";
import { Moon, X } from "lucide-react";
import { COMMON_NAV, ROLE_NAV } from "../../lib/navigation";
import { useApp } from "../../hooks/useAuth";
import { usePermissions } from "../../hooks/usePermissions";
import { getRole, COLOR_CLASSES } from "../../lib/roles";
import { Avatar } from "../common/Avatar";
import { classNames } from "../../lib/utils";

function NavSection({ label, items, unread, onNavigate }) {
  return (
    <div className="px-3">
      <p className="px-2 pb-1.5 pt-4 text-[10px] font-semibold uppercase tracking-wider text-ink-400">
        {label}
      </p>
      <nav className="space-y-0.5">
        {items.map(({ to, label: name, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              classNames(
                "group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-ink-900 text-white"
                  : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
              )
            }
          >
            <Icon size={17} className="shrink-0" />
            <span className="flex-1 truncate">{name}</span>
            {badge === "unread" && unread > 0 && (
              <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export function Sidebar({ mobileOpen, onClose }) {
  const { profile, signOut, data } = useApp();
  const { roleMeta } = usePermissions();
  const navigate = useNavigate();
  const roleItems = ROLE_NAV[profile?.role] || [];
  const unread = (data?.notifications || []).filter(
    (n) => n.user_id === profile?.id && !n.read_at
  ).length;
  const role = getRole(profile?.role);

  const content = (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between gap-2 border-b border-ink-100 px-4 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-950 text-white">
            <Moon size={18} className="text-brand-400" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight text-ink-900">FounderOS</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-ink-400">
              Operating System
            </p>
          </div>
        </div>
        {mobileOpen && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 lg:hidden"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pb-4">
        {roleItems.length > 0 && <NavSection label="My Function" items={roleItems} unread={unread} onNavigate={onClose} />}
        <NavSection label="Workspace" items={COMMON_NAV} unread={unread} onNavigate={onClose} />
      </div>

      <div className="border-t border-ink-100 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar name={profile?.full_name} role={profile?.role} src={profile?.avatar_url} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink-900">
              {profile?.full_name || "Unassigned"}
            </p>
            <span
              className={classNames(
                "badge mt-0.5",
                COLOR_CLASSES[roleMeta?.color] || COLOR_CLASSES.ink
              )}
            >
              {role.label}
            </span>
          </div>
        </div>
        <button
          onClick={async () => {
            await signOut();
            navigate("/login");
          }}
          className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-ink-500 hover:bg-ink-100 hover:text-ink-800"
        >
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop rail */}
      <aside className="hidden w-64 shrink-0 border-r border-ink-200 lg:block">
        <div className="sticky top-0 h-screen">{content}</div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/40" onClick={onClose} aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-pop">{content}</div>
        </div>
      )}
    </>
  );
}
