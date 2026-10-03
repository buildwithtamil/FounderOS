import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail, Moon, ShieldCheck, Settings } from "lucide-react";
import { useApp } from "../../hooks/useAuth";
import { Button, Field, Input } from "../../components/common";

export default function LoginPage() {
  const { status, configured, signIn } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (status === "authenticated") return <Navigate to={from} replace />;

  if (!configured) {
    return <ConfigurationRequired />;
  }

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.message || "Unable to sign in. Check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <BrandPane />

      <div className="flex items-center justify-center bg-ink-50 px-5 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-950">
              <Moon size={20} className="text-brand-400" />
            </span>
            <span className="text-lg font-bold tracking-tight text-ink-900">FounderOS</span>
          </div>

          <h2 className="text-xl font-semibold text-ink-900">Sign in</h2>
          <p className="mt-1 text-sm text-ink-500">Access your role workspace.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field label="Email">
              <div className="relative">
                <Mail size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <Input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="pl-9"
                />
              </div>
            </Field>
            <Field label="Password">
              <div className="relative">
                <Lock size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <Input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9"
                />
              </div>
            </Field>

            {error && (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {error}
              </p>
            )}

            <Button type="submit" loading={loading} className="w-full">
              Sign in <ArrowRight size={15} />
            </Button>
          </form>

          <p className="mt-6 text-center text-[11px] text-ink-400">
            FounderOS v1.0 · Role-based access · Row Level Security enforced by Supabase
          </p>
        </div>
      </div>
    </div>
  );
}

function BrandPane() {
  return (
    <div className="relative hidden flex-col justify-between bg-ink-950 p-10 text-white lg:flex">
      <div className="flex items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
          <Moon size={20} className="text-brand-400" />
        </span>
        <span className="text-lg font-bold tracking-tight">FounderOS</span>
      </div>

      <div className="max-w-md">
        <h1 className="text-3xl font-semibold leading-tight">
          One Company. One Operating System.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-white/60">
          Every role. One source of truth. Strategy, ownership, execution and measurement in a
          single executive command center.
        </p>
        <dl className="mt-8 grid grid-cols-2 gap-4 text-sm">
          {[
            ["Roles", "6 leadership seats"],
            ["Governance", "Decisions, risks, policies"],
            ["Finance", "Budget & runway control"],
            ["Security", "Row Level Security"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
              <dt className="text-[11px] uppercase tracking-wider text-white/40">{k}</dt>
              <dd className="mt-1 font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <p className="flex items-center gap-2 text-xs text-white/40">
        <ShieldCheck size={14} /> Sensitive financial and governance data is protected by database-level policies.
      </p>
    </div>
  );
}

function ConfigurationRequired() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-5 py-10">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-950">
            <Moon size={20} className="text-brand-400" />
          </span>
          <span className="text-lg font-bold tracking-tight text-ink-900">FounderOS</span>
        </div>

        <div className="card mt-6 p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
              <Settings size={20} />
            </span>
            <div>
              <h1 className="text-lg font-semibold text-ink-900">Configuration required</h1>
              <p className="mt-1 text-sm text-ink-500">
                FounderOS connects to your own Supabase project. No data is stored anywhere else and
                nothing is mocked — you must provide your project credentials before signing in.
              </p>
            </div>
          </div>

          <ol className="mt-5 space-y-3 text-sm text-ink-700">
            <li className="flex gap-2">
              <span className="font-semibold text-ink-400">1.</span>
              <span>
                Create a Supabase project and run <code className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-xs">supabase/schema.sql</code> in the SQL editor.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-ink-400">2.</span>
              <span>
                Copy <code className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-xs">.env.example</code> to <code className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-xs">.env</code> and set:
              </span>
            </li>
          </ol>

          <pre className="mt-3 overflow-x-auto rounded-lg bg-ink-950 p-4 text-xs leading-relaxed text-ink-100">
{`VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY`}
          </pre>
          <p className="mt-2 text-xs text-ink-400">
            Use only the anon key. Never place the service-role key in the frontend.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button as="a" href="https://supabase.com/dashboard" target="_blank" rel="noreferrer">
              Open Supabase
            </Button>
            <Button as={Link} to="/docs" variant="ghost">
              Setup guide
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
