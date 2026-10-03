import { ProgressBar } from "../common/ProgressBar";
import { formatNumber } from "../../lib/utils";

/** Maps a KPI row to a status tone based on current vs target. */
export function kpiTone(kpi) {
  const target = Number(kpi.target) || 0;
  const current = Number(kpi.current_value) || 0;
  if (!target) return "ink";
  const ratio = current / target;
  if (ratio >= 1) return "emerald";
  if (ratio >= 0.85) return "amber";
  return "rose";
}

export function KPIWidget({ kpi, ownerName }) {
  const target = Number(kpi.target) || 0;
  const current = Number(kpi.current_value) || 0;
  const pct = target ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const tone = kpiTone(kpi);

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink-900">{kpi.name}</p>
          <p className="mt-0.5 text-xs capitalize text-ink-500">
            {kpi.function_area} · {kpi.period}
            {ownerName ? ` · ${ownerName}` : ""}
          </p>
        </div>
        <span className="shrink-0 text-right">
          <span className="text-lg font-semibold tabular-nums text-ink-900">
            {formatNumber(kpi.current_value)}
          </span>
          <span className="block text-[11px] text-ink-400">
            / {formatNumber(kpi.target)} {kpi.unit}
          </span>
        </span>
      </div>
      <div className="mt-3">
        <ProgressBar value={pct} tone={tone} showLabel />
      </div>
    </div>
  );
}
