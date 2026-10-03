import { Map } from "lucide-react";
import { useWorkspace } from "../../hooks/useWorkspace";
import { PageTitle, SectionCard, StatusBadge, ProgressBar, EmptyState } from "../../components/common";
import { formatDate } from "../../lib/utils";

const RELEASE_STATUS = {
  planned: { label: "Planned", tone: "ink" },
  in_progress: { label: "In Progress", tone: "brand" },
  shipped: { label: "Shipped", tone: "emerald" },
  blocked: { label: "Blocked", tone: "rose" },
};

export default function RoadmapPage() {
  const ws = useWorkspace();
  const productTasks = ws.tasks.filter((t) => t.function_area === "product");
  const objectives = ws.objectives.filter((o) => o.title.toLowerCase().includes("product") || productTasks.some((t) => t.owner_id === o.owner_id));

  const milestones = ws.decisions.filter((d) => d.category === "product");

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-5 sm:py-6">
      <PageTitle
        eyebrow="CPO / CTO"
        title="Roadmap"
        subtitle="Product roadmap: releases, milestones and progress against objectives."
        actions={<Map size={18} className="text-ink-400" />}
      />

      <div className="mt-5 space-y-5">
        <SectionCard title="Product objectives">
          {objectives.length ? (
            <div className="space-y-4">
              {objectives.map((o) => (
                <div key={o.id} className="rounded-xl border border-ink-100 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink-900">{o.title}</p>
                    <StatusBadge map={RELEASE_STATUS} value={o.status === "completed" ? "shipped" : o.status === "at_risk" ? "blocked" : "in_progress"} />
                  </div>
                  <p className="mt-1 text-xs text-ink-500">
                    {ws.nameOf(o.owner_id)} · target {formatDate(o.target_date)}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <ProgressBar value={o.progress} tone={o.progress >= 70 ? "emerald" : "brand"} className="flex-1" />
                    <span className="text-sm font-semibold tabular-nums text-ink-600">{o.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No data available yet" message="Product roadmap objectives will appear here." />
          )}
        </SectionCard>

        {milestones.length > 0 && (
          <SectionCard title="Product decisions & milestones">
            <ul className="space-y-3">
              {milestones.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-ink-800">{d.title}</span>
                  <StatusBadge map={RELEASE_STATUS} value={d.status === "implemented" || d.status === "approved" ? "shipped" : "in_progress"} />
                </li>
              ))}
            </ul>
          </SectionCard>
        )}

        {!objectives.length && !milestones.length && <EmptyState title="No data available yet" />}
      </div>
    </div>
  );
}
