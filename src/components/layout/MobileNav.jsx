import { NavLink } from "react-router-dom";
import { LayoutDashboard, ListChecks, Target, Bell, CalendarDays } from "lucide-react";
import { classNames } from "../../lib/utils";
import { useApp } from "../../hooks/useAuth";

const ITEMS = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/my-work", label: "My Work", icon: ListChecks },
  { to: "/kpis", label: "KPIs", icon: Target },
  { to: "/meetings", label: "Meetings", icon: CalendarDays },
  { to: "/notifications", label: "Alerts", icon: Bell, badge: "unread" },
];

export function MobileNav() {
  const { profile, data } = useApp();
  const unread = (data?.notifications || []).filter(
    (n) => n.user_id === profile?.id && !n.read_at
  ).length;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-200 bg-white/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5">
        {ITEMS.map(({ to, label, icon: Icon, badge }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                classNames(
                  "relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium",
                  isActive ? "text-brand-700" : "text-ink-500"
                )
              }
            >
              <Icon size={19} />
              <span>{label}</span>
              {badge === "unread" && unread > 0 && (
                <span className="absolute right-[22%] top-1.5 h-2 w-2 rounded-full bg-rose-500" />
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
