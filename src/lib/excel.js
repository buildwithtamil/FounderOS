import { db } from "./dataApi";

/**
 * Excel integration for less-critical collections.
 *
 * xlsx is loaded lazily so it does not bloat the initial bundle; it is only
 * fetched when a user actually imports or exports a workbook.
 *
 * Strategy per the requirement: important data lives in Supabase; bulkier or
 * less-critical collections can be exported to an Excel workbook and
 * re-imported. Each collection is a worksheet; a row maps 1:1 to a table row.
 */
let _xlsx = null;
async function xlsx() {
  if (!_xlsx) _xlsx = await import("xlsx");
  return _xlsx;
}

/** Column definitions per exportable collection. */
export const EXCEL_COLLECTIONS = {
  tasks: {
    label: "Tasks",
    columns: ["title", "description", "function_area", "priority", "status", "due_date", "owner_email"],
  },
  kpis: {
    label: "KPIs",
    columns: ["name", "description", "function_area", "target", "current_value", "unit", "period", "owner_email"],
  },
  strategic_objectives: {
    label: "Objectives",
    columns: ["title", "description", "priority", "progress", "status", "start_date", "target_date", "owner_email"],
  },
  meetings: {
    label: "Meetings",
    columns: ["title", "meeting_type", "meeting_date", "agenda", "notes", "action_items", "organiser_email"],
  },
  reports: {
    label: "Reports",
    columns: ["title", "report_type", "period_start", "period_end", "summary", "status", "author_email"],
  },
  campaigns: {
    label: "Campaigns",
    columns: ["name", "channel", "status", "progress", "budget", "owner_email"],
  },
  partnerships: {
    label: "Partnerships",
    columns: ["name", "partnership_type", "status", "progress", "owner_email"],
  },
  risk_register: {
    label: "Risks",
    columns: ["title", "category", "severity", "status", "owner_email"],
  },
  policy_register: {
    label: "Policies",
    columns: ["title", "category", "status", "version"],
  },
};

const OWNER_FIELD = {
  tasks: "owner_email",
  kpis: "owner_email",
  strategic_objectives: "owner_email",
  meetings: "organiser_email",
  reports: "author_email",
  campaigns: "owner_email",
  partnerships: "owner_email",
  risk_register: "owner_email",
};

const OWNER_ID = {
  tasks: "owner_id",
  kpis: "owner_id",
  strategic_objectives: "owner_id",
  meetings: "created_by",
  reports: "author_id",
  campaigns: "owner_id",
  partnerships: "owner_id",
  risk_register: "owner_id",
};

function rowsForExport(collection, workspace) {
  const profiles = workspace.profiles || [];
  const emailOf = (id) => profiles.find((p) => p.id === id)?.email || "";
  const ownerField = OWNER_FIELD[collection];
  const ownerIdField = OWNER_ID[collection];
  return (workspace[collection] || []).map((row) => {
    const out = {};
    for (const col of EXCEL_COLLECTIONS[collection].columns) {
      if (col === ownerField) out[col] = emailOf(row[ownerIdField]);
      else out[col] = row[col] ?? "";
    }
    return out;
  });
}

function aoa(collection, workspace) {
  const cols = EXCEL_COLLECTIONS[collection].columns;
  const rows = rowsForExport(collection, workspace);
  return [cols, ...rows.map((r) => cols.map((c) => r[c]))];
}

/** Export one collection to an .xlsx file and trigger a download. */
export async function exportCollectionToExcel(collection, workspace) {
  const XLSX = await xlsx();
  const ws = XLSX.utils.aoa_to_sheet(aoa(collection, workspace));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, EXCEL_COLLECTIONS[collection].label.slice(0, 31));
  XLSX.writeFile(wb, `founderos-${collection}.xlsx`);
}

/** Export several collections, each as its own sheet, into one workbook. */
export async function exportWorkbookToExcel(collections, workspace) {
  const XLSX = await xlsx();
  const wb = XLSX.utils.book_new();
  for (const collection of collections) {
    const ws = XLSX.utils.aoa_to_sheet(aoa(collection, workspace));
    XLSX.utils.book_append_sheet(wb, ws, EXCEL_COLLECTIONS[collection].label.slice(0, 31));
  }
  XLSX.writeFile(wb, "founderos-export.xlsx");
}

/** Parse an uploaded .xlsx file into { collection, rows } using column headers. */
export async function parseExcelFile(file) {
  const XLSX = await xlsx();
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array", cellDates: true });
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });
  // Identify the collection from the header set (best match).
  const headers = Object.keys(json[0] || {});
  const collection = identifyCollection(headers, sheetName);
  const cols = collection ? EXCEL_COLLECTIONS[collection].columns : headers;
  const rows = json.map((r) => {
    const out = {};
    for (const c of cols) out[c] = r[c] ?? "";
    return out;
  });
  return { collection, rows, sheetName, headers };
}

function identifyCollection(headers, sheetName) {
  const name = String(sheetName || "").toLowerCase();
  for (const [key, meta] of Object.entries(EXCEL_COLLECTIONS)) {
    if (meta.label.toLowerCase() === name) return key;
  }
  // Fall back to best header overlap.
  let best = null;
  let bestScore = 0;
  for (const [key, meta] of Object.entries(EXCEL_COLLECTIONS)) {
    const score = meta.columns.filter((c) => headers.includes(c) || headers.includes(c.replace("_email", ""))).length;
    if (score > bestScore) {
      bestScore = score;
      best = key;
    }
  }
  return bestScore >= 2 ? best : null;
}

function blankToNull(v) {
  return v === "" || v === undefined ? null : v;
}

/**
 * Import parsed rows into Supabase. Owner/author emails are resolved to ids.
 * Returns { inserted, skipped, errors }.
 */
export async function importRows(collection, rows, { profiles = [] } = {}) {
  const ownerField = OWNER_FIELD[collection];
  const ownerIdField = OWNER_ID[collection];
  const cols = EXCEL_COLLECTIONS[collection].columns;
  const idByEmail = Object.fromEntries(
    profiles.filter((p) => p.email).map((p) => [p.email.toLowerCase(), p.id])
  );

  const payload = [];
  const errors = [];
  for (let i = 0; i < rows.length; i += 1) {
    const raw = rows[i];
    const row = {};
    for (const c of cols) {
      if (c === ownerField) continue;
      if (["target", "current_value", "progress", "budget", "amount"].includes(c)) {
        const n = Number(raw[c]);
        row[c] = Number.isNaN(n) ? null : n;
      } else {
        row[c] = blankToNull(raw[c]);
      }
    }
    if (ownerField && ownerIdField) {
      const email = String(raw[ownerField] || "").toLowerCase();
      row[ownerIdField] = idByEmail[email] || null;
    }
    // Minimal required-field guard.
    if (!row.title && !row.name) {
      errors.push(`Row ${i + 2}: missing title/name`);
      continue;
    }
    payload.push(row);
  }

  if (!payload.length) return { inserted: 0, skipped: rows.length, errors };
  const inserted = await db.insertMany(collection, payload);
  return { inserted: inserted.length, skipped: errors.length, errors };
}

/** A blank, ready-to-fill template for a collection. */
export async function downloadTemplate(collection) {
  const XLSX = await xlsx();
  const cols = EXCEL_COLLECTIONS[collection].columns;
  const ws = XLSX.utils.aoa_to_sheet([cols]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, EXCEL_COLLECTIONS[collection].label.slice(0, 31));
  XLSX.writeFile(wb, `founderos-${collection}-template.xlsx`);
}
