import { classNames } from "../../lib/utils";

const LOADER_SIZE = { sm: "h-4 w-4 border-2", md: "h-6 w-6 border-2", lg: "h-9 w-9 border-[3px]" };

export function Spinner({ size = "md", className }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={classNames(
        "inline-block animate-spin rounded-full border-ink-300 border-t-brand-600",
        LOADER_SIZE[size] || LOADER_SIZE.md,
        className
      )}
    />
  );
}

export function LoadingBlock({ label = "Loading…", className }) {
  return (
    <div className={classNames("flex items-center justify-center gap-3 py-12 text-sm text-ink-500", className)}>
      <Spinner />
      <span>{label}</span>
    </div>
  );
}

export function SkeletonRows({ rows = 4, className }) {
  return (
    <div className={classNames("space-y-3", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-10 w-full" />
      ))}
    </div>
  );
}
