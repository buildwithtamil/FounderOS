import { AlertTriangle, TrendingDown, Clock, Wallet, ShieldAlert, CheckSquare } from "lucide-react";
import { classNames } from "../../lib/utils";

const ICONS = {
  task: Clock,
  budget: Wallet,
  approval: CheckSquare,
  kpi: TrendingDown,
  deadline: Clock,
  risk: ShieldAlert,
};

const TONES = {
  critical: "border-rose-200 bg-rose-50 text-rose-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  info: "border-brand-200 bg-brand-50 text-brand-700",
};

export function AlertWidget({ alerts = [] }) {
  if (!alerts.length) {
    return (
      <div className="flex items-center gap-2 px-4 py-6 text-sm text-ink-500">
        <CheckSquare size={16} className="text-emerald-500" />
        No alerts — everything on track.
      </div>
    );
  }
  return (
    <ul className="divide-y divide-ink-100">
      {alerts.map((a, i) => {
        const Icon = ICONS[a.kind] || AlertTriangle;
        return (
          <li key={i} className="flex items-start gap-3 px-4 py-3">
            <span
              className={classNames(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border",
                TONES[a.severity] || TONES.info
              )}
            >
              <Icon size={14} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink-900">{a.title}</p>
              {a.detail && <p className="mt-0.5 text-xs text-ink-500">{a.detail}</p>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
