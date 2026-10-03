import { Briefcase } from "lucide-react";
import { FunctionalPage } from "../shared/FunctionalPage";

export default function ProcessesPage() {
  return (
    <FunctionalPage
      eyebrow="CLO / COO"
      title="Processes"
      subtitle="Internal process design, documentation and roll-out."
      icon={Briefcase}
      areas={["operations"]}
      entity="process task"
    />
  );
}
