import { Megaphone, Target, TrendingUp, Sparkles } from "lucide-react";
import { useWorkspace } from "../../hooks/useWorkspace";
import { usePermissions } from "../../hooks/usePermissions";
import { RecordWorkspace } from "../../components/common/RecordWorkspace";
import { KPIWidget } from "../../components/dashboard/DashboardWidgets";
import { StatTile, SectionCard, EmptyState } from "../../components/common";
import { FUNCTION_AREAS } from "../../lib/utils";

export default function MarketingPage() {
  const ws = useWorkspace();
  const { can } = usePermissions();
  const marketingKpis = ws.kpis.filter((k) => ["marketing", "brand"].includes(k.function_area));
  const marketingTasks = ws.tasks.filter((t) => ["marketing", "brand"].includes(t.function_area));

  const columns = [
    { key: "title", header: "Task", render: (t) => <span className="font-medium text-ink-900">{t.title}</span> },
    { key: "owner_id", header: "Owner", render: (t) => ws.nameOf(t.owner_id) },
    { key: "status", header: "Status", render: (t) => t.status.replace(/_/g, " ") },
    { key: "priority", header: "Priority", render: (t) => t.priority },
  ];

  const fields = [
    { name: "title", label: "Task", required: true },
    { name: "owner_id", label: "Owner", type: "select", required: true, options: ws.profiles.map((p) => ({ value: p.id, label: p.full_name })) },
    { name: "function_area", label: "Function", type: "select", options: FUNCTION_AREAS.map((v) => ({ value: v, label: v })), default: "marketing" },
    { name: "priority", label: "Priority", type: "select", options: ["low", "medium", "high", "critical"].map((v) => ({ value: v, label: v })) },
    { name: "due_date", label: "Due date", type: "date" },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-5 sm:py-6">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Marketing KPIs" value={marketingKpis.length} icon={Target} tone="brand" />
          <StatTile label="Campaigns" value={ws.campaigns.length} icon={Megaphone} tone="sky" />
          <StatTile label="Marketing tasks" value={marketingTasks.length} icon={TrendingUp} tone="amber" />
          <StatTile label="Active channels" value={new Set(ws.campaigns.map((c) => c.channel)).size} icon={Sparkles} tone="emerald" />
        </div>

        <SectionCard title="Marketing KPIs">
          {marketingKpis.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {marketingKpis.map((k) => <KPIWidget key={k.id} kpi={k} ownerName={ws.nameOf(k.owner_id)} />)}
            </div>
          ) : (
            <EmptyState title="No data available yet" />
          )}
        </SectionCard>

        <RecordWorkspace
          eyebrow="CMO / CSO"
          title="Marketing Workspace"
          subtitle="Acquisition, content, campaigns and marketing execution."
          table="tasks"
          rows={marketingTasks}
          columns={columns}
          fields={fields}
          searchKeys={["title", "status"]}
          canCreate={can("marketing.manage")}
          addLabel="New marketing task"
          emptyTitle="No marketing tasks yet"
          emptyMessage="Campaign and content tasks will appear here."
        />
      </div>
    </div>
  );
}
