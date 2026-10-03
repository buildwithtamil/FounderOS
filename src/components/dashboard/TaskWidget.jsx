import { AlertTriangle, Clock, CheckCircle2, Flag } from "lucide-react";
import { StatusBadge } from "../common/Badge";
import { TASK_STATUS, TASK_PRIORITY, formatDate, daysUntil, isOverdue, classNames } from "../../lib/utils";

export function TaskRow({ task, ownerName, compact }) {
  const overdue = isOverdue(task);
  const due = daysUntil(task.due_date);
  return (
    <div
      className={classNames(
        "flex items-start gap-3 px-4 py-3",
        !compact && "border-b border-ink-100 last:border-0"
      )}
    >
      <span className="mt-0.5 shrink-0">
        {task.status === "completed" ? (
          <CheckCircle2 size={16} className="text-emerald-500" />
        ) : overdue ? (
          <AlertTriangle size={16} className="text-rose-500" />
        ) : (
          <Flag size={16} className="text-ink-300" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink-900">{task.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <StatusBadge map={TASK_STATUS} value={task.status} />
          <StatusBadge map={TASK_PRIORITY} value={task.priority} />
          {task.function_area && (
            <span className="text-[11px] capitalize text-ink-400">{task.function_area}</span>
          )}
          {task.due_date && (
            <span
              className={classNames(
                "inline-flex items-center gap-1 text-[11px] font-medium",
                overdue ? "text-rose-600" : "text-ink-400"
              )}
            >
              <Clock size={11} />
              {formatDate(task.due_date)}
              {overdue && due !== null ? ` · ${Math.abs(due)}d overdue` : ""}
              {!overdue && due !== null && due <= 3 ? ` · in ${due}d` : ""}
            </span>
          )}
        </div>
      </div>
      {ownerName && !compact && (
        <span className="hidden shrink-0 text-xs text-ink-500 sm:block">{ownerName}</span>
      )}
    </div>
  );
}

export function TaskWidget({ tasks = [], profiles = [], title, emptyMessage }) {
  const byId = Object.fromEntries(profiles.map((p) => [p.id, p.full_name]));
  if (!tasks.length) {
    return (
      <div className="px-4 py-8 text-center text-sm text-ink-500">
        {emptyMessage || "No data available yet"}
      </div>
    );
  }
  return (
    <div>
      {title && <p className="border-b border-ink-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink-500">{title}</p>}
      {tasks.map((t) => (
        <TaskRow key={t.id} task={t} ownerName={byId[t.owner_id]} />
      ))}
    </div>
  );
}
