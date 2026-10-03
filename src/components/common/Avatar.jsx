import { classNames, initials } from "../../lib/utils";

const SIZES = {
  xs: "h-7 w-7 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

const TINTS = {
  ceo_cfo: "bg-brand-600",
  cso_cgo: "bg-sky-600",
  cmo_cso: "bg-fuchsia-600",
  cpo_cto: "bg-emerald-600",
  clo_coo: "bg-amber-600",
  cno: "bg-rose-600",
  unassigned: "bg-ink-500",
};

export function Avatar({ name, role, src, size = "sm", className }) {
  const cls = SIZES[size] || SIZES.sm;
  if (src) {
    return (
      <img
        src={src}
        alt={name || "Avatar"}
        className={classNames("rounded-full object-cover", cls, className)}
      />
    );
  }
  return (
    <span
      className={classNames(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        cls,
        TINTS[role] || TINTS.unassigned,
        className
      )}
      aria-hidden="true"
    >
      {initials(name) || "—"}
    </span>
  );
}
