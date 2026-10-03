import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ListChecks,
  Target,
  TrendingUp,
  Users,
  Wallet,
  Compass,
} from "lucide-react";
import { useApp } from "../../hooks/useAuth";
import { usePermissions } from "../../hooks/usePermissions";
import { useWorkspace } from "../../hooks/useWorkspace";
import { MetricCard } from "../../components/dashboard/MetricCard";
import { KPIWidget } from "../../components/dashboard/KPIWidget";
import { AlertWidget } from "../../components/dashboard/AlertWidget";
import { TaskRow } from "../../components/dashboard/TaskWidget";
import { ProfileHero } from "../../components/dashboard/ProfileHero";
import { SectionCard, LoadingBlock, EmptyState } from "../../components/common";
import { formatCurrency, isOverdue, sortBy } from "../../lib/utils";
import { getRole } from "../../lib/roles";

export default function DashboardPage() {
  const { profile } = useApp();
  const { roleMeta } = usePermissions();
  const ws = useWorkspace();

  if (ws.dataState === "loading" && !ws.data?.tasks) {
    return <div className="p-6"><LoadingBlock label="Loading your workspace…" /></div>;
  }

  const mine = ws.tasks.filter((t) => t.owner_id === ws.currentUserId);
  const myKpis = ws.kpis.filter((k) => k.owner_id === ws.currentUserId);
  const myOverdue = mine.filter(isOverdue);
  const upcoming = sortBy(
    mine.filter((t) => t.due_date && !["completed", "cancelled"].includes(t.status)),
    "due_date",
    "asc"
  ).slice(0, 5);

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-5 sm:py-6">
      <div className="space-y-5">
        <ProfileHero
          profile={profile}
          subtitle={`${roleMeta.label} · ${roleMeta.description}`}
        />

        {/* Personal metrics */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard label="My tasks" value={mine.length} icon={ListChecks} tone="brand" />
          <MetricCard
            label="In progress"
            value={mine.filter((t) => t.status === "in_progress").length}
            icon={Clock}
            tone="sky"
          />
          <MetricCard
            label="Overdue"
            value={myOverdue.length}
            icon={AlertTriangle}
            tone={myOverdue.length ? "rose" : "emerald"}
          />
          <MetricCard label="My KPIs" value={myKpis.length} icon={Target} tone="emerald" />
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* My work */}
          <SectionCard
            title="My work"
            subtitle="Tasks assigned to you"
            className="lg:col-span-2"
            bodyClassName=""
            actions={
              <Link to="/tasks" className="text-xs font-medium text-brand-700 hover:underline">
                View all
              </Link>
            }
          >
            {mine.length ? (
              sortBy(mine, "due_date", "asc").slice(0, 6).map((t) => (
                <TaskRow key={t.id} task={t} />
              ))
            ) : (
              <EmptyState title="No tasks assigned yet" message="Assigned tasks will appear here." />
            )}
          </SectionCard>

          {/* Alerts */}
          <SectionCard title="Attention needed" bodyClassName="">
            <AlertWidget
              alerts={[
                ...myOverdue.map((t) => ({
                  kind: "task",
                  severity: "critical",
                  title: t.title,
                  detail: "Overdue task",
                })),
                ...ws.kpis
                  .filter((k) => Number(k.current_value) < Number(k.target) * 0.85)
                  .slice(0, 3)
                  .map((k) => ({
                    kind: "kpi",
                    severity: "warning",
                    title: `${k.name} below target`,
                    detail: `${k.current_value} / ${k.target} ${k.unit}`,
                  })),
              ]}
            />
          </SectionCard>
        </div>

        {/* Upcoming deadlines */}
        <div className="grid gap-5 lg:grid-cols-3">
          <SectionCard title="Upcoming deadlines" className="lg:col-span-2" bodyClassName="">
            {upcoming.length ? (
              upcoming.map((t) => <TaskRow key={t.id} task={t} />)
            ) : (
              <EmptyState title="No upcoming deadlines" />
            )}
          </SectionCard>

          <SectionCard title="My KPIs" bodyClassName="space-y-3">
            {myKpis.length ? (
              myKpis.slice(0, 3).map((k) => (
                <KPIWidget key={k.id} kpi={k} ownerName={ws.nameOf(k.owner_id)} />
              ))
            ) : (
              <EmptyState title="No KPIs assigned yet" />
            )}
          </SectionCard>
        </div>

        {/* Role-specific quick links */}
        <RoleInsights ws={ws} role={profile?.role} />
      </div>
    </div>
  );
}

