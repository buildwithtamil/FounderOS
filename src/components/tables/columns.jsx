import { StatusBadge } from "../common/Badge";
import { ProgressBar } from "../common/ProgressBar";
import { formatCurrency, formatDate, TASK_STATUS, TASK_PRIORITY } from "../../lib/utils";

/** Column builders reused across functional pages. */

export const ownerColumn = (byId) => ({
  key: "owner_id",
  header: "Owner",
  render: (r) => byId[r.owner_id]?.full_name || "Unassigned",
});

export const functionColumn = {
  key: "function_area",
  header: "Function",
  render: (r) => <span className="capitalize text-ink-600">{r.function_area || "—"}</span>,
};

export const taskStatusColumn = {
  key: "status",
  header: "Status",
  sortable: true,
  render: (r) => <StatusBadge map={TASK_STATUS} value={r.status} />,
};

export const taskPriorityColumn = {
  key: "priority",
  header: "Priority",
  sortable: true,
  render: (r) => <StatusBadge map={TASK_PRIORITY} value={r.priority} />,
};

export const dueColumn = {
  key: "due_date",
  header: "Due",
  sortable: true,
  render: (r) => <span className="tabular-nums">{formatDate(r.due_date)}</span>,
};

export const progressColumn = {
  key: "progress",
  header: "Progress",
  sortable: true,
  render: (r) => <ProgressBar value={r.progress} showLabel className="min-w-[110px]" />,
};

export const amountColumn = {
  key: "amount",
  header: "Amount",
  sortable: true,
  render: (r) => <span className="tabular-nums">{formatCurrency(r.amount)}</span>,
};

export const planVsActualColumn = {
  key: "actual_amount",
  header: "Actual / Planned",
  render: (r) => (
    <div className="min-w-[120px]">
      <div className="flex justify-between text-xs tabular-nums text-ink-500">
        <span>{formatCurrency(r.actual_amount)}</span>
        <span>{formatCurrency(r.planned_amount)}</span>
      </div>
      <ProgressBar
        value={r.planned_amount ? (Number(r.actual_amount) / Number(r.planned_amount)) * 100 : 0}
        tone={Number(r.actual_amount) > Number(r.planned_amount) ? "rose" : "emerald"}
        className="mt-1"
      />
    </div>
  ),
};
