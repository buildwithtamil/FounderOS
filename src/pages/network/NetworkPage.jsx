import { Network } from "lucide-react";
import { useWorkspace } from "../../hooks/useWorkspace";
import { FunctionalPage } from "../shared/FunctionalPage";
import { KPIWidget } from "../../components/dashboard/DashboardWidgets";
import { SectionCard } from "../../components/common";

export default function NetworkPage() {
  const ws = useWorkspace();
  const networkKpis = ws.kpis.filter((k) => ["network", "partnerships"].includes(k.function_area));
  return (
    <FunctionalPage
      eyebrow="CNO"
      title="Network"
      subtitle="Networking, external relationships, community and strategic connections."
      icon={Network}
      areas={["network"]}
      entity="networking task"
      extra={
        networkKpis.length ? (
          <SectionCard title="Networking KPIs">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {networkKpis.map((k) => (
                <KPIWidget key={k.id} kpi={k} ownerName={ws.nameOf(k.owner_id)} />
              ))}
            </div>
          </SectionCard>
        ) : null
      }
    />
  );
}
