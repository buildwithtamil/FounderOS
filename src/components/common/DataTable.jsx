import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { classNames } from "../../lib/utils";
import { EmptyState } from "./States";

/**
 * Responsive data table.
 *
 * Desktop: a real table. Mobile: each row collapses into a card. Pass `columns`
 * as [{ key, header, render?, sortable?, className? }] and `rows`.
 */
export function DataTable({
  columns,
  rows,
  searchKeys = [],
  searchPlaceholder = "Search…",
  emptyTitle = "No records yet",
  emptyMessage = "Records created here will appear in this list.",
  toolbar,
  onRowClick,
  initialSort,
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(initialSort || { key: null, dir: "desc" });

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    const keys = searchKeys.length ? searchKeys : columns.map((c) => c.key);
    return rows.filter((r) =>
      keys.some((k) => String(r?.[k] ?? "").toLowerCase().includes(q))
    );
  }, [rows, query, searchKeys, columns]);

  const sorted = useMemo(() => {
    if (!sort.key) return filtered;
    const arr = [...filtered];
    arr.sort((a, b) => {
      const av = a?.[sort.key];
      const bv = b?.[sort.key];
      if (av === bv) return 0;
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      return (av > bv ? 1 : -1) * (sort.dir === "asc" ? 1 : -1);
    });
    return arr;
  }, [filtered, sort]);

  const toggleSort = (key) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

  return (
    <div className="card overflow-hidden">
      {(searchKeys.length > 0 || toolbar) && (
        <div className="flex flex-col gap-3 border-b border-ink-100 p-3 sm:flex-row sm:items-center sm:justify-between">
          {searchKeys.length > 0 && (
            <div className="relative sm:max-w-xs sm:flex-1">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="input pl-9"
              />
            </div>
          )}
          {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
        </div>
      )}

      {/* Desktop */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse">
          <thead className="bg-ink-50/80">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={classNames("th", c.className)}>
                  {c.sortable ? (
                    <button
                      onClick={() => toggleSort(c.key)}
                      className="inline-flex items-center gap-1 hover:text-ink-800"
                    >
                      {c.header}
                      {sort.key === c.key ? (
                        sort.dir === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                      ) : (
                        <ChevronDown size={13} className="opacity-30" />
                      )}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {sorted.map((row, i) => (
              <tr
                key={row.id || i}
                className={classNames(
                  "transition-colors",
                  onRowClick && "cursor-pointer hover:bg-ink-50/60"
                )}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((c) => (
                  <td key={c.key} className={classNames("td", c.className)}>
                    {c.render ? c.render(row) : (row[c.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <EmptyState title={emptyTitle} message={emptyMessage} />
        )}
      </div>

      {/* Mobile cards */}
      <div className="divide-y divide-ink-100 md:hidden">
        {sorted.map((row, i) => (
          <div
            key={row.id || i}
            className={classNames("space-y-2 p-4", onRowClick && "active:bg-ink-50")}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
          >
            {columns.map((c) => (
              <div key={c.key} className="flex items-start justify-between gap-3">
                <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-ink-400">
                  {c.header}
                </span>
                <span className="min-w-0 break-words text-right text-sm text-ink-800">
                  {c.render ? c.render(row) : (row[c.key] ?? "—")}
                </span>
              </div>
            ))}
          </div>
        ))}
        {sorted.length === 0 && <EmptyState title={emptyTitle} message={emptyMessage} />}
      </div>
    </div>
  );
}
