import { classNames } from "../../lib/utils";

export function Field({ label, hint, error, required, children, className }) {
  return (
    <label className={classNames("block", className)}>
      {label && (
        <span className="label">
          {label}
          {required && <span className="text-rose-600"> *</span>}
        </span>
      )}
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-ink-400">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-rose-600">{error}</span>}
    </label>
  );
}

export function Input(props) {
  return <input {...props} className={classNames("input", props.className)} />;
}

export function Textarea(props) {
  return <textarea {...props} className={classNames("input min-h-[90px]", props.className)} />;
}

export function Select({ children, ...props }) {
  return (
    <select {...props} className={classNames("input appearance-none pr-8", props.className)}>
      {children}
    </select>
  );
}
