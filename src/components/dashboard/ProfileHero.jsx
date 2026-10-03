import { useRef, useState } from "react";
import { Camera, Loader2, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "../../hooks/useAuth";
import { getRole, COLOR_CLASSES } from "../../lib/roles";
import { classNames } from "../../lib/utils";
import { supabase } from "../../lib/supabase";
import { Avatar } from "../common/Avatar";

/**
 * ProfileHero — a founder's image slot shown at the top of their dashboard.
 *
 * Allocates a fixed, designed space for the founder's photo so real images can
 * be dropped in. If no image is set, a large initials avatar holds the space and
 * a camera button uploads one to the avatars storage bucket.
 */
export function ProfileHero({ profile, subtitle }) {
  const { updateOwnProfile } = useApp();
  const role = getRole(profile?.role);
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const upload = async (file) => {
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
      await updateOwnProfile({ avatar_url: `${data.publicUrl}?v=${Date.now()}` });
    } catch (e) {
      setError(e?.message || "Could not upload image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card overflow-hidden">
      <div className="relative h-24 bg-gradient-to-r from-ink-950 via-ink-900 to-brand-900 sm:h-28" />
      <div className="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end">
        {/* Allocated image slot */}
        <div className="relative -mt-12 shrink-0 sm:-mt-14">
          <div className="rounded-2xl bg-white p-1.5 shadow-card">
            <div className="h-24 w-24 overflow-hidden rounded-xl bg-ink-100 sm:h-28 sm:w-28">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile?.full_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Avatar name={profile?.full_name} role={profile?.role} size="lg" />
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-ink-900 text-white ring-2 ring-white hover:bg-ink-700 disabled:opacity-60"
            title="Upload profile image"
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              upload(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>

        <div className="min-w-0 flex-1 sm:pb-1">
          <h1 className="truncate text-xl font-semibold text-ink-900 sm:text-2xl">
            {profile?.full_name || "Unassigned"}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className={classNames("badge", COLOR_CLASSES[role.color])}>{role.label}</span>
            <span className="inline-flex items-center gap-1 text-xs text-ink-500">
              <ShieldCheck size={12} /> {role.access}
            </span>
          </div>
          {subtitle && <p className="mt-1.5 max-w-2xl text-sm text-ink-500">{subtitle}</p>}
          {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
        </div>

        <Link
          to="/profile"
          className="shrink-0 self-start rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 hover:bg-ink-50 sm:self-auto"
        >
          Edit profile & image
        </Link>
      </div>
    </div>
  );
}
