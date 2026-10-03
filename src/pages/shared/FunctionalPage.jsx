import { useMemo } from "react";
import { useWorkspace } from "../../hooks/useWorkspace";
import { usePermissions } from "../../hooks/usePermissions";
import { RecordWorkspace, FUNCTION_AREA_OPTIONS } from "../../components/common/RecordWorkspace";
import { PageTitle, SectionCard, EmptyState, StatTile } from "../../components/common";
import { TASK_STATUS } from "../../lib/utils";

/**
 * FunctionalPage — a parameterised workspace.
 *
 * Every leadership function (brand, campaigns, product, technology, operations,
 * legal, compliance, processes, network, relationships, roadmap, engineering)
 * is fundamentally "the tasks/KPIs/records for this function, with a create form".
 * This component renders exactly that with the correct permissions and copy, so
 * each route remains a real, working page rather than a placeholder.
 */
export function FunctionalPage({
  eyebrow,
  title,
  subtitle,
  icon: Icon,
  areas = [],
  entity = "task",
  extra = null,
}) {
  const ws = useWorkspace();
  const { can } = usePermissions();

  const matches = (x) => areas.length === 0 || areas.includes(x.function_area);
  const tasks = ws.tasks.filter(matches);
  const kpis = ws.kpis.filter(matches);

  const taskColumns = useMemo(
    () => [
      { key: "title", header: "Task", sortable: true, render: (t) => <span className="font-medium text-ink-900">{t.title}</span> },
      { key: "owner_id", header: "Owner", render: (t) => ws.nameOf(t.owner_id) },
      {
        key: "status",
        header: "Status",
        sortable: true,
        render: (t) => {
          const meta = TASK_STATUS[t.status] || { label: t.status };
          return <span className="text-ink-600">{meta.label}</span>;
        },
      },
      { key: "priority", header: "Priority", sortable: true, render: (t) => <span className="capitalize text-ink-600">{t.priority}</span> },
      { key: "due_date", header: "Due", sortable: true, render: (t) => (t.due_date ? new Date(t.due_date).toLocaleDateString() : "—") },
    ],
    [ws]
  );

  const kpiColumns = useMemo(
    () => [
      { key: "name", header: "KPI", render: (k) => <span className="font-medium text-ink-900">{k.name}</span> },
      { key: "owner_id", header: "Owner", render: (k) => ws.nameOf(k.owner_id) },
      { key: "current_value", header: "Current / Target", render: (k) => <span className="tabular-nums">{k.current_value} / {k.target} {k.unit}</span> },
      { key: "period", header: "Period", render: (k) => <span className="capitalize">{k.period}</span> },
    ],
    [ws]
  );

  const fields = [
    { name: "title", label: "Title", required: true, placeholder: `e.g. New ${entity}` },
    { name: "description", label: "Description", type: "textarea" },
    { name: "owner_id", label: "Owner", type: "select", required: true, options: ws.profiles.map((p) => ({ value: p.id, label: p.full_name })) },
    { name: "function_area", label: "Function area", type: "select", options: FUNCTION_AREA_OPTIONS, default: areas[0] || "" },
    { name: "priority", label: "Priority", type: "select", options: ["low", "medium", "high", "critical"].map((v) => ({ value: v, label: v })) },
    { name: "status", label: "Status", type: "select", options: Object.entries(TASK_STATUS).map(([value, m]) => ({ value, label: m.label })), default: "todo" },
    { name: "due_date", label: "Due date", type: "date" },
  ];

  const overdue = tasks.filter((t) => t.due_date && t.status !== "completed" && new Date(t.due_date) < new Date()).length;
  const canManage = areas.some((a) => can(`${a}.manage`)) || can("tasks.create");

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-5 sm:py-6">
      <PageTitle eyebrow={eyebrow} title={title} subtitle={subtitle} />

      <div className="mt-5 space-y-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Open tasks" value={tasks.filter((t) => !["completed", "cancelled"].includes(t.status)).length} icon={Icon} tone="brand" />
          <StatTile label="In progress" value={tasks.filter((t) => t.status === "in_progress").length} icon={Icon} tone="sky" />
          <StatTile label="Overdue" value={overdue} icon={Icon} tone={overdue ? "rose" : "emerald"} />
          <StatTile label="KPIs" value={kpis.length} icon={Icon} tone="emerald" />
        </div>

        <RecordWorkspace
          eyebrow={eyebrow}
          title={`${title} tasks`}
          subtitle={subtitle}
          table="tasks"
          rows={tasks}
          columns={taskColumns}
          fields={fields}
          searchKeys={["title", "status", "priority", "function_area"]}
          canCreate={canManage}
          addLabel={`New ${entity}`}
          emptyTitle={`No ${title.toLowerCase()} records yet`}
          emptyMessage="Records created here will appear in this list."
        />

        {kpis.length > 0 && (
          <SectionCard title={`${title} KPIs`} bodyClassName="p-0" dense>
            <RecordWorkspace
              eyebrow=""
              title=""
              table="kpis"
              rows={kpis}
              columns={kpiColumns}
              fields={[]}
              canCreate={false}
              addLabel=""
              emptyTitle="No KPIs"
            />
          </SectionCard>
        )}

        {extra}

        {!tasks.length && !kpis.length && <EmptyState title="No data available yet" />}
      </div>
    </div>
  );
}
