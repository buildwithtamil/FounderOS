import { classNames, TONE_CLASSES } from "../../lib/utils";

export function Badge({ tone = "ink", children, className }) {
  return (
    <span className={classNames("badge", TONE_CLASSES[tone] || TONE_CLASSES.ink, className)}>
      {children}
    </span>
  );
}

export function StatusBadge({ map, value }) {
  const meta = map?.[value] || { label: value || "—", tone: "ink" };
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}
