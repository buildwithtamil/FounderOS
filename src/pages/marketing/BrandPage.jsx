import { Sparkles } from "lucide-react";
import { FunctionalPage } from "../shared/FunctionalPage";

export default function BrandPage() {
  return (
    <FunctionalPage
      eyebrow="CMO / CSO"
      title="Brand"
      subtitle="Brand equity, identity, communication and positioning work."
      icon={Sparkles}
      areas={["brand", "marketing"]}
      entity="brand task"
    />
  );
}
