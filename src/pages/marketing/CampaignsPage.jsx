import { useWorkspace } from "../../hooks/useWorkspace";
import { usePermissions } from "../../hooks/usePermissions";
import { RecordWorkspace } from "../../components/common/RecordWorkspace";
import { StatTile, ProgressBar, StatusBadge, SectionCard, EmptyState } from "../../components/common";
import { formatCurrency, percent } from "../../lib/utils";
import { Megaphone, Target, DollarSign } from "lucide-react";

const STATUS = {
  planning: { label: "Planning", tone: "ink" },
  in_progress: { label: "In Progress", tone: "brand" },
  paused: { label: "Paused", tone: "amber" },
  completed: { label: "Completed", tone: "emerald" },
};

export default function CampaignsPage() {
  const ws = useWorkspace();
  const { can } = usePermissions();

  const columns = [
    { key: "name", header: "Campaign", sortable: true, render: (c) => <span className="font-medium text-ink-900">{c.name}</span> },
    { key: "channel", header: "Channel", render: (c) => <span className="capitalize text-ink-600">{c.channel}</span> },
    { key: "status", header: "Status", render: (c) => <StatusBadge map={STATUS} value={c.status} /> },
    { key: "progress", header: "Progress", sortable: true, render: (c) => <ProgressBar value={c.progress} showLabel className="min-w-[120px]" /> },
    { key: "budget", header: "Budget", sortable: true, render: (c) => <span className="tabular-nums">{formatCurrency(c.budget)}</span> },
  ];

  const fields = [
    { name: "name", label: "Campaign name", required: true },
    { name: "channel", label: "Channel", type: "select", options: ["brand", "email", "abm", "paid", "social", "content", "events"].map((v) => ({ value: v, label: v })) },
    { name: "owner_id", label: "Owner", type: "select", options: ws.profiles.map((p) => ({ value: p.id, label: p.full_name })) },
    { name: "progress", label: "Progress %", type: "number", default: 0 },
    { name: "budget", label: "Budget", type: "number" },
    { name: "status", label: "Status", type: "select", options: Object.keys(STATUS).map((v) => ({ value: v, label: STATUS[v].label })), default: "planning" },
  ];

  const totalBudget = ws.campaigns.reduce((s, c) => s + (Number(c.budget) || 0), 0);

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-5 sm:py-6">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatTile label="Campaigns" value={ws.campaigns.length} icon={Megaphone} tone="brand" />
          <StatTile label="Active" value={ws.campaigns.filter((c) => c.status === "in_progress").length} icon={Target} tone="sky" />
          <StatTile label="Total budget" value={formatCurrency(totalBudget)} icon={DollarSign} tone="emerald" />
        </div>

        <RecordWorkspace
          eyebrow="CMO / CSO"
          title="Campaigns"
          subtitle="Brand, email, ABM and paid acquisition campaigns with progress and budget."
          table="campaigns"
          rows={ws.campaigns}
          columns={columns}
          fields={fields}
          searchKeys={["name", "channel", "status"]}
          canCreate={can("marketing.manage")}
          addLabel="New campaign"
          emptyTitle="No campaigns yet"
          emptyMessage="Campaigns you create will appear here."
        >
          {ws.campaigns.length > 0 && (
            <SectionCard title="Campaign progress">
              <div className="space-y-4">
                {ws.campaigns.map((c) => (
                  <div key={c.id} className="rounded-xl border border-ink-100 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-ink-900">{c.name}</p>
                      <span className="text-xs capitalize text-ink-500">{c.channel}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <ProgressBar value={c.progress} tone="brand" className="flex-1" />
                      <span className="text-sm font-semibold tabular-nums text-ink-600">{percent(c.progress, 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
          {!ws.campaigns.length && <EmptyState title="No data available yet" />}
        </RecordWorkspace>
      </div>
    </div>
  );
}
