import { useEffect } from "react";
import { X } from "lucide-react";

export function Modal({ open, onClose, title, description, children, footer, size = "md" }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-ink-950/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 w-full ${sizes[size]} max-h-[92vh] overflow-y-auto rounded-t-2xl bg-white shadow-pop sm:rounded-2xl`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-ink-900">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-ink-100 px-5 py-4">{footer}</div>
        )}
      </div>
    </div>
  );
}
