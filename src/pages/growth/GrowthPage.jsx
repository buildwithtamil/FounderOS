import { TrendingUp, Target, Users, Handshake } from "lucide-react";
import { useWorkspace } from "../../hooks/useWorkspace";
import { usePermissions } from "../../hooks/usePermissions";
import { RecordWorkspace } from "../../components/common/RecordWorkspace";
import { KPIWidget } from "../../components/dashboard/DashboardWidgets";
import { StatTile, SectionCard, EmptyState } from "../../components/common";
import { FUNCTION_AREAS } from "../../lib/utils";

export default function GrowthPage() {
  const ws = useWorkspace();
  const { can } = usePermissions();
  const growthKpis = ws.kpis.filter((k) => ["growth", "partnerships"].includes(k.function_area));
  const growthTasks = ws.tasks.filter((t) => t.function_area === "growth");

  const columns = [
    { key: "title", header: "Task", render: (t) => <span className="font-medium text-ink-900">{t.title}</span> },
    { key: "owner_id", header: "Owner", render: (t) => ws.nameOf(t.owner_id) },
    { key: "status", header: "Status", render: (t) => t.status.replace(/_/g, " ") },
    { key: "due_date", header: "Due", render: (t) => (t.due_date ? new Date(t.due_date).toLocaleDateString() : "—") },
  ];

  const fields = [
    { name: "title", label: "Task", required: true },
    { name: "owner_id", label: "Owner", type: "select", required: true, options: ws.profiles.map((p) => ({ value: p.id, label: p.full_name })) },
    { name: "function_area", label: "Function", type: "select", options: FUNCTION_AREAS.map((v) => ({ value: v, label: v })), default: "growth" },
    { name: "priority", label: "Priority", type: "select", options: ["low", "medium", "high", "critical"].map((v) => ({ value: v, label: v })) },
    { name: "due_date", label: "Due date", type: "date" },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-5 sm:py-6">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Growth KPIs" value={growthKpis.length} icon={Target} tone="brand" />
          <StatTile label="Growth tasks" value={growthTasks.length} icon={TrendingUp} tone="sky" />
          <StatTile label="Partnerships" value={ws.partnerships.length} icon={Handshake} tone="emerald" />
          <StatTile label="Pipeline owners" value={new Set(growthTasks.map((t) => t.owner_id)).size} icon={Users} tone="amber" />
        </div>

        <SectionCard title="Growth KPIs">
          {growthKpis.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {growthKpis.map((k) => <KPIWidget key={k.id} kpi={k} ownerName={ws.nameOf(k.owner_id)} />)}
            </div>
          ) : (
            <EmptyState title="No data available yet" message="Growth KPIs will appear here once defined." />
          )}
        </SectionCard>

        <RecordWorkspace
          eyebrow="CSO / CGO"
          title="Growth Workspace"
          subtitle="Business development and expansion execution."
          table="tasks"
          rows={growthTasks}
          columns={columns}
          fields={fields}
          searchKeys={["title", "status"]}
          canCreate={can("growth.manage")}
          addLabel="New growth task"
          emptyTitle="No growth tasks yet"
          emptyMessage="Business development tasks will appear here."
        />
      </div>
    </div>
  );
}
