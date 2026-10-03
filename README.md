# FounderOS

**One Company. One Operating System. Every Role. One Source of Truth.**

FounderOS is a role-based company operating system for a startup/company with six
founder/leadership seats. It combines an executive command center, a founder
operating system, a strategy/KPI management system and a governance platform into
one secure, responsive application backed by Supabase Auth and Row Level Security.

It is a real working application — not a mockup. Authenticated leaders see only the
functions their role is entitled to, and the database enforces the same rules.

---

## 1. Project overview

| | |
|---|---|
| Product | FounderOS — internal company operating system |
| Frontend | React 18 + Vite + Tailwind CSS + React Router + Recharts + Lucide |
| Backend | Supabase (Postgres, Auth, Storage, Row Level Security) |
| Auth | Email/password with session persistence and refresh |
| Data | Supabase only — no mock data. Less-critical data can be exchanged via Excel |
| Access model | Three layers — Personal, Functional, Company |
| Deployment | Any static host (Vercel/Netlify) or the bundled single-file build |

> **No mock data.** FounderOS runs against your own Supabase project. If Supabase
> is not configured, the app shows a *Configuration required* screen and never
> fabricates business data.

### The six leadership seats

| Seat | Name | Role key | Access |
|---|---|---|---|
| CEO / CFO | Tamilselvan S | `ceo_cfo` | Executive / full company access |
| CSO / CGO | Ramana V | `cso_cgo` | Strategy, Growth, Partnerships |
| CMO / CSO | Sanmathi S | `cmo_cso` | Marketing, Brand, Campaigns, Strategy |
| CPO / CTO | Thangaraj T | `cpo_cto` | Product, Technology, Roadmap, Engineering |
| CLO / COO | Gokul Priya S | `clo_coo` | Legal, Compliance, Operations, Processes |
| CNO | Silambarasan C | `cno` | Networking, Relationships, Partnerships |

> Full names, emails and roles are stored in Supabase and managed from the
> executive seat. The table above is the intended default mapping.

---

## 2. Features

- **Authentication** — email/password, session persistence, refresh, logout, protected routes, unauthorized page.
- **Role-based authorization** — centralized role + permission system used by the UI, and mirrored by RLS in the database.
- **Role-specific dashboards** — the dashboard content, KPIs, navigation and quick actions adapt to the signed-in role.
- **Executive Command Center** — a dedicated CEO/CFO dashboard organised into Today / Company / Money / Execution / Governance.
- **Tasks** — create, assign, prioritise, set due dates/function, statuses, overdue detection, search, sort, export.
- **KPIs** — targets, current values, units, periods, visual progress and health.
- **Strategy** — company objectives with owners, priorities, progress and deadlines.
- **Finance** — budgets vs actuals, expenses, burn, expense submission and approval, restricted to the executive seat.
- **Governance** — decision register, approval queue, policy register, risk register, meeting records and audit log.
- **Reports** — standardised founder reporting (period, priorities, KPI progress, problems, risks, decisions required).
- **Meetings** — founder/strategy/product/marketing/operations/finance/governance meetings with agendas, notes and action items.
- **Notifications** — task, KPI, decision, expense, report and meeting alerts with an unread count in the header.
- **Audit log** — important actions (login, approvals, task/expense/KPI/report changes) are recorded; readable by the executive seat.
- **Responsive** — desktop rail + header, mobile drawer navigation and bottom tab bar, tables that become cards on small screens.
- **Founder images** — an allocated image slot on every dashboard hero; images upload to a Supabase Storage `avatars` bucket and appear across the app.
- **Excel bridge** — less-critical collections (tasks, KPIs, objectives, meetings, reports, campaigns, partnerships, risks, policies) can be exported to `.xlsx` and re-imported. Important records stay in Supabase.
- **Security** — only the anon key reaches the browser; service-role key is never exposed; RLS on every table.

---

## 3. Tech stack

- React 18 + Vite 5
- Tailwind CSS 3
- React Router 6
- Supabase JS v2 (`@supabase/supabase-js`)
- Recharts (charts), Lucide React (icons)

---

## 4. Folder structure

