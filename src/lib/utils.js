/** Small, dependency-free helpers shared across FounderOS. */

export function classNames(...parts) {
  return parts.filter(Boolean).join(" ");
}

export function formatDate(value, opts = {}) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...opts,
  });
}

export function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function relativeTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  const diff = Date.now() - d.getTime();
  const mins = Math.round(diff / 60000);
  if (Math.abs(mins) < 1) return "just now";
  if (Math.abs(mins) < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (Math.abs(hours) < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return `${days}d ago`;
  return formatDate(value);
}

export function daysUntil(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

export function isOverdue(task) {
  if (!task?.due_date) return false;
  if (["completed", "cancelled"].includes(task.status)) return false;
  return daysUntil(task.due_date) < 0;
}

export function formatCurrency(value, currency = "USD") {
  if (value === null || value === undefined || value === "") return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatNumber(value) {
  if (value === null || value === undefined || value === "") return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return new Intl.NumberFormat().format(n);
}

export function percent(part, whole) {
  if (!whole || Number(whole) === 0) return 0;
  const p = (Number(part) / Number(whole)) * 100;
  return Math.max(0, Math.min(100, Math.round(p)));
}

export function initials(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
}

export function sortBy(list, key, dir = "desc") {
  const arr = [...(list || [])];
  arr.sort((a, b) => {
    const av = a?.[key];
    const bv = b?.[key];
    if (av === bv) return 0;
    if (av === null || av === undefined) return 1;
    if (bv === null || bv === undefined) return -1;
    return (av > bv ? 1 : -1) * (dir === "asc" ? 1 : -1);
  });
  return arr;
}

export const TASK_STATUS = {
  backlog: { label: "Backlog", tone: "ink" },
  todo: { label: "To Do", tone: "ink" },
  in_progress: { label: "In Progress", tone: "brand" },
  blocked: { label: "Blocked", tone: "rose" },
  review: { label: "Review", tone: "amber" },
  completed: { label: "Completed", tone: "emerald" },
  cancelled: { label: "Cancelled", tone: "ink" },
};

export const TASK_PRIORITY = {
  low: { label: "Low", tone: "ink" },
  medium: { label: "Medium", tone: "sky" },
  high: { label: "High", tone: "amber" },
  critical: { label: "Critical", tone: "rose" },
};

export const DECISION_STATUS = {
  draft: { label: "Draft", tone: "ink" },
  pending: { label: "Pending Review", tone: "amber" },
  approved: { label: "Approved", tone: "emerald" },
  rejected: { label: "Rejected", tone: "rose" },
  implemented: { label: "Implemented", tone: "brand" },
  archived: { label: "Archived", tone: "ink" },
};

export const TONE_CLASSES = {
  ink: "bg-ink-100 text-ink-700 ring-ink-200",
  brand: "bg-brand-50 text-brand-700 ring-brand-200",
  sky: "bg-sky-50 text-sky-700 ring-sky-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
};

export const FUNCTION_AREAS = [
  "executive",
  "finance",
  "strategy",
  "growth",
  "partnerships",
  "marketing",
  "brand",
  "product",
  "technology",
  "operations",
  "legal",
  "compliance",
  "network",
  "people",
];

export const MEETING_TYPES = [
  "Founder Meeting",
  "Strategy Meeting",
  "Product Meeting",
  "Marketing Meeting",
  "Operations Meeting",
  "Finance Review",
  "Governance Meeting",
];

export function titleCase(value = "") {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
