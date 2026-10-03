import { useState } from "react";
import { Scale, FileText, ShieldCheck, ListChecks } from "lucide-react";
import { useWorkspace } from "../../hooks/useWorkspace";
import { usePermissions } from "../../hooks/usePermissions";
import { useApp } from "../../hooks/useAuth";
import { RecordWorkspace } from "../../components/common/RecordWorkspace";
import { DataTable, SectionCard, StatTile, StatusBadge, Button } from "../../components/common";
import { DECISION_STATUS, formatDate } from "../../lib/utils";
import { db } from "../../lib/dataApi";

export default function GovernancePage() {
  const ws = useWorkspace();
  const { can } = usePermissions();
  const { profile } = useApp();
  const [local, setLocal] = useState(null);

  const decisions = local ?? ws.decisions;

  const decisionColumns = [
    { key: "title", header: "Decision", sortable: true, render: (d) => <span className="font-medium text-ink-900">{d.title}</span> },
    { key: "category", header: "Category", render: (d) => <span className="capitalize text-ink-600">{d.category || "—"}</span> },
    { key: "requested_by", header: "Requested by", render: (d) => ws.nameOf(d.requested_by) },
    { key: "decision_owner", header: "Decision owner", render: (d) => ws.nameOf(d.decision_owner) },
    { key: "status", header: "Status", sortable: true, render: (d) => <StatusBadge map={DECISION_STATUS} value={d.status} /> },
    { key: "due_date", header: "Due", sortable: true, render: (d) => <span className="tabular-nums">{formatDate(d.due_date)}</span> },
  ];

  const fields = [
    { name: "title", label: "Decision title", required: true, placeholder: "e.g. Approve Q3 marketing budget increase" },
    { name: "description", label: "Context", type: "textarea" },
    { name: "category", label: "Category", type: "select", options: ["finance", "strategy", "product", "marketing", "legal", "compliance", "technology", "partnerships", "operations"].map((v) => ({ value: v, label: v })) },
    { name: "requested_by", label: "Requested by", type: "select", required: true, options: ws.profiles.map((p) => ({ value: p.id, label: p.full_name })) },
    { name: "decision_owner", label: "Decision owner", type: "select", options: ws.profiles.map((p) => ({ value: p.id, label: p.full_name })) },
    { name: "status", label: "Status", type: "select", options: Object.entries(DECISION_STATUS).map(([value, m]) => ({ value, label: m.label })), default: "draft" },
    { name: "due_date", label: "Due date", type: "date" },
  ];

  const policyColumns = [
    { key: "title", header: "Policy", render: (p) => <span className="font-medium text-ink-900">{p.title}</span> },
    { key: "category", header: "Category", render: (p) => <span className="capitalize text-ink-600">{p.category}</span> },
    { key: "version", header: "Version" },
    { key: "status", header: "Status", render: (p) => <StatusBadge map={POLICY_STATUS} value={p.status} /> },
  ];

  const auditColumns = [
    { key: "created_at", header: "When", sortable: true, render: (a) => <span className="tabular-nums">{formatDate(a.created_at)}</span> },
    { key: "actor_id", header: "Actor", render: (a) => ws.nameOf(a.actor_id) },
    { key: "action", header: "Action", render: (a) => <span className="font-mono text-xs text-ink-700">{a.action}</span> },
    { key: "table_name", header: "Entity" },
    { key: "record_id", header: "Record", render: (a) => <span className="font-mono text-xs text-ink-500">{a.record_id || "—"}</span> },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-5 sm:py-6">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Decisions" value={decisions.length} icon={Scale} tone="brand" />
          <StatTile label="Pending" value={decisions.filter((d) => ["pending", "draft"].includes(d.status)).length} icon={ListChecks} tone="amber" />
          <StatTile label="Approved" value={decisions.filter((d) => ["approved", "implemented"].includes(d.status)).length} icon={ShieldCheck} tone="emerald" />
          <StatTile label="Policies" value={ws.policies.length} icon={FileText} tone="sky" />
        </div>

        <RecordWorkspace
          eyebrow="CEO / CFO"
          title="Governance"
          subtitle="Decision register, policies, audit trail and meeting records."
          table="decisions"
          rows={decisions}
          columns={decisionColumns}
          fields={fields}
          searchKeys={["title", "category", "status"]}
          canCreate={can("governance.manage")}
          addLabel="Log decision"
          emptyTitle="No decisions yet"
          emptyMessage="Recorded decisions will appear in this register."
        />

        <div className="grid gap-5 lg:grid-cols-2">
          <SectionCard title="Policy register" bodyClassName="p-0" dense>
            {ws.policies.length ? (
              <DataTable columns={policyColumns} rows={ws.policies} emptyTitle="No policies yet" />
            ) : (
              <p className="px-4 py-8 text-center text-sm text-ink-500">No data available yet</p>
            )}
          </SectionCard>

          <SectionCard title="Audit log" subtitle="Important actions across the company" bodyClassName="p-0" dense>
            {ws.audit_logs.length ? (
              <DataTable columns={auditColumns} rows={ws.audit_logs} searchKeys={["action", "table_name"]} emptyTitle="No audit entries" />
            ) : (
              <p className="px-4 py-8 text-center text-sm text-ink-500">No data available yet</p>
            )}
          </SectionCard>
        </div>

        {can("governance.manage") && decisions.some((d) => d.status === "pending") && (
          <SectionCard title="Quick approve" subtitle="Pending decisions requiring action">
            <ul className="divide-y divide-ink-100">
              {decisions.filter((d) => d.status === "pending").map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-900">{d.title}</p>
                    <p className="text-xs text-ink-500">{d.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={async () => {
                        await db.update("decisions", d.id, { status: "rejected", decision: "Rejected by CEO/CFO" });
                        setLocal((prev) => (prev ?? ws.decisions).map((x) => (x.id === d.id ? { ...x, status: "rejected" } : x)));
                        await db.audit(profile?.id, "decision.reject", "decisions", d.id, {});
                      }}
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={async () => {
                        await db.update("decisions", d.id, { status: "approved", decision: "Approved by CEO/CFO", decision_date: new Date().toISOString() });
                        setLocal((prev) => (prev ?? ws.decisions).map((x) => (x.id === d.id ? { ...x, status: "approved" } : x)));
                        await db.audit(profile?.id, "decision.approve", "decisions", d.id, {});
                      }}
                    >
                      Approve
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>
        )}
      </div>
    </div>
  );
}

const POLICY_STATUS = {
  draft: { label: "Draft", tone: "ink" },
  review: { label: "Pending Review", tone: "amber" },
  approved: { label: "Approved", tone: "emerald" },
  archived: { label: "Archived", tone: "ink" },
};
