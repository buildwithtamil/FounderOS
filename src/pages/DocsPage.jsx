import { Link } from "react-router-dom";
import { ArrowLeft, Database, FileSpreadsheet, Image, ShieldCheck } from "lucide-react";
import { SectionCard } from "../components/common";
import { COMPANY } from "../lib/company";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-ink-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline">
          <ArrowLeft size={15} /> Back to sign in
        </Link>

        <h1 className="mt-4 text-2xl font-semibold text-ink-900">{COMPANY.name} setup guide</h1>
        <p className="mt-1 text-sm text-ink-500">
          FounderOS stores important data in Supabase, keeps less-critical data exportable to Excel,
          and hosts founder images in Supabase Storage.
        </p>

        <div className="mt-6 space-y-5">
          <SectionCard title="1. Connect Supabase" actions={<Database size={16} className="text-ink-400" />}>
            <ol className="space-y-2 text-sm text-ink-700">
              <li>1. Create a project at supabase.com.</li>
              <li>2. Run <code className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-xs">supabase/schema.sql</code> in the SQL editor.</li>
              <li>3. Copy <code className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-xs">.env.example</code> to <code className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-xs">.env</code> and add your project URL and anon key.</li>
              <li>4. Restart the dev server. No mock data is used — every record lives in your project.</li>
            </ol>
          </SectionCard>

          <SectionCard title="2. Create founders & assign roles" actions={<ShieldCheck size={16} className="text-ink-400" />}>
            <p className="text-sm text-ink-700">
              Create each user in Supabase Authentication. A profile row is created automatically.
              Assign roles by running the role updates at the bottom of the schema (or from the
              executive seat). Only the CEO/CFO seat may change roles.
            </p>
          </SectionCard>

          <SectionCard title="3. Important data vs Excel" actions={<FileSpreadsheet size={16} className="text-ink-400" />}>
            <p className="text-sm text-ink-700">
              High-value records (tasks, KPIs, objectives, decisions, budgets, expenses, reports)
              live in Supabase under Row Level Security. Less-critical collections can be exported to
              Excel and re-imported from any workspace page using the Import / Excel buttons.
            </p>
          </SectionCard>

          <SectionCard title="4. Founder images" actions={<Image size={16} className="text-ink-400" />}>
            <p className="text-sm text-ink-700">
              Each founder uploads their image from <strong>Profile → camera button</strong>. Images
              are stored in the <code className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-xs">avatars</code> bucket and
              shown on the dashboard header, founder directory and dashboards.
            </p>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
