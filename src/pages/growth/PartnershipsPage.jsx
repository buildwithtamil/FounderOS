import { Handshake, Users, TrendingUp } from "lucide-react";
import { useWorkspace } from "../../hooks/useWorkspace";
import { usePermissions } from "../../hooks/usePermissions";
import { RecordWorkspace } from "../../components/common/RecordWorkspace";
import { StatTile, SectionCard, ProgressBar, StatusBadge, EmptyState } from "../../components/common";

const STATUS = {
  exploring: { label: "Exploring", tone: "ink" },
  in_progress: { label: "In Progress", tone: "brand" },
  signed: { label: "Signed", tone: "emerald" },
  paused: { label: "Paused", tone: "amber" },
  ended: { label: "Ended", tone: "ink" },
};

export default function PartnershipsPage() {
  const ws = useWorkspace();
  const { can } = usePermissions();

  const columns = [
    { key: "name", header: "Partner", sortable: true, render: (p) => <span className="font-medium text-ink-900">{p.name}</span> },
    { key: "partnership_type", header: "Type", render: (p) => <span className="capitalize text-ink-600">{p.partnership_type || "—"}</span> },
    { key: "owner_id", header: "Owner", render: (p) => ws.nameOf(p.owner_id) },
    { key: "progress", header: "Progress", sortable: true, render: (p) => <ProgressBar value={p.progress} showLabel className="min-w-[120px]" /> },
    { key: "status", header: "Status", render: (p) => <StatusBadge map={STATUS} value={p.status} /> },
  ];

  const fields = [
    { name: "name", label: "Partner name", required: true },
    { name: "partnership_type", label: "Type", type: "select", options: ["MOU", "reseller", "referral", "integration", "co-marketing"].map((v) => ({ value: v, label: v })) },
    { name: "owner_id", label: "Owner", type: "select", options: ws.profiles.map((p) => ({ value: p.id, label: p.full_name })) },
    { name: "progress", label: "Progress %", type: "number", default: 0 },
    { name: "status", label: "Status", type: "select", options: Object.keys(STATUS).map((v) => ({ value: v, label: STATUS[v].label })), default: "exploring" },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-5 sm:py-6">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatTile label="Partnerships" value={ws.partnerships.length} icon={Handshake} tone="brand" />
          <StatTile label="In progress" value={ws.partnerships.filter((p) => p.status === "in_progress").length} icon={TrendingUp} tone="sky" />
          <StatTile label="Signed" value={ws.partnerships.filter((p) => p.status === "signed").length} icon={Users} tone="emerald" />
        </div>

        <RecordWorkspace
          eyebrow="Strategic relationships"
          title="Partnerships"
          subtitle="MOU, reseller, referral and integration partnerships with owners and progress."
          table="partnerships"
          rows={ws.partnerships}
          columns={columns}
          fields={fields}
          searchKeys={["name", "partnership_type", "status"]}
          canCreate={can("partnerships.manage")}
          addLabel="New partnership"
          emptyTitle="No partnerships yet"
          emptyMessage="Partnership opportunities will appear here."
        >
          {ws.partnerships.length > 0 && (
            <SectionCard title="Partnership pipeline">
              <div className="space-y-4">
                {ws.partnerships.map((p) => (
                  <div key={p.id} className="rounded-xl border border-ink-100 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-ink-900">{p.name}</p>
                      <StatusBadge map={STATUS} value={p.status} />
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <ProgressBar value={p.progress} tone="brand" className="flex-1" />
                      <span className="text-sm font-semibold tabular-nums text-ink-600">{p.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
          {!ws.partnerships.length && <EmptyState title="No data available yet" />}
        </RecordWorkspace>
      </div>
    </div>
  );
}
