import { UserPlus } from "lucide-react";
import { FunctionalPage } from "../shared/FunctionalPage";

export default function RelationshipsPage() {
  return (
    <FunctionalPage
      eyebrow="CNO"
      title="Relationships"
      subtitle="Relationship development, outreach and community activities."
      icon={UserPlus}
      areas={["network"]}
      entity="relationship task"
    />
  );
}
