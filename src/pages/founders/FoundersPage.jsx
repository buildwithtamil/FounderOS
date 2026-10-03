import { Mail, Briefcase, TrendingUp } from "lucide-react";
import { useWorkspace } from "../../hooks/useWorkspace";
import { PageTitle, SectionCard, Avatar, StatusBadge, ProgressBar, EmptyState } from "../../components/common";
import { getRole, COLOR_CLASSES } from "../../lib/roles";
import { formatDate, isOverdue, classNames } from "../../lib/utils";

export default function FoundersPage() {
  const ws = useWorkspace();

  const founders = ws.profiles.map((p) => {
    const tasks = ws.tasks.filter((t) => t.owner_id === p.id);
    const kpis = ws.kpis.filter((k) => k.owner_id === p.id);
    const objectives = ws.objectives.filter((o) => o.owner_id === p.id);
    const latest = ws.reports
      .filter((r) => r.author_id === p.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
    return {
      ...p,
      role: getRole(p.role),
      active: tasks.filter((t) => !["completed", "cancelled"].includes(t.status)).length,
      completed: tasks.filter((t) => t.status === "completed").length,
      overdue: tasks.filter(isOverdue).length,
      kpiOnTrack: kpis.filter((k) => Number(k.current_value) >= Number(k.target)).length,
      kpiCount: kpis.length,
      objectiveProgress: objectives.length
        ? Math.round(objectives.reduce((s, o) => s + (Number(o.progress) || 0), 0) / objectives.length)
        : 0,
      objectives: objectives.length,
      latest,
    };
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-5 sm:py-6">
      <div className="space-y-5">
        <PageTitle
          eyebrow="CEO / CFO"
          title="Founder Directory"
          subtitle="Every leadership seat: role, workload, KPI status, current initiatives and latest report."
        />

        {founders.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {founders.map((f) => (
              <SectionCard key={f.id} className="flex flex-col">
                <div className="flex items-start gap-3">
                  <Avatar name={f.full_name} role={f.role.key} size="lg" src={f.avatar_url} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-ink-900">{f.full_name}</p>
                    <span className={classNames("badge mt-1", COLOR_CLASSES[f.role.color])}>{f.role.label}</span>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-500">
                      <Briefcase size={12} /> {f.department || "—"}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-500">
                      <Mail size={12} /> {f.email}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-xs text-ink-500">{f.role.description}</p>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <MiniStat label="Active" value={f.active} />
                  <MiniStat label="Done" value={f.completed} />
                  <MiniStat label="Overdue" value={f.overdue} tone={f.overdue ? "rose" : undefined} />
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-ink-500">
                    <span>KPI health</span>
                    <span className="tabular-nums">
                      {f.kpiOnTrack}/{f.kpiCount} on track
                    </span>
                  </div>
                  <ProgressBar
                    value={f.kpiCount ? (f.kpiOnTrack / f.kpiCount) * 100 : 0}
                    tone="emerald"
                    className="mt-1.5"
                  />
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-lg bg-ink-50 p-3">
                  <TrendingUp size={14} className="shrink-0 text-ink-400" />
                  <p className="truncate text-xs text-ink-600">
                    {f.objectives
                      ? `${f.objectives} initiatives · ${f.objectiveProgress}% avg progress`
                      : "No initiatives assigned"}
                  </p>
                </div>

                <div className="mt-4 border-t border-ink-100 pt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                    Latest report
                  </p>
                  {f.latest ? (
                    <p className="mt-1 line-clamp-2 text-xs text-ink-600">
                      <span className="font-medium text-ink-800">{f.latest.title}</span> ·{" "}
                      {formatDate(f.latest.created_at)}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-ink-400">No reports submitted yet</p>
                  )}
                </div>
              </SectionCard>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No founders yet"
            message="Create the six leadership profiles in Supabase to populate this directory."
          />
        )}
      </div>
    </div>
  );
}

function MiniStat({ label, value, tone }) {
  return (
    <div className="rounded-lg border border-ink-100 py-2">
      <p className={classNames("text-lg font-semibold tabular-nums", tone === "rose" ? "text-rose-600" : "text-ink-900")}>
        {value}
      </p>
      <p className="text-[10px] font-medium uppercase tracking-wide text-ink-400">{label}</p>
    </div>
  );
}

void StatusBadge;
