import { createFileRoute, Link } from "@tanstack/react-router";
import { CosmicBackground, SiteHeader } from "@/components/site-chrome";
import { Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/plans")({
  head: () => ({
    meta: [
      { title: "Plans & Pricing — 1 in X" },
      { name: "description", content: "Unlock deeper insights with a one-time purchase." },
    ],
  }),
  component: PlansPage,
});

const PLANS = [
  {
    id: "free", name: "Free", price: "$0",
    blurb: "Your rarity score and archetype.",
    features: ["Rarity score", "Archetype", "Top traits", "Public profile"],
    accent: "from-white/10 to-white/5",
  },
  {
    id: "premium", name: "Premium", price: "$4.99",
    blurb: "Your hidden strengths and weaknesses.",
    features: ["Detailed trait analysis", "Hidden strengths", "Hidden weaknesses", "Downloadable PDF"],
    accent: "from-violet-500/30 to-fuchsia-500/30",
  },
  {
    id: "pro", name: "Pro", price: "$9.99",
    blurb: "Celebrity matches + career signals.",
    features: ["Everything in Premium", "Celebrity matches", "Wealth & career signals", "Compare profiles"],
    accent: "from-amber-400/30 to-rose-500/30",
    popular: true,
  },
  {
    id: "ultimate", name: "Ultimate", price: "$19.99",
    blurb: "Lifetime — the full report.",
    features: ["Everything in Pro", "Relationship analysis", "Saved comparisons", "Historical snapshots", "Priority support"],
    accent: "from-emerald-400/30 to-cyan-500/30",
  },
] as const;

function PlansPage() {
  function onUpgrade(p: string) {
    toast("Payments coming soon", {
      description: `${p} unlocks when payments go live. Earn it free with referrals — see /referrals.`,
    });
  }

  return (
    <div className="grain relative min-h-screen">
      <CosmicBackground />
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-6">
        <div className="text-center">
          <Sparkles className="mx-auto h-8 w-8 text-gold" />
          <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Plans & Pricing</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            One-time payments. Lifetime access. No subscriptions.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className={`relative overflow-hidden rounded-3xl glass-strong p-6 ${p.popular ? "ring-2 ring-gold/60" : ""}`}
            >
              <div className={`absolute -right-16 -top-16 h-44 w-44 rounded-full bg-gradient-to-br ${p.accent} opacity-60 blur-3xl`} />
              {p.popular && (
                <div className="absolute right-4 top-4 rounded-full bg-gold/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-900">
                  Most popular
                </div>
              )}
              <div className="relative">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{p.name}</div>
                <div className="mt-1 font-display text-4xl font-bold">{p.price}</div>
                <p className="mt-1 text-xs text-muted-foreground">{p.blurb}</p>
                <ul className="mt-5 space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-gold flex-shrink-0" />
                      <span className="text-foreground/85">{f}</span>
                    </li>
                  ))}
                </ul>
                {p.id === "free" ? (
                  <Link
                    to="/assessment"
                    className="mt-6 block rounded-full bg-white/10 px-4 py-2.5 text-center text-sm font-semibold"
                  >
                    Start free
                  </Link>
                ) : (
                  <button
                    onClick={() => onUpgrade(p.name)}
                    className="mt-6 w-full rounded-full bg-gradient-violet-magenta px-4 py-2.5 text-sm font-semibold text-white shadow-glow"
                  >
                    Unlock {p.name}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Or earn unlocks free — invite friends from <Link to="/referrals" className="underline">/referrals</Link>.
        </p>
      </main>
    </div>
  );
}
