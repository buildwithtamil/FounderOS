import { Cpu } from "lucide-react";
import { FunctionalPage } from "../shared/FunctionalPage";

export default function TechnologyPage() {
  return (
    <FunctionalPage
      eyebrow="CPO / CTO"
      title="Technology"
      subtitle="Technical initiatives, infrastructure and engineering execution."
      icon={Cpu}
      areas={["technology"]}
      entity="technical task"
    />
  );
}
