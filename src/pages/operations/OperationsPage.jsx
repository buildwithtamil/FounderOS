import { Settings } from "lucide-react";
import { FunctionalPage } from "../shared/FunctionalPage";

export default function OperationsPage() {
  return (
    <FunctionalPage
      eyebrow="CLO / COO"
      title="Operations"
      subtitle="Internal processes, operational execution and documentation."
      icon={Settings}
      areas={["operations"]}
      entity="operations task"
    />
  );
}
