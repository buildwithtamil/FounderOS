import { classNames } from "../../lib/utils";

export function PageContainer({ children, className, width = "wide" }) {
  const widths = {
    narrow: "max-w-3xl",
    default: "max-w-5xl",
    wide: "max-w-7xl",
    full: "max-w-none",
  };
  return (
    <main className={classNames("mx-auto w-full px-3 py-5 sm:px-5 sm:py-6", widths[width], className)}>
      {children}
    </main>
  );
}

export function PageStack({ children, className }) {
  return <div className={classNames("space-y-5", className)}>{children}</div>;
}
