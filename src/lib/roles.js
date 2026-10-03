/**
 * Role catalog for FounderOS.
 *
 * A role describes a leadership seat in the company. Each role declares which
 * functional workspaces it may reach, which permissions it holds, and which
 * navigation entries are rendered for it. Frontend checks are a UX convenience
 * ONLY — Supabase Row Level Security enforces the same rules at the database.
 */

export const ROLES = {
  ceo_cfo: {
    key: "ceo_cfo",
    label: "CEO / CFO",
    short: "Executive",
    title: "Chief Executive & Financial Officer",
    description:
      "Company leadership, finance, strategy oversight, founder management, governance and approvals.",
    access: "EXECUTIVE / FULL COMPANY ACCESS",
    color: "indigo",
    workspaces: [
      "executive",
      "finance",
      "founders",
      "governance",
      "strategy",
      "risk",
      "approvals",
    ],
  },
  cso_cgo: {
    key: "cso_cgo",
    label: "CSO / CGO",
    short: "Strategy & Growth",
    title: "Chief Strategy & Growth Officer",
    description:
      "Corporate strategy, growth, partnerships, business development and expansion.",
    access: "STRATEGY / GROWTH / PARTNERSHIPS",
    color: "sky",
    workspaces: ["strategy", "growth", "partnerships"],
  },
  cmo_cso: {
    key: "cmo_cso",
    label: "CMO / CSO",
    short: "Marketing",
    title: "Chief Marketing & Strategy Officer",
    description:
      "Marketing, brand, communication, campaigns, customer acquisition and strategy contribution.",
    access: "MARKETING / BRAND / CAMPAIGNS / STRATEGY",
    color: "fuchsia",
    workspaces: ["marketing", "brand", "campaigns", "strategy"],
  },
  cpo_cto: {
    key: "cpo_cto",
    label: "CPO / CTO",
    short: "Product & Technology",
    title: "Chief Product & Technology Officer",
    description:
      "Product, technology, engineering, product roadmap and technical architecture.",
    access: "PRODUCT / TECHNOLOGY / ROADMAP / ENGINEERING",
    color: "emerald",
    workspaces: ["product", "technology", "roadmap", "engineering"],
  },
  clo_coo: {
    key: "clo_coo",
    label: "CLO / COO",
    short: "Legal & Operations",
    title: "Chief Legal & Operating Officer",
    description:
      "Legal, compliance, operations, internal processes and documentation.",
    access: "LEGAL / COMPLIANCE / OPERATIONS / PROCESSES",
    color: "amber",
    workspaces: ["operations", "legal", "compliance", "processes"],
  },
  cno: {
    key: "cno",
    label: "CNO",
    short: "Networking",
    title: "Chief Networking Officer",
    description:
      "Networking, external relationships, community and strategic connections.",
    access: "NETWORKING / RELATIONSHIPS / PARTNERSHIPS",
    color: "rose",
    workspaces: ["network", "relationships", "partnerships"],
  },
};

export const ROLE_KEYS = Object.keys(ROLES);

/** Human friendly fallback when a profile has an unknown/absent role. */
export const UNASSIGNED_ROLE = {
  key: "unassigned",
  label: "Unassigned",
  short: "Unassigned",
  title: "No role assigned",
  description: "Your account has no leadership role assigned yet.",
  access: "COMPANY SHARED INFORMATION ONLY",
  color: "ink",
  workspaces: [],
};

export function getRole(roleKey) {
  return ROLES[roleKey] || UNASSIGNED_ROLE;
}

export const COLOR_CLASSES = {
  indigo: "bg-brand-50 text-brand-700 ring-brand-200",
  sky: "bg-sky-50 text-sky-700 ring-sky-200",
  fuchsia: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
  ink: "bg-ink-100 text-ink-700 ring-ink-200",
};
