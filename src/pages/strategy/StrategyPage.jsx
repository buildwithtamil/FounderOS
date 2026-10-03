import { Compass, Flag, TrendingUp } from "lucide-react";
import { useWorkspace } from "../../hooks/useWorkspace";
import { usePermissions } from "../../hooks/usePermissions";
import { RecordWorkspace } from "../../components/common/RecordWorkspace";
import { SectionCard, StatTile, StatusBadge, ProgressBar } from "../../components/common";
import { formatDate, percent } from "../../lib/utils";

const OBJ_STATUS = {
  planned: { label: "Planned", tone: "ink" },
  in_progress: { label: "In Progress", tone: "brand" },
  at_risk: { label: "At Risk", tone: "amber" },
  completed: { label: "Completed", tone: "emerald" },
  cancelled: { label: "Cancelled", tone: "ink" },
};

export default function StrategyPage() {
  const ws = useWorkspace();
  const { can } = usePermissions();

  const columns = [
    { key: "title", header: "Objective", sortable: true, render: (o) => <span className="font-medium text-ink-900">{o.title}</span> },
    { key: "owner_id", header: "Owner", render: (o) => ws.byId[o.owner_id]?.full_name || "Unassigned" },
    { key: "priority", header: "Priority", render: (o) => <StatusBadge map={PRIORITY} value={o.priority} /> },
    { key: "progress", header: "Progress", sortable: true, render: (o) => <ProgressBar value={o.progress} showLabel className="min-w-[120px]" /> },
    { key: "status", header: "Status", render: (o) => <StatusBadge map={OBJ_STATUS} value={o.status} /> },
    { key: "target_date", header: "Target", sortable: true, render: (o) => <span className="tabular-nums">{formatDate(o.target_date)}</span> },
  ];

  const fields = [
    { name: "title", label: "Objective", required: true, placeholder: "e.g. Reach $1M ARR run-rate" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "owner_id", label: "Owner", type: "select", required: true, options: ws.profiles.map((p) => ({ value: p.id, label: p.full_name })) },
    { name: "priority", label: "Priority", type: "select", options: ["low", "medium", "high", "critical"].map((v) => ({ value: v, label: v })) },
    { name: "progress", label: "Progress %", type: "number", default: 0 },
    { name: "status", label: "Status", type: "select", options: Object.entries(OBJ_STATUS).map(([value, m]) => ({ value, label: m.label })), default: "in_progress" },
    { name: "start_date", label: "Start date", type: "date" },
    { name: "target_date", label: "Target date", type: "date" },
  ];

  const avg = ws.objectiveProgress;

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-5 sm:py-6">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Objectives" value={ws.objectives.length} icon={Compass} tone="brand" />
          <StatTile label="Avg progress" value={`${avg}%`} icon={TrendingUp} tone="emerald" />
          <StatTile label="At risk" value={ws.objectives.filter((o) => o.status === "at_risk").length} icon={Flag} tone="amber" />
          <StatTile label="Completed" value={ws.objectives.filter((o) => o.status === "completed").length} icon={Flag} tone="emerald" />
        </div>

        <RecordWorkspace
          eyebrow="Direction"
          title="Strategy"
          subtitle="Company objectives, owners, progress and deadlines. Functional leaders manage their assigned initiatives."
          table="strategic_objectives"
          rows={ws.objectives}
          columns={columns}
          fields={fields}
          searchKeys={["title", "status", "priority"]}
          canCreate={can("strategy.manage")}
          addLabel="New objective"
          emptyTitle="No objectives yet"
          emptyMessage="Set the company's strategic objectives to anchor execution."
        >
          {ws.objectives.length > 0 && (
            <SectionCard title="Objective board" subtitle="Progress at a glance">
              <div className="space-y-4">
                {ws.objectives.map((o) => (
                  <div key={o.id} className="rounded-xl border border-ink-100 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-ink-900">{o.title}</p>
                        <p className="text-xs text-ink-500">
                          {ws.nameOf(o.owner_id)} · {formatDate(o.start_date)} → {formatDate(o.target_date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge map={PRIORITY} value={o.priority} />
                        <StatusBadge map={OBJ_STATUS} value={o.status} />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <ProgressBar value={o.progress} tone={o.progress >= 70 ? "emerald" : o.progress >= 40 ? "brand" : "amber"} className="flex-1" />
                      <span className="w-10 text-right text-sm font-semibold tabular-nums text-ink-700">{percent(o.progress, 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </RecordWorkspace>
      </div>
    </div>
  );
}

const PRIORITY = {
  low: { label: "Low", tone: "ink" },
  medium: { label: "Medium", tone: "sky" },
  high: { label: "High", tone: "amber" },
  critical: { label: "Critical", tone: "rose" },
};
