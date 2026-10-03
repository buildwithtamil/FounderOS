import { Boxes } from "lucide-react";
import { FunctionalPage } from "../shared/FunctionalPage";

export default function ProductPage() {
  return (
    <FunctionalPage
      eyebrow="CPO / CTO"
      title="Product"
      subtitle="Product roadmap, releases, product KPIs and development tasks."
      icon={Boxes}
      areas={["product"]}
      entity="product task"
    />
  );
}
