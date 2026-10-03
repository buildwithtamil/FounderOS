import { useMemo, useState } from "react";
import { Plus, Download, Upload, FileSpreadsheet } from "lucide-react";
import { DataTable } from "./DataTable";
import { Button } from "./Button";
import { PageTitle } from "./Surfaces";
import { ErrorState } from "./States";
import { Field, Input, Textarea, Select } from "./Form";
import { Modal } from "./Modal";
import { useApp } from "../../hooks/useAuth";
import { useWorkspace } from "../../hooks/useWorkspace";
import { db } from "../../lib/dataApi";
import { FUNCTION_AREAS } from "../../lib/utils";
import {
  EXCEL_COLLECTIONS,
  exportCollectionToExcel,
  parseExcelFile,
  importRows,
} from "../../lib/excel";

/**
 * Generic, fully-functional record workspace.
 *
 * Powers the functional pages that are fundamentally a managed list: tasks,
 * KPIs, partnerships, campaigns, meetings, reports, risks, policies…
 *
 * All writes go to Supabase (RLS enforced). Less-critical collections can also
 * be exported to Excel, re-imported from Excel, or given a blank template.
 */
export function RecordWorkspace({
  title,
  subtitle,
  eyebrow,
  table,
  columns,
  fields,
  rows,
  searchKeys,
  addLabel = "New record",
  canCreate = true,
  emptyTitle,
  emptyMessage,
  headerExtra,
  children,
}) {
  const { profile, refresh } = useApp();
  const ws = useWorkspace();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({});
  const [importResult, setImportResult] = useState(null);

  const data = rows;
  const excelMeta = EXCEL_COLLECTIONS[table];

  const defaults = useMemo(() => {
    const d = {};
    (fields || []).forEach((f) => {
      d[f.name] = f.default ?? "";
    });
    return d;
  }, [fields]);

  const openCreate = () => {
    setForm(defaults);
    setError(null);
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const missing = (fields || []).filter((f) => f.required && !String(form[f.name] ?? "").trim());
      if (missing.length) {
        throw new Error(`Required: ${missing.map((m) => m.label).join(", ")}`);
      }
      const payload = { ...form };
      Object.keys(payload).forEach((k) => {
        if (payload[k] === "") delete payload[k];
      });
      if (columns.some((c) => c.key === "created_by") && profile?.id) {
        payload.created_by = profile.id;
      }
      const created = await db.insert(table, payload);
      await db.audit(profile?.id, `${table}.create`, table, created?.id, {
        title: payload.title || payload.name,
      });
      await refresh();
      setOpen(false);
    } catch (err) {
      setError(err?.message || "Could not save this record.");
    } finally {
      setSaving(false);
    }
  };

  const exportExcel = () => {
    exportCollectionToExcel(table, ws);
  };

  const handleImport = async (file) => {
    if (!file || !excelMeta) return;
    setImportResult(null);
    setError(null);
    try {
      const { collection, rows: parsed } = await parseExcelFile(file);
      const target = collection || table;
      const result = await importRows(target, parsed, { profiles: ws.profiles });
      await db.audit(profile?.id, `${target}.import`, target, null, { inserted: result.inserted });
      await refresh();
      setImportResult({ target, ...result });
    } catch (err) {
      setError(err?.message || "Could not import this file.");
    }
  };

  return (
    <div className="space-y-5">
      <PageTitle
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        actions={
          <>
            {excelMeta && (
              <>
                <label className="btn-ghost cursor-pointer">
                  <Upload size={15} /> Import
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={(e) => {
                      handleImport(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
                <Button variant="ghost" onClick={exportExcel} disabled={!data.length}>
                  <Download size={15} /> Excel
                </Button>
              </>
            )}
            {canCreate && (
              <Button onClick={openCreate} disabled={!fields?.length}>
                <Plus size={15} /> {addLabel}
              </Button>
            )}
          </>
        }
      />

      {headerExtra}

      {importResult && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          <FileSpreadsheet size={14} /> Imported {importResult.inserted} row(s) into{" "}
          {importResult.target}
          {importResult.skipped ? ` · ${importResult.skipped} skipped` : ""}.
        </div>
      )}
      {error && !open && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </div>
      )}

      {ws.dataState === "error" ? (
        <ErrorState title="Could not load records" message={ws.error?.message} onRetry={ws.refresh} />
      ) : (
        <DataTable
          columns={columns}
          rows={data}
          searchKeys={searchKeys}
          emptyTitle={emptyTitle}
          emptyMessage={emptyMessage}
        />
      )}

      {children}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={addLabel}
        description="Saved to Supabase with role-based policies."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} loading={saving}>Save record</Button>
          </>
        }
      >
        <form onSubmit={submit} className="space-y-4">
          {(fields || []).map((f) => (
            <Field key={f.name} label={f.label} required={f.required} hint={f.hint}>
              {f.type === "textarea" ? (
                <Textarea
                  value={form[f.name] ?? ""}
                  onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                  placeholder={f.placeholder}
                />
              ) : f.type === "select" ? (
                <Select
                  value={form[f.name] ?? ""}
                  onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                >
                  <option value="">Select…</option>
                  {(f.options || []).map((o) => (
                    <option key={o.value ?? o} value={o.value ?? o}>
                      {o.label ?? o}
                    </option>
                  ))}
                </Select>
              ) : (
                <Input
                  type={f.type || "text"}
                  value={form[f.name] ?? ""}
                  onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                  placeholder={f.placeholder}
                />
              )}
            </Field>
          ))}
          {error && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </p>
          )}
        </form>
      </Modal>
    </div>
  );
}

export const FUNCTION_AREA_OPTIONS = FUNCTION_AREAS.map((f) => ({
  value: f,
  label: f.replace(/\b\w/g, (c) => c.toUpperCase()),
}));
