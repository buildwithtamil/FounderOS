import { useMemo, useState } from "react";
import { Bell, CheckCheck, Inbox } from "lucide-react";
import { useApp } from "../../hooks/useAuth";
import { PageTitle, Button, EmptyState, Badge } from "../../components/common";
import { relativeTime, classNames } from "../../lib/utils";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";

const TYPE_TONE = {
  approval: "rose",
  task_overdue: "rose",
  task_assigned: "brand",
  kpi: "amber",
  decision: "emerald",
  expense: "sky",
  info: "ink",
};

export default function NotificationsPage() {
  const { profile, data } = useApp();
  const [localRead, setLocalRead] = useState({});
  const [tab, setTab] = useState("all");

  const mine = useMemo(
    () => (data?.notifications || []).filter((n) => n.user_id === profile?.id),
    [data, profile]
  );

  const shown = tab === "unread" ? mine.filter((n) => !n.read_at && !localRead[n.id]) : mine;
  const unreadCount = mine.filter((n) => !n.read_at && !localRead[n.id]).length;

  const markRead = async (id) => {
    setLocalRead((s) => ({ ...s, [id]: true }));
    if (isSupabaseConfigured) {
      await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
    }
  };

  const markAll = async () => {
    const next = {};
    mine.forEach((n) => (next[n.id] = true));
    setLocalRead(next);
    if (isSupabaseConfigured) {
      await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("user_id", profile?.id)
        .is("read_at", null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-3 py-5 sm:px-5 sm:py-6">
      <PageTitle
        eyebrow="Alerts"
        title="Notifications"
        subtitle="Task assignments, overdue alerts, KPI warnings, decision and expense updates."
        actions={
          <>
            {unreadCount > 0 && (
              <Button variant="ghost" onClick={markAll}>
                <CheckCheck size={15} /> Mark all read
              </Button>
            )}
          </>
        }
      />

      <div className="mt-5 flex gap-2">
        {["all", "unread"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={classNames(
              "rounded-lg px-3 py-1.5 text-sm font-medium capitalize",
              tab === t ? "bg-ink-900 text-white" : "bg-white text-ink-600 ring-1 ring-ink-200 hover:bg-ink-50"
            )}
          >
            {t}
            {t === "unread" && unreadCount > 0 && (
              <span className="ml-1.5 rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-4 card overflow-hidden">
        {shown.length ? (
          <ul className="divide-y divide-ink-100">
            {shown.map((n) => {
              const isRead = n.read_at || localRead[n.id];
              return (
                <li
                  key={n.id}
                  className={classNames("flex items-start gap-3 p-4", !isRead && "bg-brand-50/40")}
                >
                  <span
                    className={classNames(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset",
                      isRead ? "bg-ink-50 text-ink-400 ring-ink-200" : "bg-brand-100 text-brand-700 ring-brand-200"
                    )}
                  >
                    <Bell size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-ink-900">{n.title}</p>
                      {!isRead && <Badge tone={TYPE_TONE[n.type] || "ink"}>{n.type}</Badge>}
                    </div>
                    <p className="mt-0.5 text-sm text-ink-600">{n.message}</p>
                    <p className="mt-1 text-xs text-ink-400">{relativeTime(n.created_at)}</p>
                  </div>
                  {!isRead && (
                    <button
                      onClick={() => markRead(n.id)}
                      className="shrink-0 text-xs font-medium text-brand-700 hover:underline"
                    >
                      Mark read
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            icon={Inbox}
            title={tab === "unread" ? "No unread notifications" : "No notifications yet"}
            message="You're all caught up."
          />
        )}
      </div>
    </div>
  );
}
