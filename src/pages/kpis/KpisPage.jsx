import { Target, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useWorkspace } from "../../hooks/useWorkspace";
import { usePermissions } from "../../hooks/usePermissions";
import { RecordWorkspace, FUNCTION_AREA_OPTIONS } from "../../components/common/RecordWorkspace";
import { KPIWidget } from "../../components/dashboard/DashboardWidgets";
import { SectionCard, StatTile, EmptyState } from "../../components/common";
import { formatNumber } from "../../lib/utils";

export default function KpisPage() {
  const ws = useWorkspace();
  const { can } = usePermissions();

  const { kpiHealth } = ws;

  const columns = [
    {
      key: "name",
      header: "KPI",
      sortable: true,
      render: (k) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink-900">{k.name}</p>
          {k.description && <p className="mt-0.5 truncate text-xs text-ink-500">{k.description}</p>}
        </div>
      ),
    },
    { key: "owner_id", header: "Owner", render: (k) => ws.byId[k.owner_id]?.full_name || "Unassigned" },
    { key: "function_area", header: "Function", render: (k) => <span className="capitalize text-ink-600">{k.function_area || "—"}</span> },
    {
      key: "current_value",
      header: "Current / Target",
      sortable: true,
      render: (k) => (
        <span className="tabular-nums">
          {formatNumber(k.current_value)} / {formatNumber(k.target)} {k.unit}
        </span>
      ),
    },
    { key: "period", header: "Period", render: (k) => <span className="capitalize text-ink-600">{k.period || "—"}</span> },
    {
      key: "status",
      header: "Health",
      render: (k) => {
        const ratio = Number(k.target) ? Number(k.current_value) / Number(k.target) : 0;
        return ratio >= 1 ? "On track" : ratio >= 0.85 ? "At risk" : "Off track";
      },
    },
  ];

  const fields = [
    { name: "name", label: "KPI name", required: true, placeholder: "e.g. Monthly Recurring Revenue" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "owner_id", label: "Owner", type: "select", required: true, options: ws.profiles.map((p) => ({ value: p.id, label: p.full_name })) },
    { name: "function_area", label: "Function area", type: "select", options: FUNCTION_AREA_OPTIONS },
    { name: "target", label: "Target", type: "number", required: true },
    { name: "current_value", label: "Current value", type: "number", default: 0 },
    { name: "unit", label: "Unit", placeholder: "USD, %, count…" },
    { name: "period", label: "Period", type: "select", options: ["weekly", "monthly", "quarterly", "annual"] },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-5 sm:py-6">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="KPIs tracked" value={ws.kpis.length} icon={Target} tone="brand" />
          <StatTile label="On track" value={kpiHealth.on_track} icon={CheckCircle2} tone="emerald" />
          <StatTile label="At risk" value={kpiHealth.at_risk} icon={TrendingUp} tone="amber" />
          <StatTile label="Off track" value={kpiHealth.off_track} icon={AlertTriangle} tone="rose" />
        </div>

        <RecordWorkspace
          eyebrow="Measurement"
          title="KPIs"
          subtitle="Name, current value, target, progress, owner and period — the measurement backbone."
          table="kpis"
          rows={ws.kpis}
          columns={columns}
          fields={fields}
          searchKeys={["name", "function_area", "period"]}
          canCreate={can("kpis.manage")}
          addLabel="New KPI"
          emptyTitle="No KPIs yet"
          emptyMessage="Define the metrics that matter to start measuring execution."
        >
          {ws.kpis.length > 0 && (
            <SectionCard title="KPI spotlight" subtitle="Visual progress">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ws.kpis.slice(0, 6).map((k) => (
                  <KPIWidget key={k.id} kpi={k} ownerName={ws.nameOf(k.owner_id)} />
                ))}
              </div>
            </SectionCard>
          )}
          {!ws.kpis.length && <EmptyState title="No data available yet" />}
        </RecordWorkspace>
      </div>
    </div>
  );
}