```
FounderOS/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
├── .eslintrc.cjs
├── README.md
├── scripts/
│   └── inline-build.mjs        # bundles dist/ into a single self-contained html
├── public/
│   └── favicon.svg
├── supabase/
│   └── schema.sql              # full DB schema, RLS, functions, triggers
└── src/
    ├── main.jsx
    ├── App.jsx                 # routes + route guards
    ├── index.css
    ├── lib/
    │   ├── supabase.js         # anon client + configuration flag
    │   ├── roles.js            # role catalog
    │   ├── permissions.js      # permission matrix + helpers
    │   ├── navigation.js       # sidebar/route nav model per role
    │   ├── utils.js            # formatting, status maps, helpers
    │   ├── dataApi.js          # Supabase-only data access layer
    │   ├── excel.js            # lazy-loaded Excel import/export
    │   └── company.js          # company identity copy (name, mission, values)
    ├── hooks/
    │   ├── useAuth.jsx         # auth/session/profile/workspace context
    │   ├── useProfile.js       # current profile helpers
    │   ├── usePermissions.js   # bound can()/canAny()
    │   ├── useWorkspace.js     # derived company snapshot
    │   └── useRouteFocus.js
    ├── components/
    │   ├── layout/             # AppShell, Sidebar, Header, MobileNav, RouteGuards, PageContainer
    │   ├── common/             # Badge, Avatar, Button, Form, Modal, DataTable,
    │   │                       #   ProgressBar, Spinner, States, Surfaces, RecordWorkspace
    │   ├── dashboard/          # MetricCard, KPIWidget, TaskWidget, AlertWidget, ActivityFeed, ProfileHero
    │   └── tables/             # reusable column builders
    └── pages/
        ├── auth/ dashboard/ tasks/ kpis/ strategy/ finance/ founders/
        ├── governance/ reports/ meetings/ notifications/ company/ profile/
        ├── growth/ marketing/ product/ operations/ network/ shared/
        ├── NotFoundPage.jsx  UnauthorizedPage.jsx
```

---

## 5. Supabase setup

1. Create a project at <https://supabase.com>.
2. Open **Project Settings → API** and copy:
   - Project URL → `VITE_SUPABASE_URL`
   - `anon` public key → `VITE_SUPABASE_ANON_KEY`
3. Never copy the `service_role` key into the frontend.

---

## 6. Database setup

1. Open the Supabase **SQL Editor**.
2. Paste the entire contents of `supabase/schema.sql`.
3. Run it.

This creates all tables, indexes, enums, `updated_at` triggers, the
`get_my_role()` / `is_executive()` helper functions, the role-escalation guard,
the signup profile trigger, the public `avatars` Storage bucket with policies,
and all Row Level Security policies.

---

## 7. Authentication setup

- Sign-in uses `supabase.auth.signInWithPassword`.
- Sessions persist and auto-refresh (`persistSession`, `autoRefreshToken`).
- A database trigger (`handle_new_user`) creates a `profiles` row whenever a user
  is created, copying `full_name` from user metadata when present.
- Route protection is handled by `RequireAuth` and `RequirePermission`.

---

## 8. Role configuration

Roles are defined in `src/lib/roles.js` and permissions in
`src/lib/permissions.js`. The UI uses these to render navigation and guard
routes. The database independently enforces the same access through RLS —
hiding a nav item is never the security boundary.

Role keys: `ceo_cfo`, `cso_cgo`, `cmo_cso`, `cpo_cto`, `clo_coo`, `cno`.

---

## 9. Environment variables

Create `.env` (not committed):

