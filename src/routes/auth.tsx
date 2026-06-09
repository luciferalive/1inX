import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { CosmicBackground, SiteHeader } from "@/components/site-chrome";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { getReferralId, clearReferral } from "@/lib/referral";
import { Sparkles } from "lucide-react";

const searchSchema = z.object({
  next: z.string().optional(),
  mode: z.enum(["signin", "signup"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — 1 in X" },
      { name: "description", content: "Create your free account to reveal your rarity." },
    ],
  }),
  component: AuthPage,
});

const usernameRegex = /^[a-z0-9_]{3,20}$/;

function AuthPage() {
  const { next, mode } = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const [tab, setTab] = useState<"signin" | "signup">(mode ?? "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleGoogle() {
    setBusy(true);
    try {
      const referredBy = getReferralId();
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + (next ?? "/results"),
        extraParams: referredBy ? { referred_by: referredBy } : undefined,
      });
      if (result.error) {
        toast.error("Sign-in failed", { description: String(result.error.message ?? result.error) });
        setBusy(false);
        return;
      }
      if (result.redirected) return;
      clearReferral();
      navigate({ to: (next ?? "/results") as "/results" });
    } catch (e: any) {
      toast.error(e?.message ?? "Sign-in failed");
      setBusy(false);
    }
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (tab === "signup") {
        if (!usernameRegex.test(username)) {
          toast.error("Username must be 3–20 chars (a–z, 0–9, _)");
          setBusy(false);
          return;
        }
        const referredBy = getReferralId();
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + (next ?? "/results"),
            data: { username, referred_by: referredBy ?? undefined },
          },
        });
        if (error) throw error;
        clearReferral();
        toast.success("Account created — welcome!");
        navigate({ to: (next ?? "/results") as "/results" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
        navigate({ to: (next ?? "/results") as "/results" });
      }
    } catch (e: any) {
      const msg = e?.message ?? "Something went wrong";
      if (msg.includes("duplicate") || msg.includes("unique")) {
        toast.error("That username is taken — pick another");
      } else {
        toast.error(msg);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grain relative min-h-screen">
      <CosmicBackground />
      <SiteHeader />
      <main className="mx-auto max-w-md px-6 pb-24 pt-8">
        <div className="rounded-3xl glass-strong p-8 shadow-card">
          <div className="text-center">
            <Sparkles className="mx-auto h-7 w-7 text-gold" />
            <h1 className="mt-4 font-display text-2xl font-semibold sm:text-3xl">
              {next === "/results" ? "Create a free account to reveal your results" : tab === "signup" ? "Create your account" : "Welcome back"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Save your rarity, claim your @handle, earn referral rewards.
            </p>
          </div>

          <button
            onClick={handleGoogle}
            disabled={busy}
            className="mt-7 flex w-full items-center justify-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-white/90 disabled:opacity-60"
          >
            <GoogleLogo /> Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-white/10" />
            <span>or with email</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="mb-4 flex gap-1 rounded-full bg-white/5 p-1 text-sm">
            <button
              onClick={() => setTab("signup")}
              className={`flex-1 rounded-full px-3 py-1.5 transition ${tab === "signup" ? "bg-gradient-violet-magenta text-white" : "text-muted-foreground"}`}
            >
              Sign up
            </button>
            <button
              onClick={() => setTab("signin")}
              className={`flex-1 rounded-full px-3 py-1.5 transition ${tab === "signin" ? "bg-gradient-violet-magenta text-white" : "text-muted-foreground"}`}
            >
              Sign in
            </button>
          </div>

          <form onSubmit={handleEmail} className="space-y-3">
            {tab === "signup" && (
              <div>
                <label className="text-xs text-muted-foreground">Username</label>
                <div className="mt-1 flex items-center rounded-xl border border-white/10 bg-white/5 px-3 focus-within:border-white/30">
                  <span className="text-muted-foreground">@</span>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    placeholder="shadowfox"
                    autoComplete="username"
                    className="w-full bg-transparent px-2 py-2.5 text-sm outline-none"
                    required
                  />
                </div>
              </div>
            )}
            <div>
              <label className="text-xs text-muted-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-white/30"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete={tab === "signup" ? "new-password" : "current-password"}
                minLength={8}
                required
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-white/30"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="mt-2 w-full rounded-full bg-gradient-violet-magenta px-5 py-3 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
            >
              {busy ? "Working…" : tab === "signup" ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            By continuing you agree to our terms. <Link to="/" className="underline">Cancel</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#EA4335" d="M12 11v3.2h5.4c-.2 1.4-1.6 4-5.4 4-3.2 0-5.8-2.7-5.8-6s2.6-6 5.8-6c1.8 0 3 .8 3.7 1.4l2.5-2.4C16.6 3.6 14.5 2.8 12 2.8 6.9 2.8 2.8 6.9 2.8 12s4.1 9.2 9.2 9.2c5.3 0 8.8-3.7 8.8-9 0-.6-.1-1-.1-1.4H12z" />
    </svg>
  );
}
