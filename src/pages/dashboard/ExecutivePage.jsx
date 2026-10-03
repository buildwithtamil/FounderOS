import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useWorkspace } from "../../hooks/useWorkspace";
import {
  MetricCard,
  AlertWidget,
  TaskRow,
  ActivityFeed,
} from "../../components/dashboard/DashboardWidgets";
import { SectionCard, EmptyState, ProgressBar, Avatar, StatusBadge } from "../../components/common";
import { ProfileHero } from "../../components/dashboard/ProfileHero";
import { useApp } from "../../hooks/useAuth";
import {
  formatCurrency,
  isOverdue,
  sortBy,
  percent,
} from "../../lib/utils";

export default function ExecutivePage() {
  const { profile } = useApp();
  const ws = useWorkspace();
  const { taskStats, budgetTotals, kpiHealth, objectiveProgress } = ws;

  const criticalTasks = sortBy(
    ws.tasks.filter(
      (t) => ["critical", "high"].includes(t.priority) && !["completed", "cancelled"].includes(t.status)
    ),
    "due_date",
    "asc"
  ).slice(0, 5);

  const todayAlerts = [
    ...ws.tasks.filter(isOverdue).slice(0, 3).map((t) => ({
      kind: "task",
      severity: "critical",
      title: t.title,
      detail: `Overdue · ${ws.nameOf(t.owner_id)}`,
    })),
    ...ws.pendingDecisions.slice(0, 3).map((d) => ({
      kind: "approval",
      severity: "warning",
      title: d.title,
      detail: `Decision ${d.status} · ${ws.nameOf(d.requested_by)}`,
    })),
    ...(budgetTotals.actual > budgetTotals.planned
      ? [{ kind: "budget", severity: "critical", title: "Budget threshold exceeded", detail: `Actual ${formatCurrency(budgetTotals.actual)} vs planned ${formatCurrency(budgetTotals.planned)}` }]
      : []),
    ...ws.openRisks.filter((r) => r.severity === "high").slice(0, 3).map((r) => ({
      kind: "risk",
      severity: "critical",
      title: r.title,
      detail: `${r.category} · ${r.status}`,
    })),
  ];

  const founders = ws.profiles.map((p) => {
    const their = ws.tasks.filter((t) => t.owner_id === p.id);
    const kpis = ws.kpis.filter((k) => k.owner_id === p.id);
    const latestReport = sortBy(
      ws.reports.filter((r) => r.author_id === p.id),
      "created_at",
      "desc"
    )[0];
    return {
      ...p,
      active: their.filter((t) => !["completed", "cancelled"].includes(t.status)).length,
      completed: their.filter((t) => t.status === "completed").length,
      overdue: their.filter(isOverdue).length,
      onTrack: kpis.filter((k) => Number(k.current_value) >= Number(k.target)).length,
      kpiCount: kpis.length,
      latestReport,
    };
  });

  const upcomingMeetings = sortBy(ws.meetings, "meeting_date", "asc").slice(0, 4);

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-5 sm:py-6">
      <div className="space-y-6">
        <ProfileHero
          profile={profile}
          subtitle="What is happening in the company right now, what requires your decision, and where the company is at risk."
        />

        {/* TODAY */}
        <section>
          <SectionLabel label="Today" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard
              label="Critical tasks"
              value={ws.tasks.filter((t) => t.priority === "critical" && t.status !== "completed").length}
              icon={AlertTriangle}
              tone="rose"
            />
            <MetricCard label="Pending approvals" value={ws.pendingDecisions.length + ws.pendingExpenses.length} icon={CheckCircle2} tone="amber" />
            <MetricCard label="Meetings upcoming" value={ws.meetings.length} icon={CalendarDays} tone="brand" />
            <MetricCard label="Overdue tasks" value={taskStats.overdue} icon={Clock} tone={taskStats.overdue ? "rose" : "emerald"} />
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-3">
          <SectionCard
            title="Executive alerts"
            subtitle="Requires attention"
            bodyClassName=""
            className="lg:col-span-1"
          >
            <AlertWidget alerts={todayAlerts} />
          </SectionCard>

          <SectionCard
            title="Critical & high priority tasks"
            subtitle="Execution risk"
            bodyClassName=""
            className="lg:col-span-2"
          >
            {criticalTasks.length ? (
              criticalTasks.map((t) => <TaskRow key={t.id} task={t} ownerName={ws.nameOf(t.owner_id)} />)
            ) : (
              <EmptyState title="No critical tasks open" />
            )}
          </SectionCard>
        </div>

        {/* COMPANY */}
        <section>
          <SectionLabel label="Company" />
          <div className="grid gap-5 lg:grid-cols-3">
            <SectionCard title="Strategic progress" className="lg:col-span-1">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-500">Average objective progress</span>
                    <span className="font-semibold text-ink-900">{objectiveProgress}%</span>
                  </div>
                  <ProgressBar value={objectiveProgress} className="mt-2" />
                </div>
                <ul className="space-y-3">
                  {ws.objectives.slice(0, 4).map((o) => (
                    <li key={o.id}>
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="truncate text-ink-800">{o.title}</span>
                        <span className="shrink-0 text-xs font-semibold text-ink-500">{o.progress}%</span>
                      </div>
                      <ProgressBar
                        value={o.progress}
                        tone={o.progress >= 70 ? "emerald" : o.progress >= 40 ? "brand" : "amber"}
                        className="mt-1.5"
                      />
                    </li>
                  ))}
                  {!ws.objectives.length && <li className="text-sm text-ink-500">No data available yet</li>}
                </ul>
              </div>
            </SectionCard>

            <SectionCard title="KPI health" subtitle={`${ws.kpis.length} KPIs tracked`}>
              <div className="grid grid-cols-3 gap-3 text-center">
                <HealthStat label="On track" value={kpiHealth.on_track} tone="emerald" />
                <HealthStat label="At risk" value={kpiHealth.at_risk} tone="amber" />
                <HealthStat label="Off track" value={kpiHealth.off_track} tone="rose" />
              </div>
              <div className="mt-4 space-y-2">
                {ws.kpis.slice(0, 3).map((k) => (
                  <div key={k.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate text-ink-700">{k.name}</span>
                    <span className="shrink-0 tabular-nums text-ink-500">
                      {percent(k.current_value, k.target)}%
                    </span>
                  </div>
                ))}
                {!ws.kpis.length && <p className="text-sm text-ink-500">No data available yet</p>}
              </div>
            </SectionCard>

            <SectionCard
              title="Founder activity"
              actions={<Link to="/founders" className="text-xs font-medium text-brand-700 hover:underline">Directory</Link>}
            >
              <ul className="space-y-3">
                {founders.slice(0, 5).map((f) => (
                  <li key={f.id} className="flex items-center gap-3">
                    <Avatar name={f.full_name} role={f.role} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-900">{f.full_name}</p>
                      <p className="text-xs text-ink-500">
                        {f.active} active · {f.overdue ? <span className="text-rose-600">{f.overdue} overdue</span> : "0 overdue"}
                      </p>
                    </div>
                    <span className="text-xs text-ink-400">{f.completed} done</span>
                  </li>
                ))}
                {!founders.length && <li className="text-sm text-ink-500">No data available yet</li>}
              </ul>
            </SectionCard>
          </div>
        </section>

        {/* MONEY */}
        <section>
          <SectionLabel label="Money" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard label="Planned budget" value={formatCurrency(budgetTotals.planned)} icon={Wallet} tone="brand" />
            <MetricCard
              label="Actual spend"
              value={formatCurrency(budgetTotals.actual)}
              icon={TrendingUp}
              tone={budgetTotals.actual > budgetTotals.planned ? "rose" : "emerald"}
              hint={`${percent(budgetTotals.actual, budgetTotals.planned)}% of plan`}
            />
            <MetricCard label="Pending expenses" value={ws.pendingExpenses.length} icon={Clock} tone="amber" />
            <MetricCard
              label="Budget utilization"
              value={`${percent(budgetTotals.actual, budgetTotals.planned)}%`}
              icon={Target}
              tone={percent(budgetTotals.actual, budgetTotals.planned) > 100 ? "rose" : "emerald"}
            />
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <SectionCard
              title="Budget vs actual by category"
              actions={<Link to="/finance" className="text-xs font-medium text-brand-700 hover:underline">Finance</Link>}
            >
              <ul className="space-y-4">
                {ws.budgets.map((b) => (
                  <li key={b.id}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize text-ink-800">{b.category}</span>
                      <span className="tabular-nums text-ink-500">
                        {formatCurrency(b.actual_amount)} / {formatCurrency(b.planned_amount)}
                      </span>
                    </div>
                    <ProgressBar
                      value={percent(b.actual_amount, b.planned_amount)}
                      tone={
                        Number(b.actual_amount) > Number(b.planned_amount)
                          ? "rose"
                          : Number(b.actual_amount) / Number(b.planned_amount) > 0.85
                          ? "amber"
                          : "emerald"
                      }
                      className="mt-1.5"
                    />
                  </li>
                ))}
                {!ws.budgets.length && <li className="text-sm text-ink-500">No data available yet</li>}
              </ul>
            </SectionCard>

            <SectionCard title="Governance summary" actions={<Link to="/approvals" className="text-xs font-medium text-brand-700 hover:underline">Approvals</Link>}>
              <div className="grid grid-cols-3 gap-3 text-center">
                <HealthStat label="Pending decisions" value={ws.pendingDecisions.length} tone="amber" />
                <HealthStat label="Open risks" value={ws.openRisks.length} tone="rose" />
                <HealthStat label="Policies" value={ws.policies.length} tone="brand" />
              </div>
              <ul className="mt-4 space-y-2">
                {ws.pendingDecisions.slice(0, 3).map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate text-ink-700">{d.title}</span>
                    <StatusBadge map={DECISION_MAP} value={d.status} />
                  </li>
                ))}
                {!ws.pendingDecisions.length && <li className="text-sm text-ink-500">No data available yet</li>}
              </ul>
            </SectionCard>
          </div>
        </section>

        {/* EXECUTION + GOVERNANCE */}
        <div className="grid gap-5 lg:grid-cols-3">
          <SectionCard title="Execution overview">
            <div className="grid grid-cols-2 gap-3">
              <HealthStat label="Total" value={taskStats.total} tone="ink" />
              <HealthStat label="In progress" value={taskStats.in_progress} tone="brand" />
              <HealthStat label="Blocked" value={taskStats.blocked} tone="rose" />
              <HealthStat label="Completed" value={taskStats.completed} tone="emerald" />
            </div>
          </SectionCard>

          <SectionCard title="Upcoming meetings" className="lg:col-span-1">
            <ul className="space-y-3">
              {upcomingMeetings.map((m) => (
                <li key={m.id} className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-600">
                    <CalendarDays size={15} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-900">{m.title}</p>
                    <p className="text-xs text-ink-500">
                      {m.meeting_type} · {new Date(m.meeting_date).toLocaleDateString()}
                    </p>
                  </div>
                </li>
              ))}
              {!upcomingMeetings.length && <li className="text-sm text-ink-500">No data available yet</li>}
            </ul>
          </SectionCard>

          <SectionCard title="Recent activity" bodyClassName="p-0">
            <ActivityFeed
              items={sortBy(ws.audit_logs, "created_at", "desc").slice(0, 6)}
              profiles={ws.profiles}
            />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ label }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <h2 className="text-xs font-bold uppercase tracking-widest text-ink-400">{label}</h2>
      <div className="h-px flex-1 bg-ink-200" />
    </div>
  );
}

function HealthStat({ label, value, tone }) {
  const tones = {
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    rose: "text-rose-600",
    brand: "text-brand-600",
    ink: "text-ink-700",
  };
  return (
    <div className="rounded-xl border border-ink-100 p-3 text-center">
      <p className={`text-xl font-semibold tabular-nums ${tones[tone] || tones.ink}`}>{value}</p>
      <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-ink-400">{label}</p>
    </div>
  );
}

const DECISION_MAP = {
  draft: { label: "Draft", tone: "ink" },
  pending: { label: "Pending", tone: "amber" },
  approved: { label: "Approved", tone: "emerald" },
  rejected: { label: "Rejected", tone: "rose" },
  implemented: { label: "Implemented", tone: "brand" },
};
