import { AlertTriangle, Clock, Layers, ListChecks } from "lucide-react";
import { useWorkspace } from "../../hooks/useWorkspace";
import { StatTile, StatusBadge } from "../../components/common";
import { RecordWorkspace, FUNCTION_AREA_OPTIONS } from "../../components/common/RecordWorkspace";
import { usePermissions } from "../../hooks/usePermissions";
import {
  TASK_STATUS,
  TASK_PRIORITY,
  formatDate,
  isOverdue,
  classNames,
} from "../../lib/utils";

export default function TasksPage() {
  const ws = useWorkspace();
  const { can } = usePermissions();
  const byId = ws.byId;

  const columns = [
    {
      key: "title",
      header: "Task",
      sortable: true,
      render: (t) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink-900">{t.title}</p>
          {t.description && <p className="mt-0.5 truncate text-xs text-ink-500">{t.description}</p>}
        </div>
      ),
    },
    {
      key: "owner_id",
      header: "Owner",
      render: (t) => byId[t.owner_id]?.full_name || "Unassigned",
    },
    {
      key: "function_area",
      header: "Function",
      render: (t) => <span className="capitalize text-ink-600">{t.function_area || "—"}</span>,
    },
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      render: (t) => <StatusBadge map={TASK_PRIORITY} value={t.priority} />,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (t) => <StatusBadge map={TASK_STATUS} value={t.status} />,
    },
    {
      key: "due_date",
      header: "Due",
      sortable: true,
      render: (t) => (
        <span className={classNames("tabular-nums", isOverdue(t) && "font-medium text-rose-600")}>
          {formatDate(t.due_date)}
          {isOverdue(t) && " ⚠"}
        </span>
      ),
    },
  ];

  const fields = [
    { name: "title", label: "Title", required: true, placeholder: "e.g. Close Q3 financials" },
    { name: "description", label: "Description", type: "textarea" },
    {
      name: "owner_id",
      label: "Owner",
      type: "select",
      required: true,
      options: ws.profiles.map((p) => ({ value: p.id, label: p.full_name })),
    },
    { name: "function_area", label: "Function area", type: "select", options: FUNCTION_AREA_OPTIONS },
    {
      name: "priority",
      label: "Priority",
      type: "select",
      options: ["low", "medium", "high", "critical"].map((v) => ({ value: v, label: TASK_PRIORITY[v].label })),
      default: "medium",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: Object.entries(TASK_STATUS).map(([value, m]) => ({ value, label: m.label })),
      default: "todo",
    },
    { name: "due_date", label: "Due date", type: "date" },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-5 sm:py-6">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Total tasks" value={ws.taskStats.total} icon={ListChecks} tone="brand" />
          <StatTile label="In progress" value={ws.taskStats.in_progress} icon={Clock} tone="sky" />
          <StatTile label="Blocked" value={ws.taskStats.blocked} icon={Layers} tone="amber" />
          <StatTile
            label="Overdue"
            value={ws.taskStats.overdue}
            icon={AlertTriangle}
            tone={ws.taskStats.overdue ? "rose" : "emerald"}
          />
        </div>

        <RecordWorkspace
          eyebrow="Execution"
          title="Tasks"
          subtitle="Every commitment has an owner, a status and a due date."
          table="tasks"
          rows={ws.tasks}
          columns={columns}
          fields={fields}
          searchKeys={["title", "description", "function_area", "status", "priority"]}
          canCreate={can("tasks.create")}
          addLabel="New task"
          emptyTitle="No tasks yet"
          emptyMessage="Create the first task to start tracking execution."
        />
      </div>
    </div>
  );
}
