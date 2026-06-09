import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { CosmicBackground, SiteHeader } from "@/components/site-chrome";
import { getReferralStats, consumeReward } from "@/lib/results.functions";
import { useAuth } from "@/hooks/use-auth";
import { Copy, Gift, Users, Sparkles } from "lucide-react";
import { copyLink } from "@/lib/share";

export const Route = createFileRoute("/_authenticated/referrals")({
  head: () => ({ meta: [{ title: "Referrals — 1 in X" }] }),
  component: ReferralsPage,
});

const TIERS = [
  { count: 3, tier: "premium", label: "Premium report" },
  { count: 5, tier: "pro", label: "Pro report" },
  { count: 10, tier: "ultimate", label: "Ultimate report" },
] as const;

function ReferralsPage() {
  const { profile } = useAuth();
  const fetchStats = useServerFn(getReferralStats);
  const consumeFn = useServerFn(consumeReward);
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["referral-stats"],
    queryFn: () => fetchStats(),
  });

  const consume = useMutation({
    mutationFn: (rewardId: string) => consumeFn({ data: { rewardId } }),
    onSuccess: () => {
      toast.success("Reward applied — premium content unlocked for this view");
      qc.invalidateQueries({ queryKey: ["referral-stats"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not redeem"),
  });

  const verified = data?.verified ?? 0;
  const pending = data?.pending ?? 0;
  const rewards = data?.rewards ?? [];
  const unconsumed = rewards.filter((r: any) => !r.consumed_at);

  const refLink = profile ? `${typeof window !== "undefined" ? window.location.origin : ""}/?ref=${profile.id}` : "";

  return (
    <div className="grain relative min-h-screen">
      <CosmicBackground />
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-6">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Referrals</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Invite friends to unlock premium reports — every reward is single-use.
        </p>

        <div className="mt-8 rounded-2xl glass-strong p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Your invite link</div>
          <div className="mt-2 flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2.5 text-sm">
            <span className="flex-1 truncate font-mono text-foreground/90">{refLink || "Sign in to get your link"}</span>
            <button
              onClick={async () => {
                if (!refLink) return;
                const ok = await copyLink(refLink);
                if (ok) toast.success("Link copied");
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-violet-magenta px-3 py-1.5 text-xs font-semibold text-white"
            >
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Stat icon={<Users className="h-4 w-4 text-gold" />} label="Verified" value={verified} />
          <Stat icon={<Sparkles className="h-4 w-4 text-muted-foreground" />} label="Pending" value={pending} />
          <Stat icon={<Gift className="h-4 w-4 text-gold" />} label="Rewards available" value={unconsumed.length} />
        </div>

        <h2 className="mt-10 font-display text-xl font-semibold">Progress</h2>
        <div className="mt-3 space-y-3">
          {TIERS.map((t) => {
            const cycle = verified % t.count;
            const pct = (cycle / t.count) * 100;
            return (
              <div key={t.count} className="rounded-2xl glass p-4">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium">Invite {t.count} → {t.label}</span>
                  <span className="font-mono text-xs text-muted-foreground">{cycle} / {t.count}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full bg-gradient-violet-magenta" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <h2 className="mt-10 font-display text-xl font-semibold">Your rewards</h2>
        {rewards.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No rewards yet — invite 3 friends for your first Premium report.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {rewards.map((r: any, i: number) => (
              <li key={i} className="flex items-center justify-between rounded-xl glass px-4 py-3 text-sm">
                <div>
                  <div className="font-medium capitalize">{r.tier} report</div>
                  <div className="text-xs text-muted-foreground">
                    {r.consumed_at ? `Used ${new Date(r.consumed_at).toLocaleDateString()}` : `Earned ${new Date(r.created_at).toLocaleDateString()}`}
                  </div>
                </div>
                {!r.consumed_at && (
                  <button
                    onClick={() => consume.mutate(r.id)}
                    disabled={consume.isPending}
                    className="rounded-full bg-gradient-violet-magenta px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    Redeem
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-10 text-center">
          <Link to="/results" className="text-sm text-muted-foreground underline">Back to results</Link>
        </div>
      </main>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl glass p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon}{label}</div>
      <div className="mt-1 font-display text-2xl font-semibold">{value}</div>
    </div>
  );
}
