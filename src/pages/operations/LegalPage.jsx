import { Gavel } from "lucide-react";
import { FunctionalPage } from "../shared/FunctionalPage";

export default function LegalPage() {
  return (
    <FunctionalPage
      eyebrow="CLO / COO"
      title="Legal"
      subtitle="Legal tasks, contracts and documentation."
      icon={Gavel}
      areas={["legal"]}
      entity="legal task"
    />
  );
}
