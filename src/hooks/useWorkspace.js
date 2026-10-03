import { useMemo } from "react";
import { useApp } from "./useAuth";
import { isOverdue } from "../lib/utils";

/**
 * Derived company snapshot shared by dashboards and modules.
 * Everything is computed from the loaded workspace data; nothing is fabricated.
 */
export function useWorkspace() {
  const { data, dataState, refresh, error, profile } = useApp();

  const derived = useMemo(() => {
    const tasks = data?.tasks || [];
    const kpis = data?.kpis || [];
    const profiles = data?.profiles || [];
    const budgets = data?.budgets || [];
    const expenses = data?.expenses || [];
    const decisions = data?.decisions || [];
    const objectives = data?.strategic_objectives || [];
    const risks = data?.risk_register || [];

    const byId = Object.fromEntries(profiles.map((p) => [p.id, p]));
    const nameOf = (id) => byId[id]?.full_name || "Unassigned";

    const taskStats = {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === "completed").length,
      in_progress: tasks.filter((t) => t.status === "in_progress").length,
      blocked: tasks.filter((t) => t.status === "blocked").length,
      overdue: tasks.filter(isOverdue).length,
      review: tasks.filter((t) => t.status === "review").length,
    };

    const budgetTotals = budgets.reduce(
      (acc, b) => {
        acc.planned += Number(b.planned_amount) || 0;
        acc.actual += Number(b.actual_amount) || 0;
        return acc;
      },
      { planned: 0, actual: 0 }
    );

    const pendingExpenses = expenses.filter((e) => e.status === "pending");
    const pendingDecisions = decisions.filter((d) =>
      ["pending", "draft"].includes(d.status)
    );
    const openRisks = risks.filter((r) => r.status !== "closed" && r.status !== "monitoring");

    const objectiveProgress = objectives.length
      ? Math.round(objectives.reduce((s, o) => s + (Number(o.progress) || 0), 0) / objectives.length)
      : 0;

    const kpiHealth = kpis.length
      ? {
          on_track: kpis.filter((k) => Number(k.current_value) >= Number(k.target)).length,
          at_risk: kpis.filter(
            (k) =>
              Number(k.current_value) < Number(k.target) &&
              Number(k.current_value) >= Number(k.target) * 0.85
          ).length,
          off_track: kpis.filter((k) => Number(k.current_value) < Number(k.target) * 0.85).length,
        }
      : { on_track: 0, at_risk: 0, off_track: 0 };

    return {
      tasks,
      kpis,
      profiles,
      budgets,
      expenses,
      decisions,
      objectives,
      risks,
      partnerships: data?.partnerships || [],
      campaigns: data?.campaigns || [],
      meetings: data?.meetings || [],
      reports: data?.reports || [],
      notifications: data?.notifications || [],
      audit_logs: data?.audit_logs || [],
      policies: data?.policy_register || [],
      byId,
      nameOf,
      taskStats,
      budgetTotals,
      pendingExpenses,
      pendingDecisions,
      openRisks,
      objectiveProgress,
      kpiHealth,
      currentUserId: profile?.id,
    };
  }, [data, profile]);

  return { ...derived, dataState, refresh, error };
}
