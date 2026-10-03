import { Avatar } from "../common/Avatar";
import { relativeTime } from "../../lib/utils";

export function ActivityFeed({ items = [], profiles = [] }) {
  const byId = Object.fromEntries(profiles.map((p) => [p.id, p]));
  if (!items.length) {
    return <div className="px-5 py-8 text-center text-sm text-ink-500">No data available yet</div>;
  }
  return (
    <ul className="divide-y divide-ink-100">
      {items.map((a, i) => {
        const actor = byId[a.actor_id] || byId[a.user_id];
        return (
          <li key={a.id || i} className="flex items-start gap-3 px-5 py-3">
            <Avatar name={actor?.full_name} role={actor?.role} size="xs" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-ink-800">
                <span className="font-semibold">{actor?.full_name || "System"}</span>{" "}
                <span className="text-ink-500">{humanize(a.action || a.type)}</span>
              </p>
              <p className="mt-0.5 text-xs text-ink-400">{relativeTime(a.created_at)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function humanize(action = "") {
  return action.replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
