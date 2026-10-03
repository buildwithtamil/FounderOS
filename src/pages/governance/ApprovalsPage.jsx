import { useState } from "react";
import { CheckCircle2, XCircle, Clock, Wallet, FileText, Scale } from "lucide-react";
import { useWorkspace } from "../../hooks/useWorkspace";
import { useApp } from "../../hooks/useAuth";
import { PageTitle, SectionCard, Button, StatusBadge, EmptyState, Badge } from "../../components/common";
import { db } from "../../lib/dataApi";
import { formatCurrency, formatDate, DECISION_STATUS } from "../../lib/utils";

export default function ApprovalsPage() {
  const ws = useWorkspace();
  const { profile } = useApp();
  const [state, setState] = useState({ decisions: null, expenses: null, reports: null });

  const decisions = state.decisions ?? ws.decisions.filter((d) => d.status === "pending");
  const expenses = state.expenses ?? ws.expenses.filter((e) => e.status === "pending");
  const reports = state.reports ?? ws.reports.filter((r) => r.status === "submitted");

  const act = async (kind, id, status, extra = {}) => {
    if (kind === "expenses") await db.update("expenses", id, { status });
    if (kind === "decisions") await db.update("decisions", id, { status, ...extra });
    if (kind === "reports") await db.update("reports", id, { status });
    await db.audit(profile?.id, `${kind}.${status}`, kind, id, extra);
    if (kind === "decisions") setState((s) => ({ ...s, decisions: decisions.filter((d) => d.id !== id) }));
    if (kind === "expenses") setState((s) => ({ ...s, expenses: expenses.filter((e) => e.id !== id) }));
    if (kind === "reports") setState((s) => ({ ...s, reports: reports.filter((r) => r.id !== id) }));
  };

  const total = decisions.length + expenses.length + reports.length;

  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-5 sm:py-6">
      <PageTitle
        eyebrow="CEO / CFO"
        title="Approval Queue"
        subtitle={`${total} item${total === 1 ? "" : "s"} awaiting your decision.`}
      />

      <div className="mt-5 space-y-5">
        <SectionCard
          title="Decision approvals"
          subtitle="Strategic & governance decisions"
          actions={<Badge tone="amber">{decisions.length}</Badge>}
          bodyClassName="p-0"
          dense
        >
          {decisions.length ? (
            <ul className="divide-y divide-ink-100">
              {decisions.map((d) => (
                <li key={d.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                      <Scale size={16} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink-900">{d.title}</p>
                      <p className="mt-0.5 text-xs text-ink-500">
                        {d.category} · requested by {ws.nameOf(d.requested_by)} · due {formatDate(d.due_date)}
                      </p>
                      {d.description && <p className="mt-1 text-xs text-ink-500">{d.description}</p>}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="ghost" onClick={() => act("decisions", d.id, "rejected", { decision: "Rejected by CEO/CFO" })}>
                      <XCircle size={15} /> Reject
                    </Button>
                    <Button onClick={() => act("decisions", d.id, "approved", { decision: "Approved by CEO/CFO", decision_date: new Date().toISOString() })}>
                      <CheckCircle2 size={15} /> Approve
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No pending decisions" message="Nothing awaits your decision here." />
          )}
        </SectionCard>

        <SectionCard
          title="Expense approvals"
          subtitle="Financial approvals"
          actions={<Badge tone="amber">{expenses.length}</Badge>}
          bodyClassName="p-0"
          dense
        >
          {expenses.length ? (
            <ul className="divide-y divide-ink-100">
              {expenses.map((e) => (
                <li key={e.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <Wallet size={16} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink-900">{e.description}</p>
                      <p className="mt-0.5 text-xs text-ink-500">
                        {formatCurrency(e.amount)} · {e.category} · {ws.nameOf(e.paid_by)} · {formatDate(e.expense_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="ghost" onClick={() => act("expenses", e.id, "rejected")}>
                      <XCircle size={15} /> Reject
                    </Button>
                    <Button onClick={() => act("expenses", e.id, "approved")}>
                      <CheckCircle2 size={15} /> Approve
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No pending expenses" />
          )}
        </SectionCard>

        <SectionCard
          title="Report reviews"
          subtitle="Submitted founder reports"
          actions={<Badge tone="amber">{reports.length}</Badge>}
          bodyClassName="p-0"
          dense
        >
          {reports.length ? (
            <ul className="divide-y divide-ink-100">
              {reports.map((r) => (
                <li key={r.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      <FileText size={16} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink-900">{r.title}</p>
                      <p className="mt-0.5 text-xs text-ink-500">
                        {ws.nameOf(r.author_id)} · {formatDate(r.created_at)}
                      </p>
                      {r.summary && <p className="mt-1 line-clamp-2 text-xs text-ink-500">{r.summary}</p>}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge map={DECISION_STATUS} value="pending" />
                    <Button variant="ghost" onClick={() => act("reports", r.id, "rejected")}>
                      Request changes
                    </Button>
                    <Button onClick={() => act("reports", r.id, "approved")}>
                      <CheckCircle2 size={15} /> Approve
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No reports awaiting review" />
          )}
        </SectionCard>

        {total === 0 && (
          <div className="flex items-center justify-center gap-2 text-sm text-ink-500">
            <Clock size={15} /> You're all caught up.
          </div>
        )}
      </div>
    </div>
  );
}
