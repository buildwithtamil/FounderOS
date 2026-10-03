import { classNames } from "../../lib/utils";

export function ProgressBar({ value = 0, tone = "brand", className, showLabel = false }) {
  const pct = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
  const tones = {
    brand: "bg-brand-600",
    emerald: "bg-emerald-600",
    amber: "bg-amber-500",
    rose: "bg-rose-600",
    sky: "bg-sky-600",
    ink: "bg-ink-500",
  };
  return (
    <div className={classNames("flex items-center gap-2", className)}>
      <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
        <div
          className={classNames("h-full rounded-full", tones[tone] || tones.brand)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="w-9 shrink-0 text-right text-xs font-semibold tabular-nums text-ink-600">
          {pct}%
        </span>
      )}
    </div>
  );
}
