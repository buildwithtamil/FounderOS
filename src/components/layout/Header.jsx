import { Link, useNavigate } from "react-router-dom";
import { Bell, Menu, Search, WifiOff } from "lucide-react";
import { useApp } from "../../hooks/useAuth";
import { Avatar } from "../common/Avatar";

export function Header({ onOpenSidebar }) {
  const { profile, data, configured } = useApp();
  const navigate = useNavigate();
  const unread = (data?.notifications || []).filter(
    (n) => n.user_id === profile?.id && !n.read_at
  ).length;

  return (
    <header className="sticky top-0 z-30 border-b border-ink-200 bg-white/90 backdrop-blur">
      <div className="flex h-14 items-center gap-2 px-3 sm:px-5">
        <button
          onClick={onOpenSidebar}
          className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        <div className="hidden flex-1 items-center gap-2 sm:flex">
          <div className="relative w-full max-w-sm">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
            />
            <input
              onFocus={() => navigate("/tasks")}
              placeholder="Search tasks, KPIs, decisions…"
              className="input pl-9"
              aria-label="Search"
            />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
          {!configured && (
            <span className="hidden items-center gap-1 text-xs font-medium text-amber-700 sm:inline-flex">
              <WifiOff size={13} /> Configuration required
            </span>
          )}

          <Link
            to="/notifications"
            className="relative rounded-lg p-2 text-ink-500 hover:bg-ink-100"
            aria-label="Notifications"
          >
            <Bell size={19} />
            {unread > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>

          <Link to="/profile" className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-ink-100">
            <Avatar name={profile?.full_name} role={profile?.role} src={profile?.avatar_url} size="sm" />
            <span className="hidden text-sm font-medium text-ink-800 sm:block">
              {profile?.full_name?.split(" ")[0] || "Account"}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
