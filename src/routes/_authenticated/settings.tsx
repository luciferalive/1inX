import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { CosmicBackground, SiteHeader } from "@/components/site-chrome";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { deleteMyAccount, updatePrivacy } from "@/lib/account.functions";
import { Settings as SettingsIcon, Trash2, KeyRound, Bell, Shield, User as UserIcon, Eye } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — 1 in X" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState(profile?.username ?? "");
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [country, setCountry] = useState(profile?.country ?? "");
  const [pwd, setPwd] = useState("");
  const [busy, setBusy] = useState(false);

  // Privacy controls (synced from profile when loaded)
  const [profileVisibility, setProfileVisibility] = useState<"public" | "members" | "private">("public");
  const [resultVisibility, setResultVisibility] = useState<"private" | "link" | "public">("private");
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [allowSearch, setAllowSearch] = useState(true);

  // Notification prefs (client-side for now)
  const [emailMe, setEmailMe] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const p = profile as any;
    if (p.profile_visibility) setProfileVisibility(p.profile_visibility);
    if (p.result_visibility) setResultVisibility(p.result_visibility);
    if (typeof p.show_on_leaderboard === "boolean") setShowLeaderboard(p.show_on_leaderboard);
    if (typeof p.allow_search === "boolean") setAllowSearch(p.allow_search);
  }, [profile]);

  const savePrivacy = useServerFn(updatePrivacy);
  const wipeAccount = useServerFn(deleteMyAccount);

  async function patchPrivacy(patch: Record<string, any>) {
    try {
      await savePrivacy({ data: patch });
      await refreshProfile();
      toast.success("Privacy updated");
    } catch (e: any) {
      toast.error(e?.message ?? "Could not save");
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      const u = username.toLowerCase().trim();
      if (!/^[a-z0-9_]{3,20}$/.test(u)) throw new Error("Username must be 3–20 chars (a–z, 0–9, _)");
      const { error } = await supabase
        .from("profiles")
        .update({ username: u, display_name: displayName || null, bio: bio || null, country: country || null })
        .eq("id", user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success("Profile updated");
    } catch (e: any) {
      toast.error(e?.message ?? "Could not save");
    } finally {
      setBusy(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwd.length < 8) { toast.error("Password must be 8+ chars"); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pwd });
      if (error) throw error;
      setPwd("");
      toast.success("Password updated");
    } catch (e: any) {
      toast.error(e?.message ?? "Could not update password");
    } finally {
      setBusy(false);
    }
  }

  async function deleteAccount() {
    if (!confirm("Delete your account permanently? This cannot be undone.")) return;
    if (!confirm("Are you absolutely sure? All your results, profile, and referrals will be removed.")) return;
    setBusy(true);
    try {
      await wipeAccount({ data: undefined as any });
      await signOut();
      toast.success("Account deleted");
      navigate({ to: "/" });
    } catch (e: any) {
      toast.error(e?.message ?? "Could not delete account — contact hello@1inx.app");
    } finally {
      setBusy(false);
    }
  }
      setBusy(false);
    }
  }

  return (
    <div className="grain relative min-h-screen">
      <CosmicBackground />
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-6">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-gold" />
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">Settings</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">Account, security, privacy.</p>

        {/* Profile */}
        <Section icon={<UserIcon className="h-4 w-4" />} title="Profile">
          <form onSubmit={saveProfile} className="space-y-3">
            <Field label="Username">
              <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-3">
                <span className="text-muted-foreground">@</span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  className="w-full bg-transparent px-2 py-2.5 text-sm outline-none"
                />
              </div>
            </Field>
            <Field label="Display name">
              <input
                value={displayName ?? ""}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Optional"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none"
              />
            </Field>
            <Field label="Country">
              <input
                value={country ?? ""}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. Canada"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none"
              />
            </Field>
            <Field label="Bio">
              <textarea
                value={bio ?? ""}
                onChange={(e) => setBio(e.target.value.slice(0, 200))}
                placeholder="A line about you"
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none"
              />
              <div className="mt-1 text-right text-[10px] text-muted-foreground">{(bio ?? "").length}/200</div>
            </Field>
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-gradient-violet-magenta px-5 py-2.5 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
            >
              {busy ? "Saving…" : "Save profile"}
            </button>
          </form>
        </Section>

        <Section icon={<KeyRound className="h-4 w-4" />} title="Password">
          <form onSubmit={changePassword} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Field label="New password" className="flex-1">
              <input
                type="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                placeholder="At least 8 characters"
                minLength={8}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none"
              />
            </Field>
            <button
              type="submit"
              disabled={busy || pwd.length < 8}
              className="rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
            >
              Update
            </button>
          </form>
        </Section>

        <Section icon={<Bell className="h-4 w-4" />} title="Notifications">
          <Toggle
            label="Email me when someone follows me or shares my profile"
            checked={emailMe}
            onChange={setEmailMe}
          />
        </Section>

        <Section icon={<Eye className="h-4 w-4" />} title="Profile visibility">
          <div className="space-y-2">
            {([
              ["public", "Public", "Anyone can view your profile."],
              ["members", "Members only", "Only signed-in members can view your profile."],
              ["private", "Private", "Only you can view your profile."],
            ] as const).map(([val, label, desc]) => (
              <button
                key={val}
                type="button"
                onClick={() => { setProfileVisibility(val); patchPrivacy({ profile_visibility: val }); }}
                className={`flex w-full items-start justify-between gap-3 rounded-xl border p-3 text-left text-sm transition ${profileVisibility === val ? "border-white/40 bg-white/10" : "border-white/10 bg-white/5"}`}
              >
                <div>
                  <div className="font-medium">{label}</div>
                  <div className="text-xs text-muted-foreground">{desc}</div>
                </div>
                <div className={`mt-1 h-4 w-4 rounded-full border ${profileVisibility === val ? "border-fuchsia-400 bg-fuchsia-500" : "border-white/30"}`} />
              </button>
            ))}
          </div>
        </Section>

        <Section icon={<Shield className="h-4 w-4" />} title="Result visibility">
          <div className="space-y-2">
            {([
              ["private", "Private", "Only you can see your full result."],
              ["link", "Shareable link", "Anyone with your share link can see a summary."],
              ["public", "On my public profile", "Show a summary on your public profile."],
            ] as const).map(([val, label, desc]) => (
              <button
                key={val}
                type="button"
                onClick={() => { setResultVisibility(val); patchPrivacy({ result_visibility: val }); }}
                className={`flex w-full items-start justify-between gap-3 rounded-xl border p-3 text-left text-sm transition ${resultVisibility === val ? "border-white/40 bg-white/10" : "border-white/10 bg-white/5"}`}
              >
                <div>
                  <div className="font-medium">{label}</div>
                  <div className="text-xs text-muted-foreground">{desc}</div>
                </div>
                <div className={`mt-1 h-4 w-4 rounded-full border ${resultVisibility === val ? "border-fuchsia-400 bg-fuchsia-500" : "border-white/30"}`} />
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Your raw assessment answers are never made public, regardless of this setting.
          </p>
        </Section>

        <Section icon={<Shield className="h-4 w-4" />} title="Discoverability">
          <Toggle
            label="Show me on Leaderboards"
            checked={showLeaderboard}
            onChange={(v) => { setShowLeaderboard(v); patchPrivacy({ show_on_leaderboard: v }); }}
          />
          <div className="h-2" />
          <Toggle
            label="Allow my profile to appear in Search & Discover"
            checked={allowSearch}
            onChange={(v) => { setAllowSearch(v); patchPrivacy({ allow_search: v }); }}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Your @handle stays reserved either way. <Link to="/privacy" className="underline">Privacy Policy</Link>.
          </p>
        </Section>

        <Section icon={<Trash2 className="h-4 w-4 text-destructive" />} title="Danger zone">
          <p className="text-sm text-muted-foreground">
            Permanently delete your account, results, and profile. Cannot be undone.
          </p>
          <button
            onClick={deleteAccount}
            disabled={busy}
            className="mt-3 rounded-full bg-destructive/90 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            Delete account
          </button>
        </Section>

        <div className="mt-10 text-center text-xs text-muted-foreground">
          Need help? <Link to="/help" className="underline">Read FAQs</Link> or email hello@1inx.app.
        </div>
      </main>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 rounded-3xl glass-strong p-6 shadow-card">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {icon} {title}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (b: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm"
    >
      <span>{label}</span>
      <span className={`relative h-6 w-10 rounded-full transition ${checked ? "bg-gradient-violet-magenta" : "bg-white/15"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${checked ? "left-[1.125rem]" : "left-0.5"}`} />
      </span>
    </button>
  );
}
