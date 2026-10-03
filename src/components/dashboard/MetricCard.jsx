import { classNames, TONE_CLASSES } from "../../lib/utils";

export function MetricCard({ label, value, sub, tone = "ink", icon: Icon, trend, className, onClick }) {
  return (
    <div
      onClick={onClick}
      className={classNames(
        "card p-4",
        onClick && "cursor-pointer transition hover:shadow-pop",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</p>
        {Icon && (
          <span
            className={classNames(
              "flex h-7 w-7 items-center justify-center rounded-lg ring-1 ring-inset",
              TONE_CLASSES[tone] || TONE_CLASSES.ink
            )}
          >
            <Icon size={14} />
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-ink-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-ink-500">{sub}</p>}
      {trend && <p className="mt-1 text-xs font-medium text-ink-600">{trend}</p>}
    </div>
  );
}
