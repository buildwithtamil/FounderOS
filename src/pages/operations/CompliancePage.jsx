import { ShieldAlert } from "lucide-react";
import { useWorkspace } from "../../hooks/useWorkspace";
import { FunctionalPage } from "../shared/FunctionalPage";
import { SectionCard, StatusBadge } from "../../components/common";

const POLICY_STATUS = {
  draft: { label: "Draft", tone: "ink" },
  review: { label: "Pending Review", tone: "amber" },
  approved: { label: "Approved", tone: "emerald" },
  archived: { label: "Archived", tone: "ink" },
};

export default function CompliancePage() {
  const ws = useWorkspace();
  return (
    <FunctionalPage
      eyebrow="CLO / COO"
      title="Compliance"
      subtitle="Compliance work, policies and evidence collection."
      icon={ShieldAlert}
      areas={["compliance", "legal"]}
      entity="compliance task"
      extra={
        <SectionCard title="Policy register">
          {ws.policies.length ? (
            <ul className="divide-y divide-ink-100">
              {ws.policies.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="text-sm text-ink-800">{p.title}</span>
                  <StatusBadge map={POLICY_STATUS} value={p.status} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-500">No data available yet</p>
          )}
        </SectionCard>
      }
    />
  );
}
