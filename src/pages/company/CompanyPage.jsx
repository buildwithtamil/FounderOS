import { Building2, Target, Eye, Compass, CalendarDays } from "lucide-react";
import { COMPANY } from "../../lib/company";
import { useWorkspace } from "../../hooks/useWorkspace";
import { PageTitle, SectionCard, Badge } from "../../components/common";
import { formatDate } from "../../lib/utils";

export default function CompanyPage() {
  const ws = useWorkspace();

  return (
    <div className="mx-auto w-full max-w-5xl px-3 py-5 sm:px-5 sm:py-6">
      <PageTitle
        eyebrow="Shared"
        title="Company"
        subtitle={COMPANY.tagline}
      />

      <div className="mt-5 space-y-5">
        <SectionCard>
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ink-950 text-white">
              <Building2 size={22} className="text-brand-400" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-ink-900">{COMPANY.name}</h2>
              <p className="mt-1 text-sm text-ink-600">{COMPANY.mission}</p>
            </div>
          </div>
        </SectionCard>

        <div className="grid gap-5 sm:grid-cols-2">
          <SectionCard title="Mission" actions={<Target size={16} className="text-ink-400" />}>
            <p className="text-sm leading-relaxed text-ink-700">{COMPANY.mission}</p>
          </SectionCard>
          <SectionCard title="Vision" actions={<Eye size={16} className="text-ink-400" />}>
            <p className="text-sm leading-relaxed text-ink-700">{COMPANY.vision}</p>
          </SectionCard>
        </div>

        <SectionCard title="Core values">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {COMPANY.values.map((v) => (
              <div key={v.title} className="rounded-xl border border-ink-100 p-4">
                <p className="text-sm font-semibold text-ink-900">{v.title}</p>
                <p className="mt-1 text-xs text-ink-500">{v.body}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Strategic objectives"
          subtitle="Approved company objectives"
          actions={<Compass size={16} className="text-ink-400" />}
        >
          {ws.objectives.length ? (
            <ul className="space-y-2">
              {ws.objectives.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 rounded-lg border border-ink-100 px-3 py-2.5">
                  <span className="text-sm text-ink-800">{o.title}</span>
                  <Badge tone="brand">{o.progress}%</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-500">No data available yet</p>
          )}
        </SectionCard>

        <div className="grid gap-5 sm:grid-cols-2">
          <SectionCard title="Announcements & approved decisions" actions={<Badge tone="ink">Shared</Badge>}>
            {ws.decisions.filter((d) => ["approved", "implemented"].includes(d.status)).length ? (
              <ul className="space-y-3">
                {ws.decisions
                  .filter((d) => ["approved", "implemented"].includes(d.status))
                  .map((d) => (
                    <li key={d.id} className="flex items-start gap-3">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      <div>
                        <p className="text-sm font-medium text-ink-800">{d.title}</p>
                        <p className="text-xs text-ink-500">{formatDate(d.decision_date)}</p>
                      </div>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-500">No data available yet</p>
            )}
          </SectionCard>

          <SectionCard title="Company milestones" actions={<CalendarDays size={16} className="text-ink-400" />}>
            {ws.meetings.length ? (
              <ul className="space-y-3">
                {ws.meetings.slice(0, 5).map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm text-ink-700">{m.title}</span>
                    <span className="shrink-0 text-xs tabular-nums text-ink-400">
                      {formatDate(m.meeting_date)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-500">No data available yet</p>
            )}
          </SectionCard>
        </div>

        <SectionCard title="Shared KPIs" subtitle="Company-wide performance">
          {ws.kpis.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ws.kpis.map((k) => (
                <div key={k.id} className="rounded-xl border border-ink-100 p-3">
                  <p className="truncate text-sm font-medium text-ink-800">{k.name}</p>
                  <p className="mt-1 text-lg font-semibold tabular-nums text-ink-900">
                    {k.current_value} <span className="text-xs font-normal text-ink-400">/ {k.target} {k.unit}</span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-500">No data available yet</p>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
