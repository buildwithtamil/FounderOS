import { ShieldAlert, AlertTriangle, Eye, CheckCircle2 } from "lucide-react";
import { useWorkspace } from "../../hooks/useWorkspace";
import { usePermissions } from "../../hooks/usePermissions";
import { RecordWorkspace } from "../../components/common/RecordWorkspace";
import { StatTile, StatusBadge } from "../../components/common";

const RISK_STATUS = {
  open: { label: "Open", tone: "rose" },
  mitigating: { label: "Mitigating", tone: "amber" },
  monitoring: { label: "Monitoring", tone: "sky" },
  closed: { label: "Closed", tone: "emerald" },
};

const SEVERITY = {
  low: { label: "Low", tone: "ink" },
  medium: { label: "Medium", tone: "sky" },
  high: { label: "High", tone: "amber" },
  critical: { label: "Critical", tone: "rose" },
};

export default function RiskPage() {
  const ws = useWorkspace();
  const { can } = usePermissions();

  const columns = [
    { key: "title", header: "Risk", sortable: true, render: (r) => <span className="font-medium text-ink-900">{r.title}</span> },
    { key: "category", header: "Category", render: (r) => <span className="capitalize text-ink-600">{r.category}</span> },
    { key: "severity", header: "Severity", sortable: true, render: (r) => <StatusBadge map={SEVERITY} value={r.severity} /> },
    { key: "status", header: "Status", sortable: true, render: (r) => <StatusBadge map={RISK_STATUS} value={r.status} /> },
    { key: "owner_id", header: "Owner", render: (r) => ws.nameOf(r.owner_id) },
  ];

  const fields = [
    { name: "title", label: "Risk", required: true, placeholder: "e.g. Cash runway below 9 months" },
    { name: "category", label: "Category", type: "select", options: ["financial", "operational", "commercial", "compliance", "technology", "people", "reputational"].map((v) => ({ value: v, label: v })) },
    { name: "severity", label: "Severity", type: "select", options: Object.keys(SEVERITY).map((v) => ({ value: v, label: v })), default: "medium" },
    { name: "status", label: "Status", type: "select", options: Object.keys(RISK_STATUS).map((v) => ({ value: v, label: RISK_STATUS[v].label })), default: "open" },
    { name: "owner_id", label: "Owner", type: "select", options: ws.profiles.map((p) => ({ value: p.id, label: p.full_name })) },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-5 sm:py-6">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Total risks" value={ws.risks.length} icon={ShieldAlert} tone="brand" />
          <StatTile label="High / critical" value={ws.risks.filter((r) => ["high", "critical"].includes(r.severity)).length} icon={AlertTriangle} tone="rose" />
          <StatTile label="Mitigating" value={ws.risks.filter((r) => r.status === "mitigating").length} icon={Eye} tone="amber" />
          <StatTile label="Closed / monitoring" value={ws.risks.filter((r) => ["closed", "monitoring"].includes(r.status)).length} icon={CheckCircle2} tone="emerald" />
        </div>

        <RecordWorkspace
          eyebrow="CEO / CFO"
          title="Risk Register"
          subtitle="Company risks, severities, owners and mitigation status."
          table="risk_register"
          rows={ws.risks}
          columns={columns}
          fields={fields}
          searchKeys={["title", "category", "severity", "status"]}
          canCreate={can("risk.manage")}
          addLabel="Log risk"
          emptyTitle="No risks logged yet"
          emptyMessage="Risks you register will appear here."
        />
      </div>
    </div>
  );
}
