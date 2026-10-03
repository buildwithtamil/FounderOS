import {
  LayoutDashboard,
  ListChecks,
  Target,
  Compass,
  FileText,
  CalendarDays,
  Bell,
  Building2,
  User,
  Crown,
  Wallet,
  Users,
  Scale,
  ShieldAlert,
  CheckSquare,
  TrendingUp,
  Handshake,
  Megaphone,
  Sparkles,
  Boxes,
  Cpu,
  Map,
  Code2,
  Settings,
  Briefcase,
  Gavel,
  Network,
  UserPlus,
} from "lucide-react";

/**
 * Navigation model.
 *
 * `common` is visible to every authenticated leadership user. `byRole` entries
 * are merged in for the signed-in role. Hiding an item is a UX affordance only;
 * the route guard + Supabase RLS enforce real access.
 */
export const COMMON_NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/my-work", label: "My Work", icon: ListChecks },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/kpis", label: "KPIs", icon: Target },
  { to: "/strategy", label: "Strategy", icon: Compass },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/meetings", label: "Meetings", icon: CalendarDays },
  { to: "/notifications", label: "Notifications", icon: Bell, badge: "unread" },
  { to: "/company", label: "Company", icon: Building2 },
  { to: "/profile", label: "Profile", icon: User },
];

export const ROLE_NAV = {
  ceo_cfo: [
    { to: "/executive", label: "Executive", icon: Crown },
    { to: "/finance", label: "Finance", icon: Wallet },
    { to: "/founders", label: "Founders", icon: Users },
    { to: "/governance", label: "Governance", icon: Scale },
    { to: "/approvals", label: "Approvals", icon: CheckSquare },
    { to: "/risk", label: "Risk", icon: ShieldAlert },
  ],
  cso_cgo: [
    { to: "/growth", label: "Growth", icon: TrendingUp },
    { to: "/partnerships", label: "Partnerships", icon: Handshake },
  ],
  cmo_cso: [
    { to: "/marketing", label: "Marketing", icon: Megaphone },
    { to: "/brand", label: "Brand", icon: Sparkles },
    { to: "/campaigns", label: "Campaigns", icon: Megaphone },
  ],
  cpo_cto: [
    { to: "/product", label: "Product", icon: Boxes },
    { to: "/technology", label: "Technology", icon: Cpu },
    { to: "/roadmap", label: "Roadmap", icon: Map },
    { to: "/engineering", label: "Engineering", icon: Code2 },
  ],
  clo_coo: [
    { to: "/operations", label: "Operations", icon: Settings },
    { to: "/legal", label: "Legal", icon: Gavel },
    { to: "/compliance", label: "Compliance", icon: ShieldAlert },
    { to: "/processes", label: "Processes", icon: Briefcase },
  ],
  cno: [
    { to: "/network", label: "Network", icon: Network },
    { to: "/relationships", label: "Relationships", icon: UserPlus },
    { to: "/partnerships", label: "Partnerships", icon: Handshake },
  ],
};

export function buildNav(roleKey) {
  const roleItems = ROLE_NAV[roleKey] || [];
  return { common: COMMON_NAV, role: roleItems };
}
