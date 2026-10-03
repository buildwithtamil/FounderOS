import { useState } from "react";
import { Plus, Wallet, TrendingUp, Clock } from "lucide-react";
import { useWorkspace } from "../../hooks/useWorkspace";
import { usePermissions } from "../../hooks/usePermissions";
import { useApp } from "../../hooks/useAuth";
import {
  DataTable,
  PageTitle,
  SectionCard,
  StatTile,
  Button,
  StatusBadge,
  Modal,
  Field,
  Input,
  Select,
  EmptyState,
  ProgressBar,
} from "../../components/common";
import { db } from "../../lib/dataApi";
import { formatCurrency, formatDate, percent, TONE_CLASSES } from "../../lib/utils";

const EXPENSE_STATUS = {
  pending: { label: "Pending", tone: "amber" },
  approved: { label: "Approved", tone: "emerald" },
  rejected: { label: "Rejected", tone: "rose" },
  reimbursed: { label: "Reimbursed", tone: "brand" },
};

export default function FinancePage() {
  const ws = useWorkspace();
  const { can } = usePermissions();
  const { profile } = useApp();
  const [localExpenses, setLocalExpenses] = useState(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ amount: "", category: "operations", description: "", expense_date: "" });

  const expenses = localExpenses ?? ws.expenses;
  const canManage = can("finance.manage");
  const canSubmit = can("finance.submit_expense");

  const budgetColumns = [
    { key: "category", header: "Category", sortable: true, render: (b) => <span className="capitalize font-medium text-ink-900">{b.category}</span> },
    { key: "planned_amount", header: "Planned", sortable: true, render: (b) => <span className="tabular-nums">{formatCurrency(b.planned_amount)}</span> },
    { key: "actual_amount", header: "Actual", sortable: true, render: (b) => <span className="tabular-nums">{formatCurrency(b.actual_amount)}</span> },
    {
      key: "utilization",
      header: "Utilization",
      render: (b) => {
        const p = percent(b.actual_amount, b.planned_amount);
        return (
          <div className="flex items-center gap-2 min-w-[130px]">
            <ProgressBar value={p} tone={p > 100 ? "rose" : p > 85 ? "amber" : "emerald"} />
            <span className="w-9 text-right text-xs tabular-nums">{p}%</span>
          </div>
        );
      },
    },
    { key: "owner_id", header: "Owner", render: (b) => ws.nameOf(b.owner_id) },
  ];

  const expenseColumns = [
    { key: "description", header: "Description", sortable: true, render: (e) => <span className="font-medium text-ink-900">{e.description}</span> },
    { key: "category", header: "Category", render: (e) => <span className="capitalize text-ink-600">{e.category}</span> },
    { key: "amount", header: "Amount", sortable: true, render: (e) => <span className="tabular-nums">{formatCurrency(e.amount)}</span> },
    { key: "paid_by", header: "Submitted by", render: (e) => ws.nameOf(e.paid_by) },
    { key: "expense_date", header: "Date", sortable: true, render: (e) => <span className="tabular-nums">{formatDate(e.expense_date)}</span> },
    { key: "status", header: "Status", render: (e) => <StatusBadge map={EXPENSE_STATUS} value={e.status} /> },
  ];

  const submitExpense = async (ev) => {
    ev.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (!form.amount || !form.description) throw new Error("Amount and description are required.");
      const payload = {
        amount: Number(form.amount),
        category: form.category,
        description: form.description,
        expense_date: form.expense_date || new Date().toISOString().slice(0, 10),
        paid_by: profile?.id,
        status: "pending",
      };
      const created = await db.insert("expenses", payload);
      await db.audit(profile?.id, "expense.submit", "expenses", created?.id, { amount: payload.amount });
      await db.notify(
        (ws.profiles || []).filter((p) => p.role === "ceo_cfo").map((p) => p.id),
        {
          title: "Expense submitted",
          message: `${profile?.full_name} submitted ${formatCurrency(payload.amount)} for ${payload.description}`,
          type: "expense",
        }
      );
      setLocalExpenses([created, ...expenses]);
      setOpen(false);
      setForm({ amount: "", category: "operations", description: "", expense_date: "" });
    } catch (err) {
      setError(err?.message || "Could not submit expense.");
    } finally {
      setSaving(false);
    }
  };

  const planned = ws.budgetTotals.planned;
  const actual = ws.budgetTotals.actual;
  const burn = ws.kpis.find((k) => /burn/i.test(k.name));

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-5 sm:py-6">
      <PageTitle
        eyebrow="CEO / CFO"
        title="Finance"
        subtitle="Budgets, expenses, cash planning and financial approvals. Restricted to the executive seat by database policy."
        actions={
          <>
            {canSubmit && (
              <Button onClick={() => setOpen(true)}>
                <Plus size={15} /> Submit expense
              </Button>
            )}
          </>
        }
      />

      <div className="mt-5 space-y-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile label="Planned budget" value={formatCurrency(planned)} icon={Wallet} tone="brand" />
          <StatTile label="Actual spend" value={formatCurrency(actual)} icon={TrendingUp} tone={actual > planned ? "rose" : "emerald"} hint={`${percent(actual, planned)}% utilized`} />
          <StatTile label="Monthly burn" value={burn ? `${formatCurrency(burn.current_value)}` : "—"} icon={TrendingUp} tone={burn && Number(burn.current_value) > Number(burn.target) ? "rose" : "emerald"} hint={burn ? `Target ${formatCurrency(burn.target)}` : "No burn KPI defined"} />
          <StatTile label="Pending expenses" value={expenses.filter((e) => e.status === "pending").length} icon={Clock} tone="amber" />
        </div>

        <SectionCard title="Budget vs actual" subtitle="By category" bodyClassName="p-0" dense>
          {ws.budgets.length ? (
            <div className="p-4">
              <BudgetBars budgets={ws.budgets} />
              <div className="mt-5">
                <DataTable columns={budgetColumns} rows={ws.budgets} emptyTitle="No budgets yet" />
              </div>
            </div>
          ) : (
            <EmptyState title="No data available yet" message="Budget lines will appear here once created." />
          )}
        </SectionCard>

        <SectionCard
          title={canManage ? "Company expenses" : "My expense submissions"}
          subtitle={canManage ? "All expenses across the company" : "You can view the status of your own submissions"}
          bodyClassName="p-0"
          dense
        >
          {expenses.length ? (
            <DataTable
              columns={expenseColumns}
              rows={canManage ? expenses : expenses.filter((e) => e.paid_by === profile?.id)}
              searchKeys={["description", "category", "status"]}
              emptyTitle="No expenses yet"
            />
          ) : (
            <EmptyState title="No data available yet" message="Submit an expense to get started." />
          )}
        </SectionCard>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Submit expense"
        description="Submitted for CEO/CFO approval with RLS-enforced ownership."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submitExpense} loading={saving}>Submit</Button>
          </>
        }
      >
        <form onSubmit={submitExpense} className="space-y-4">
          <Field label="Amount" required>
            <Input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm((s) => ({ ...s, amount: e.target.value }))} placeholder="0.00" />
          </Field>
          <Field label="Category">
            <Select value={form.category} onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}>
              {["operations", "infrastructure", "marketing", "legal", "software", "travel", "other"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Description" required>
            <Input value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} placeholder="What was this for?" />
          </Field>
          <Field label="Expense date">
            <Input type="date" value={form.expense_date} onChange={(e) => setForm((s) => ({ ...s, expense_date: e.target.value }))} />
          </Field>
          {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}
        </form>
      </Modal>
    </div>
  );
}

function BudgetBars({ budgets }) {
  const max = Math.max(...budgets.map((b) => Math.max(Number(b.planned_amount), Number(b.actual_amount))), 1);
  return (
    <div className="space-y-4">
      {budgets.map((b) => (
        <div key={b.id}>
          <div className="flex items-center justify-between text-sm">
            <span className="capitalize font-medium text-ink-800">{b.category}</span>
            <span className="tabular-nums text-ink-500">
              {formatCurrency(b.actual_amount)} / {formatCurrency(b.planned_amount)}
            </span>
          </div>
          <div className="mt-2 space-y-1.5">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink-100" title="Planned">
              <div className="h-full rounded-full bg-ink-300" style={{ width: `${(Number(b.planned_amount) / max) * 100}%` }} />
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink-100" title="Actual">
              <div
                className={`h-full rounded-full ${Number(b.actual_amount) > Number(b.planned_amount) ? "bg-rose-500" : "bg-brand-600"}`}
                style={{ width: `${(Number(b.actual_amount) / max) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
      <p className="text-xs text-ink-400">Top bar: planned · Bottom bar: actual</p>
    </div>
  );
}

void TONE_CLASSES;
