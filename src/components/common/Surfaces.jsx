import { classNames, TONE_CLASSES } from "../../lib/utils";

export function PageTitle({ title, subtitle, actions, eyebrow }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">{eyebrow}</p>
        )}
        <h1 className="truncate text-xl font-semibold text-ink-900 sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-ink-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SectionCard({ title, subtitle, actions, children, className, bodyClassName, dense }) {
  return (
    <section className={classNames("card", className)}>
      {(title || actions) && (
        <header className="flex items-start justify-between gap-3 border-b border-ink-100 px-5 py-3.5">
          <div className="min-w-0">
            {title && <h2 className="text-sm font-semibold text-ink-900">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-ink-500">{subtitle}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={classNames(dense ? "" : "p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function StatTile({ label, value, delta, tone = "ink", icon: Icon, hint, className }) {
  return (
    <div className={classNames("card p-4", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</p>
        {Icon && (
          <span
            className={classNames(
              "flex h-7 w-7 items-center justify-center rounded-lg ring-1 ring-inset",
              TONE_CLASSES[tone] || TONE_CLASSES.ink
            )}
          >
            <Icon size={14} />
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-ink-900">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-ink-500">{hint}</p>}
      {delta && (
        <p className="mt-1 text-xs font-medium text-ink-500">
          <span className={tone === "rose" ? "text-rose-600" : "text-emerald-600"}>{delta}</span>
        </p>
      )}
    </div>
  );
}