function RoleInsights({ ws, role }) {
  const cards = {
    ceo_cfo: [
      { to: "/executive", label: "Executive command center", icon: Compass, value: `${ws.pendingDecisions.length} decisions` },
      { to: "/finance", label: "Finance", icon: Wallet, value: formatCurrency(ws.budgetTotals.actual) },
      { to: "/founders", label: "Founder overview", icon: Users, value: `${ws.profiles.length} seats` },
    ],
    cso_cgo: [
      { to: "/strategy", label: "Strategic objectives", icon: Compass, value: `${ws.objectiveProgress}% avg progress` },
      { to: "/growth", label: "Growth KPIs", icon: TrendingUp, value: `${ws.kpis.filter((k) => k.function_area === "growth").length} tracked` },
      { to: "/partnerships", label: "Partnerships", icon: Users, value: `${ws.partnerships.length} active` },
    ],
    cmo_cso: [
      { to: "/marketing", label: "Marketing KPIs", icon: Target, value: `${ws.kpis.filter((k) => k.function_area === "marketing").length} tracked` },
      { to: "/campaigns", label: "Campaigns", icon: TrendingUp, value: `${ws.campaigns.length} running` },
      { to: "/strategy", label: "Strategy contribution", icon: Compass, value: `${ws.objectiveProgress}% avg` },
    ],
    cpo_cto: [
      { to: "/product", label: "Product", icon: Compass, value: `${ws.tasks.filter((t) => t.function_area === "product").length} tasks` },
      { to: "/technology", label: "Technology", icon: Target, value: `${ws.tasks.filter((t) => t.function_area === "technology").length} tasks` },
      { to: "/roadmap", label: "Roadmap", icon: Compass, value: `${ws.objectives.length} objectives` },
    ],
    clo_coo: [
      { to: "/operations", label: "Operations", icon: Compass, value: `${ws.tasks.filter((t) => t.function_area === "operations").length} tasks` },
      { to: "/legal", label: "Legal", icon: Target, value: `${ws.tasks.filter((t) => t.function_area === "legal").length} tasks` },
      { to: "/compliance", label: "Compliance", icon: CheckCircle2, value: `${ws.policies.length} policies` },
    ],
    cno: [
      { to: "/network", label: "Network", icon: Users, value: `${ws.kpis.filter((k) => k.function_area === "network").length} KPIs` },
      { to: "/relationships", label: "Relationships", icon: Compass, value: "Outreach pipeline" },
      { to: "/partnerships", label: "Partnerships", icon: TrendingUp, value: `${ws.partnerships.length} active` },
    ],
  };

  const items = cards[role] || [];
  if (!items.length) return null;
  const roleMeta = getRole(role);

  return (
    <SectionCard title={`${roleMeta.short} workspace`}>
      <div className="grid gap-3 sm:grid-cols-3">
        {items.map(({ to, label, icon: Icon, value }) => (
          <Link
            key={to}
            to={to}
            className="group flex items-center justify-between gap-3 rounded-xl border border-ink-200 p-4 transition hover:border-brand-300 hover:bg-brand-50/40"
          >
            <div>
              <p className="text-sm font-medium text-ink-900">{label}</p>
              <p className="mt-0.5 text-xs text-ink-500">{value}</p>
            </div>
            <Icon size={18} className="text-ink-300 group-hover:text-brand-500" />
          </Link>
        ))}
      </div>
    </SectionCard>
  );
}
