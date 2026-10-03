import { FileText, CheckCircle2, Clock } from "lucide-react";
import { useWorkspace } from "../../hooks/useWorkspace";
import { useApp } from "../../hooks/useAuth";
import { usePermissions } from "../../hooks/usePermissions";
import { RecordWorkspace } from "../../components/common/RecordWorkspace";
import { SectionCard, StatTile, StatusBadge, EmptyState } from "../../components/common";
import { formatDate } from "../../lib/utils";

const REPORT_STATUS = {
  draft: { label: "Draft", tone: "ink" },
  submitted: { label: "Submitted", tone: "amber" },
  approved: { label: "Approved", tone: "emerald" },
  rejected: { label: "Changes requested", tone: "rose" },
};

export default function ReportsPage() {
  const ws = useWorkspace();
  const { profile } = useApp();
  const { can } = usePermissions();
  const canViewAll = can("reports.view_all");

  const visible = canViewAll ? ws.reports : ws.reports.filter((r) => r.author_id === profile?.id);

  const columns = [
    { key: "title", header: "Report", sortable: true, render: (r) => <span className="font-medium text-ink-900">{r.title}</span> },
    { key: "author_id", header: "Author", render: (r) => ws.nameOf(r.author_id) },
    { key: "report_type", header: "Type", render: (r) => <span className="capitalize text-ink-600">{r.report_type}</span> },
    { key: "period_start", header: "Period", render: (r) => <span className="tabular-nums text-xs">{formatDate(r.period_start)} → {formatDate(r.period_end)}</span> },
    { key: "status", header: "Status", render: (r) => <StatusBadge map={REPORT_STATUS} value={r.status} /> },
    { key: "created_at", header: "Submitted", sortable: true, render: (r) => <span className="tabular-nums">{formatDate(r.created_at)}</span> },
  ];

  const fields = [
    { name: "title", label: "Report title", required: true, placeholder: "e.g. Growth — Weekly Update" },
    { name: "author_id", label: "Author", type: "select", required: true, options: ws.profiles.map((p) => ({ value: p.id, label: p.full_name })), default: profile?.id },
    { name: "report_type", label: "Report type", type: "select", options: ["weekly", "monthly", "quarterly", "annual", "ad_hoc"] },
    { name: "period_start", label: "Period start", type: "date" },
    { name: "period_end", label: "Period end", type: "date" },
    { name: "summary", label: "Summary", type: "textarea", hint: "Achievements, priorities, KPI progress, problems, risks, decisions required, next-period priorities." },
    { name: "status", label: "Status", type: "select", options: Object.entries(REPORT_STATUS).map(([value, m]) => ({ value, label: m.label })), default: "draft" },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-5 sm:py-6">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label={canViewAll ? "Company reports" : "My reports"} value={visible.length} icon={FileText} tone="brand" />
          <StatTile label="Submitted" value={visible.filter((r) => r.status === "submitted").length} icon={Clock} tone="amber" />
          <StatTile label="Approved" value={visible.filter((r) => r.status === "approved").length} icon={CheckCircle2} tone="emerald" />
          <StatTile label="Draft" value={visible.filter((r) => r.status === "draft").length} icon={FileText} tone="ink" />
        </div>

        <RecordWorkspace
          eyebrow="Reporting"
          title="Reports"
          subtitle={
            canViewAll
              ? "Company-wide reports from every leadership seat."
              : "Your reports. The CEO/CFO seat can view company-wide reports."
          }
          table="reports"
          rows={visible}
          columns={columns}
          fields={fields}
          searchKeys={["title", "report_type", "status", "summary"]}
          canCreate={can("reports.create")}
          addLabel="New report"
          emptyTitle="No reports yet"
          emptyMessage="Submit your first report to keep leadership aligned."
        />

        {visible.length > 0 && (
          <SectionCard title="Latest report content">
            <div className="space-y-4">
              {visible
                .slice()
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 3)
                .map((r) => (
                  <article key={r.id} className="rounded-xl border border-ink-100 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-ink-900">{r.title}</h3>
                      <StatusBadge map={REPORT_STATUS} value={r.status} />
                    </div>
                    <p className="mt-1 text-xs text-ink-500">
                      {ws.nameOf(r.author_id)} · {formatDate(r.period_start)} → {formatDate(r.period_end)}
                    </p>
                    {r.summary && <p className="mt-2 whitespace-pre-line text-sm text-ink-700">{r.summary}</p>}
                  </article>
                ))}
            </div>
          </SectionCard>
        )}
        {!visible.length && <EmptyState title="No data available yet" />}
      </div>
    </div>
  );
}
