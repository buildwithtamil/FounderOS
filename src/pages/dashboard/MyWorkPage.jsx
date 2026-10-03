import { Link } from "react-router-dom";
import {
  CalendarDays,
  CheckSquare,
  Crown,
  ShieldAlert,
  Wallet,
  Users,
  TrendingUp,
  Target,
  Activity,
} from "lucide-react";

const SECTIONS = [
  {
    key: "executive",
    title: "Executive",
    description: "Company health, founder overview, strategic progress and governance.",
    to: "/executive",
    icon: Crown,
    tone: "brand",
    permission: "executive.view",
  },
  {
    key: "finance",
    title: "Finance",
    description: "Budgets, expenses, cash planning and financial approvals.",
    to: "/finance",
    icon: Wallet,
    tone: "emerald",
    permission: "finance.view",
  },
  {
    key: "founders",
    title: "Founders",
    description: "Directory of leadership seats, workload and latest reports.",
    to: "/founders",
    icon: Users,
    tone: "amber",
    permission: "founders.view",
  },
  {
    key: "governance",
    title: "Governance",
    description: "Decision register, policies and meeting records.",
    to: "/governance",
    icon: CheckSquare,
    tone: "sky",
    permission: "governance.view",
  },
  {
    key: "approvals",
    title: "Approvals",
    description: "Pending decisions, expenses and reports awaiting your sign-off.",
    to: "/approvals",
    icon: CheckSquare,
    tone: "rose",
    permission: "approvals.manage",
  },
  {
    key: "risk",
    title: "Risk",
    description: "Risk register, severities and mitigation status.",
    to: "/risk",
    icon: ShieldAlert,
    tone: "rose",
    permission: "risk.manage",
  },
  {
    key: "strategy",
    title: "Strategy",
    description: "Objectives, progress and strategic initiatives.",
    to: "/strategy",
    icon: TrendingUp,
    tone: "brand",
    permission: "strategy.view",
  },
  {
    key: "growth",
    title: "Growth",
    description: "Growth KPIs, pipeline and business development.",
    to: "/growth",
    icon: TrendingUp,
    tone: "sky",
    permission: "growth.view",
  },
  {
    key: "partnerships",
    title: "Partnerships",
    description: "Strategic partnerships and relationship pipeline.",
    to: "/partnerships",
    icon: Users,
    tone: "emerald",
    permission: "partnerships.view",
  },
  {
    key: "marketing",
    title: "Marketing",
    description: "Marketing KPIs, campaigns and acquisition.",
    to: "/marketing",
    icon: Target,
    tone: "rose",
    permission: "marketing.view",
  },
  {
    key: "product",
    title: "Product",
    description: "Roadmap, releases and product KPIs.",
    to: "/product",
    icon: Target,
    tone: "emerald",
    permission: "product.view",
  },
  {
    key: "technology",
    title: "Technology",
    description: "Engineering initiatives, infrastructure and technical tasks.",
    to: "/technology",
    icon: Activity,
    tone: "sky",
    permission: "technology.view",
  },
  {
    key: "operations",
    title: "Operations",
    description: "Internal processes, documentation and operational execution.",
    to: "/operations",
    icon: CalendarDays,
    tone: "amber",
    permission: "operations.view",
  },
  {
    key: "legal",
    title: "Legal",
    description: "Legal tasks, compliance and documentation.",
    to: "/legal",
    icon: ShieldAlert,
    tone: "sky",
    permission: "legal.view",
  },
  {
    key: "network",
    title: "Network",
    description: "Networking, external relationships and community.",
    to: "/network",
    icon: Users,
    tone: "rose",
    permission: "network.view",
  },
];

import { usePermissions } from "../../hooks/usePermissions";
import { useWorkspace } from "../../hooks/useWorkspace";
import { SectionCard, StatTile } from "../../components/common";
import { relativeTime } from "../../lib/utils";
import { ProfileHero } from "../../components/dashboard/ProfileHero";
import { useApp } from "../../hooks/useAuth";

export default function MyWorkPage() {
  const { profile } = useApp();
  const { can } = usePermissions();
  const ws = useWorkspace();
  const role = ws.byId[ws.currentUserId]?.role;
  const accessible = SECTIONS.filter((s) => can(s.permission));

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-5 sm:py-6">
      <div className="space-y-5">
        <ProfileHero
          profile={profile}
          subtitle="Your tasks, KPIs, reports and the functional workspaces your role can reach."
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="My tasks" value={ws.tasks.filter((t) => t.owner_id === ws.currentUserId).length} tone="brand" />
          <StatTile
            label="Completed"
            value={ws.tasks.filter((t) => t.owner_id === ws.currentUserId && t.status === "completed").length}
            tone="emerald"
          />
          <StatTile label="My KPIs" value={ws.kpis.filter((k) => k.owner_id === ws.currentUserId).length} tone="sky" />
          <StatTile
            label="My reports"
            value={ws.reports.filter((r) => r.author_id === ws.currentUserId).length}
            tone="amber"
          />
        </div>

        <SectionCard title="Accessible workspaces" subtitle={`Based on your role: ${role || "unassigned"}`}>
          {accessible.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {accessible.map(({ key, title, description, to, icon: Icon }) => (
                <Link
                  key={key}
                  to={to}
                  className="group flex items-start gap-3 rounded-xl border border-ink-200 p-4 transition hover:border-brand-300 hover:bg-brand-50/40"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-600 group-hover:bg-brand-100 group-hover:text-brand-700">
                    <Icon size={17} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-900">{title}</p>
                    <p className="mt-0.5 text-xs text-ink-500">{description}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-500">No functional workspace is assigned to your role.</p>
          )}
        </SectionCard>

        <SectionCard title="My recent activity" bodyClassName="p-0">
          <ul className="divide-y divide-ink-100">
            {[...ws.tasks, ...ws.reports]
              .filter((x) => x.owner_id === ws.currentUserId || x.author_id === ws.currentUserId)
              .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
              .slice(0, 6)
              .map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <span className="truncate text-sm text-ink-800">{item.title}</span>
                  <span className="shrink-0 text-xs text-ink-400">
                    {relativeTime(item.updated_at || item.created_at)}
                  </span>
                </li>
              ))}
            {![...ws.tasks, ...ws.reports].some(
              (x) => x.owner_id === ws.currentUserId || x.author_id === ws.currentUserId
            ) && (
              <li className="px-5 py-8 text-center text-sm text-ink-500">No activity yet</li>
            )}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
