import { useRef, useState } from "react";
import { Mail, Building2, ShieldCheck, LogOut, BadgeCheck, Camera, Loader2 } from "lucide-react";
import { useApp } from "../../hooks/useAuth";
import { PageTitle, SectionCard, Avatar, Button, Field, Input, Badge } from "../../components/common";
import { getRole, COLOR_CLASSES } from "../../lib/roles";
import { classNames, formatDate } from "../../lib/utils";
import { supabase } from "../../lib/supabase";

export default function ProfilePage() {
  const { profile, signOut, session, updateOwnProfile } = useApp();
  const role = getRole(profile?.role);
  const fileRef = useRef(null);

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [department, setDepartment] = useState(profile?.department || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateOwnProfile({ full_name: fullName, department });
      setSaved(true);
    } catch (e) {
      setError(e?.message || "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (file) => {
    if (!file || !profile?.id) return;
    setUploading(true);
    setError(null);
    try {
      const ext = (file.name.split(".").pop() || "png").toLowerCase();
      const path = `${profile.id}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, cacheControl: "3600" });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = `${data.publicUrl}?v=${Date.now()}`;
      await updateOwnProfile({ avatar_url: url });
    } catch (e) {
      setError(e?.message || "Could not upload your image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-3 py-5 sm:px-5 sm:py-6">
      <PageTitle
        eyebrow="Account"
        title="Profile"
        subtitle="Your identity and role within FounderOS."
      />

      <div className="mt-5 space-y-5">
        <SectionCard>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            {/* Avatar with upload */}
            <div className="relative">
              <Avatar name={profile?.full_name} role={profile?.role} src={profile?.avatar_url} size="lg" />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-ink-900 text-white ring-2 ring-white hover:bg-ink-700 disabled:opacity-60"
                title="Upload profile image"
              >
                {uploading ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  uploadAvatar(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-lg font-semibold text-ink-900">{profile?.full_name || "Unassigned"}</h2>
              <div className="mt-1 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span className={classNames("badge", COLOR_CLASSES[role.color])}>{role.label}</span>
                <Badge tone="emerald">
                  <BadgeCheck size={11} /> {role.access}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-ink-500">{role.description}</p>
            </div>
          </div>

          <dl className="mt-5 grid gap-3 border-t border-ink-100 pt-5 sm:grid-cols-2">
            <InfoRow icon={Mail} label="Email" value={profile?.email} />
            <InfoRow icon={Building2} label="Department" value={profile?.department || "—"} />
            <InfoRow icon={ShieldCheck} label="Role key" value={profile?.role || "—"} mono />
            <InfoRow
              icon={BadgeCheck}
              label="Member since"
              value={formatDate(profile?.created_at || session?.user?.created_at)}
            />
          </dl>
        </SectionCard>

        <SectionCard
          title="Edit profile"
          subtitle="Only your own name and department can be changed. Role changes are restricted to executive administration."
        >
          <div className="space-y-4">
            <Field label="Full name">
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </Field>
            <Field label="Department / function">
              <Input value={department} onChange={(e) => setDepartment(e.target.value)} />
            </Field>
            <Field label="Role">
              <Input value={role.label} disabled />
            </Field>

            {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}
            {saved && <p className="text-xs font-medium text-emerald-600">Profile saved.</p>}

            <div className="flex items-center justify-between gap-3">
              <Button onClick={save} loading={saving}>
                Save changes
              </Button>
              <button
                onClick={signOut}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-600 hover:underline"
              >
                <LogOut size={15} /> Sign out
              </button>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Security">
          <ul className="space-y-2 text-sm text-ink-600">
            <li className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-emerald-600" /> Row Level Security enforces access to every table at the database level.
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-emerald-600" /> Only the anon key reaches the browser; the service-role key is never exposed.
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-emerald-600" /> Ordinary users cannot change their own role.
            </li>
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, mono }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-400">
        <Icon size={12} /> {label}
      </dt>
      <dd className={classNames("mt-0.5 text-sm text-ink-800", mono && "font-mono text-xs")}>
        {value || "—"}
      </dd>
    </div>
  );
}
