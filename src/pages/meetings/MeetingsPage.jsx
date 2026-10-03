import { CalendarDays, Users, FileText } from "lucide-react";
import { useWorkspace } from "../../hooks/useWorkspace";
import { usePermissions } from "../../hooks/usePermissions";
import { RecordWorkspace } from "../../components/common/RecordWorkspace";
import { StatTile, SectionCard, EmptyState } from "../../components/common";
import { MEETING_TYPES, formatDateTime, daysUntil, classNames } from "../../lib/utils";

export default function MeetingsPage() {
  const ws = useWorkspace();
  const { can } = usePermissions();

  const columns = [
    { key: "title", header: "Meeting", sortable: true, render: (m) => <span className="font-medium text-ink-900">{m.title}</span> },
    { key: "meeting_type", header: "Type", render: (m) => <span className="text-ink-600">{m.meeting_type}</span> },
    { key: "meeting_date", header: "When", sortable: true, render: (m) => <span className="tabular-nums">{formatDateTime(m.meeting_date)}</span> },
    { key: "created_by", header: "Organiser", render: (m) => ws.nameOf(m.created_by) },
    { key: "agenda", header: "Agenda", render: (m) => <span className="line-clamp-2 text-ink-600">{m.agenda || "—"}</span> },
  ];

  const fields = [
    { name: "title", label: "Meeting title", required: true, placeholder: "e.g. Weekly Founder Sync" },
    { name: "meeting_type", label: "Meeting type", type: "select", options: MEETING_TYPES.map((v) => ({ value: v, label: v })) },
    { name: "meeting_date", label: "Date & time", type: "datetime-local", required: true },
    { name: "created_by", label: "Organiser", type: "select", options: ws.profiles.map((p) => ({ value: p.id, label: p.full_name })) },
    { name: "agenda", label: "Agenda", type: "textarea" },
    { name: "notes", label: "Notes", type: "textarea" },
    { name: "action_items", label: "Action items", type: "textarea", hint: "One per line: item — owner — deadline" },
  ];

  const upcoming = ws.meetings
    .filter((m) => daysUntil(m.meeting_date) >= 0)
    .sort((a, b) => new Date(a.meeting_date) - new Date(b.meeting_date));

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-5 sm:py-6">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatTile label="Meetings" value={ws.meetings.length} icon={CalendarDays} tone="brand" />
          <StatTile label="Upcoming" value={upcoming.length} icon={CalendarDays} tone="emerald" />
          <StatTile label="Types" value={new Set(ws.meetings.map((m) => m.meeting_type)).size} icon={Users} tone="sky" />
        </div>

        {upcoming.length > 0 && (
          <SectionCard title="Upcoming schedule">
            <ul className="space-y-3">
              {upcoming.slice(0, 5).map((m) => {
                const d = daysUntil(m.meeting_date);
                return (
                  <li key={m.id} className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-ink-100 text-ink-700">
                      <span className="text-base font-bold leading-none">{new Date(m.meeting_date).getDate()}</span>
                      <span className="text-[10px] uppercase">
                        {new Date(m.meeting_date).toLocaleString(undefined, { month: "short" })}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-900">{m.title}</p>
                      <p className="text-xs text-ink-500">
                        {m.meeting_type} · {formatDateTime(m.meeting_date)}
                      </p>
                    </div>
                    <span
                      className={classNames(
                        "badge shrink-0",
                        d === 0 ? "bg-rose-50 text-rose-700 ring-rose-200" : "bg-ink-100 text-ink-600 ring-ink-200"
                      )}
                    >
                      {d === 0 ? "Today" : `in ${d}d`}
                    </span>
                  </li>
                );
              })}
            </ul>
          </SectionCard>
        )}

        <RecordWorkspace
          eyebrow="Cadence"
          title="Meetings"
          subtitle="Founder, strategy, product, marketing, operations, finance and governance meetings."
          table="meetings"
          rows={ws.meetings}
          columns={columns}
          fields={fields}
          searchKeys={["title", "meeting_type", "agenda"]}
          canCreate={can("meetings.manage")}
          addLabel="Schedule meeting"
          emptyTitle="No meetings scheduled"
          emptyMessage="Schedule a meeting to build your operating cadence."
        />

        {ws.meetings.some((m) => m.notes || m.action_items) && (
          <SectionCard title="Meeting records" subtitle="Notes and action items" actions={<FileText size={16} className="text-ink-400" />}>
            <div className="space-y-4">
              {ws.meetings
                .filter((m) => m.notes || m.action_items)
                .map((m) => (
                  <article key={m.id} className="rounded-xl border border-ink-100 p-4">
                    <h3 className="text-sm font-semibold text-ink-900">{m.title}</h3>
                    <p className="text-xs text-ink-500">{formatDateTime(m.meeting_date)}</p>
                    {m.notes && <p className="mt-2 whitespace-pre-line text-sm text-ink-700">{m.notes}</p>}
                    {m.action_items && (
                      <div className="mt-2 rounded-lg bg-ink-50 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Action items</p>
                        <p className="mt-1 whitespace-pre-line text-sm text-ink-700">{m.action_items}</p>
                      </div>
                    )}
                  </article>
                ))}
            </div>
          </SectionCard>
        )}
        {!ws.meetings.length && <EmptyState title="No data available yet" />}
      </div>
    </div>
  );
}