```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

`.env.example` contains the same keys with empty values. Only these two
variables are read by the app. **No secrets are hardcoded.**

---

## 10. Local development

```bash
npm install
cp .env.example .env      # fill in your Supabase values
npm run dev               # http://localhost:5173
```

When Supabase is **not** configured the app shows a **Configuration required**
screen with setup steps. There is no demo data — every record is real and stored
in your Supabase project, protected by Row Level Security.

---

## 11. Production build

```bash
npm run build             # outputs dist/
npm run preview           # serve the production build locally
```

### Single-file build (for single-HTML hosts)

```bash
npm run build
node scripts/inline-build.mjs dist outputs/founderos.html
```

This inlines the JS/CSS into one self-contained HTML file.

---

## 12. Vercel deployment

1. Push the repository to GitHub.
2. In Vercel, **New Project → Import** the repository.
3. Framework preset: **Vite**. Build command `npm run build`, output `dist`.
4. Add environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
   under **Settings → Environment Variables**.
5. Add a rewrite so client routes resolve (create `vercel.json`):

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

For Netlify add the equivalent `_redirects` file containing `/* /index.html 200`.

---

## 13. RLS / security

- RLS is enabled on **every** table.
- `get_my_role()` and `is_executive()` are `SECURITY DEFINER` so policies can
  read `profiles` without recursive RLS.
- **Finance**: only the CEO/CFO seat reads budgets and unrestricted expenses.
  Other seats read only their own submissions and may insert their own.
- **Governance/audit**: only the executive seat reads the audit trail; anyone may
  append their own audit entries.
- **Role escalation**: a trigger blocks non-executives from changing their role.
- The frontend uses **only** the anon key.

---

## 13a. Data strategy — Supabase vs Excel

| Data | Where it lives |
|---|---|
| Tasks, KPIs, strategic objectives, decisions, budgets, expenses, reports | **Supabase** (important, transactional, RLS-protected) |
| Meetings, campaigns, partnerships, risks, policies | **Supabase**, with optional Excel export/import |
| Bulk or archival reshuffles of less-critical collections | **Excel** (`.xlsx`) via the Import / Excel buttons on each workspace |

Every export sheet maps 1:1 to a table row; owner/author relations are written as
email addresses and resolved back to ids on import.

Use it: open any workspace, click **Excel** to download the current rows, or
**Import** to upload a workbook. Templated headers are produced by the export.

---

## 13b. Founder images

- Each founder uploads their own image from **Profile → camera button**, or from
  the camera button on their dashboard hero.
- Images are stored in the Supabase Storage `avatars` bucket at
  `avatars/<user-id>/avatar.<ext>` and are public-read.
- Storage policies let a user write only inside their own `<user-id>` folder.
- The image appears on the dashboard hero, the header, and the founder directory.

---

## 14. How to create founders

1. In Supabase, **Authentication → Users → Add user**. Create each account with
   an email and password (use **Invite** or reset flows to set real passwords —
   never hardcode credentials).
2. Each user receives a `profiles` row automatically and can sign in
   immediately. Until a role is assigned, they see only Company shared
   information.
3. Set each user's full name in **User Metadata** (`full_name`) or later in the
   app's Profile page.

---

## 15. How to assign roles

Run the role assignments in the Supabase SQL Editor (bottom of `schema.sql`),
replacing the emails with the real ones:

```sql
update public.profiles set full_name = 'Tamilselvan S',  role = 'ceo_cfo', department = 'Executive / Finance'       where email = 'tamilselvan@company.example';
update public.profiles set full_name = 'Ramana V',       role = 'cso_cgo', department = 'Strategy / Growth'          where email = 'ramana@company.example';
update public.profiles set full_name = 'Sanmathi S',     role = 'cmo_cso', department = 'Marketing / Brand'          where email = 'sanmathi@company.example';
update public.profiles set full_name = 'Thangaraj T',    role = 'cpo_cto', department = 'Product / Technology'       where email = 'thangaraj@company.example';
update public.profiles set full_name = 'Gokul Priya S',  role = 'clo_coo', department = 'Legal / Operations'         where email = 'gokulpriya@company.example';
update public.profiles set full_name = 'Silambarasan C', role = 'cno',     department = 'Networking / Relationships' where email = 'silambarasan@company.example';
```

Only the CEO/CFO seat can change roles through the application itself; the SQL
editor runs with elevated privileges.

---

## 16. Troubleshooting

| Symptom | Fix |
|---|---|
| "Configuration required" badge | `.env` is missing `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`; restart `npm run dev` after editing `.env`. |
| Login fails with "Invalid login credentials" | The user does not exist or the password is wrong — create/reset in Supabase Auth. |
| Signed in but everything says "No data available yet" | Correct — no fabricated data. Create real records; they appear immediately. |
| Access denied on a page you expect | Your role lacks the permission; check `src/lib/permissions.js` and the corresponding RLS policy. |
| "new row violates row-level security policy" | The write is not permitted for your role at the DB level; verify the policy and that your profile has the right role. |
| Blank page after deploying to a static host | Add the SPA rewrite/redirect (`vercel.json` or `_redirects`) so deep links resolve to `index.html`. |
| Role change rejected | Only the CEO/CFO seat may change roles — the `guard_role_change` trigger enforced it. |

---

Built with security first: **the database is the source of truth for access, not the UI.**
