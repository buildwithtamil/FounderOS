import { classNames } from "../../lib/utils";
import { AlertTriangle, Inbox, RefreshCw, ShieldOff } from "lucide-react";

export function EmptyState({ title = "No data available yet", message, icon: Icon = Inbox, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-100 text-ink-500">
        <Icon size={20} />
      </span>
      <div>
        <p className="text-sm font-semibold text-ink-800">{title}</p>
        {message && <p className="mt-0.5 text-sm text-ink-500 max-w-sm">{message}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", message, onRetry, className }) {
  return (
    <div className={classNames("card p-6", className)}>
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <AlertTriangle size={18} />
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-ink-900">{title}</p>
          {message && <p className="mt-1 text-sm text-ink-500">{message}</p>}
          {onRetry && (
            <button onClick={onRetry} className="btn-subtle mt-3">
              <RefreshCw size={14} /> Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function AccessDenied({ message }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
        <ShieldOff size={26} />
      </span>
      <div>
        <h1 className="text-xl font-semibold text-ink-900">Access denied</h1>
        <p className="mt-1 max-w-md text-sm text-ink-500">
          {message ||
            "Your role does not have permission to view this workspace. If you believe this is an error, contact the CEO/CFO seat."}
        </p>
      </div>
    </div>
  );
}
