import { Code2 } from "lucide-react";
import { FunctionalPage } from "../shared/FunctionalPage";

export default function EngineeringPage() {
  return (
    <FunctionalPage
      eyebrow="CPO / CTO"
      title="Engineering"
      subtitle="Engineering tasks, issues and delivery milestones."
      icon={Code2}
      areas={["technology", "product"]}
      entity="engineering task"
    />
  );
}
