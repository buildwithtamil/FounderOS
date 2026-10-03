import { classNames } from "../../lib/utils";

const VARIANTS = {
  primary: "btn-primary",
  ghost: "btn-ghost",
  subtle: "btn-subtle",
  danger: "btn bg-rose-600 text-white hover:bg-rose-700",
  link: "text-brand-700 font-medium hover:underline",
};

export function Button({
  as: Tag = "button",
  variant = "primary",
  className,
  type,
  loading = false,
  disabled,
  children,
  ...rest
}) {
  const isNative = Tag === "button";
  return (
    <Tag
      {...(isNative ? { type: type || "button", disabled: disabled || loading } : {})}
      className={classNames(VARIANTS[variant] || VARIANTS.primary, className)}
      {...rest}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {children}
    </Tag>
  );
}
