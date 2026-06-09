import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { Lock, Share2, Sparkles, ArrowRight, RotateCcw, Trophy, Globe2, Download, Copy, Check } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { CosmicBackground, SiteHeader } from "@/components/site-chrome";
import { CountUp } from "@/components/count-up";
import { calculateRarity, formatOneInX, getBadges, type RarityResult } from "@/lib/rarity/engine";
import { useAuth } from "@/hooks/use-auth";
import { saveResult, getMyLatestResult } from "@/lib/results.functions";
import { ARCHETYPES } from "@/lib/rarity/archetypes";
import { downloadShareCard, shareUrl, copyLink } from "@/lib/share";

export const Route = createFileRoute("/results")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Your Rarity — 1 in X" },
      { name: "description", content: "Your personal 1 in X rarity score and archetype." },
    ],
  }),
  component: Results,
});

function Results() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, string | number> | null>(null);
  const [serverResult, setServerResult] = useState<any>(null);
  const [hydrating, setHydrating] = useState(true);
  const saveFn = useServerFn(saveResult);
  const fetchLatest = useServerFn(getMyLatestResult);
  const savedRef = useRef(false);

  // load sessionStorage answers (from fresh assessment)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("rarity_answers");
      if (raw) setAnswers(JSON.parse(raw));
    } catch {}
  }, []);

  // load latest persisted result for signed-in user
  useEffect(() => {
    if (loading) return;
    if (!user) { setHydrating(false); return; }
    fetchLatest().then(({ result }) => {
      if (result) setServerResult(result);
      setHydrating(false);
    }).catch(() => setHydrating(false));
  }, [user, loading, fetchLatest]);

  const localResult = useMemo(() => answers ? calculateRarity(answers) : null, [answers]);

  // persist a freshly-computed result once after signin
  useEffect(() => {
    if (!user || !localResult || savedRef.current) return;
    if (sessionStorage.getItem("rarity_saved")) return;
    savedRef.current = true;
    saveFn({
      data: {
        answers: answers!,
        oneInX: localResult.oneInX,
        percentile: localResult.percentile,
        archetypeKey: localResult.archetype.id,
        traits: localResult.traits,
        confidence: localResult.confidence,
        modelVersion: localResult.modelVersion,
      },
    }).then(() => {
      sessionStorage.setItem("rarity_saved", "1");
      toast.success("Saved to your profile");
    }).catch((e) => {
      savedRef.current = false;
      toast.error(e?.message ?? "Could not save result");
    });
  }, [user, localResult, answers, saveFn]);

  // ---- render logic ----
  if (loading || hydrating) {
    return (
      <div className="grain relative min-h-screen">
        <CosmicBackground />
        <SiteHeader />
        <div className="mx-auto max-w-md px-6 py-32 text-center text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  // Have local answers but not signed in → gate behind auth
  if (!user && localResult) {
    return <GatePrompt result={localResult} />;
  }

  // No answers and no signed-in stored result
  if (!localResult && !serverResult) {
    return (
      <div className="grain relative min-h-screen">
        <CosmicBackground />
        <SiteHeader />
        <div className="mx-auto max-w-md px-6 py-32 text-center">
          <Sparkles className="mx-auto h-10 w-10 text-gold" />
          <h1 className="mt-6 font-display text-3xl font-semibold">No results yet</h1>
          <p className="mt-2 text-muted-foreground">Take the assessment to reveal your rarity.</p>
          <button
            onClick={() => navigate({ to: "/assessment" })}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-violet-magenta px-6 py-3 font-semibold text-white shadow-glow"
          >
            Start Assessment <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Prefer just-computed local result so first reveal animates; fallback to stored
  const result = localResult ?? hydrateFromServer(serverResult);
  return <ResultsView result={result!} username={profile?.username ?? null} tier={profile?.tier ?? "free"} />;
}

function hydrateFromServer(r: any): RarityResult {
  const archetype = ARCHETYPES[r.archetype_key] ?? ARCHETYPES.curious_thinker;
  return {
    oneInX: Number(r.one_in_x),
    percentile: Number(r.percentile),
    globalRarity: 100 - Number(r.percentile),
    countryRarity: 0,
    continentRarity: 0,
    traits: r.traits as any[],
    rarestTraits: [...r.traits].sort((a: any, b: any) => a.rarity - b.rarity).slice(0, 3),
    commonTraits: [...r.traits].sort((a: any, b: any) => b.rarity - a.rarity).slice(0, 3),
    archetype,
    archetypeRarity: 8,
    confidence: Number(r.confidence ?? 0.5),
    modelVersion: r.model_version ?? "hybrid-v1",
  };
}

function GatePrompt({ result }: { result: RarityResult }) {
  return (
    <div className="grain relative min-h-screen">
      <CosmicBackground />
      <SiteHeader />
      <main className="mx-auto max-w-md px-6 pb-24 pt-10">
        <div className="rounded-3xl glass-strong p-8 text-center shadow-card">
          <Sparkles className="mx-auto h-8 w-8 text-gold" />
          <h1 className="mt-4 font-display text-3xl font-semibold">Your results are ready</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create a free account to reveal your <span className="text-foreground">1 in X</span> score and claim your @handle.
          </p>
          <div className="my-6 rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Preview</div>
            <div className="mt-1 select-none font-display text-4xl font-bold text-gradient-cosmic blur-md">
              1 IN ••••
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Computed · {result.traits.length} traits analyzed
            </div>
          </div>
          <Link
            to="/auth"
            search={{ next: "/results", mode: "signup" }}
            className="block w-full rounded-full bg-gradient-violet-magenta px-5 py-3 text-sm font-semibold text-white shadow-glow"
          >
            Create free account to reveal
          </Link>
          <Link
            to="/auth"
            search={{ next: "/results", mode: "signin" }}
            className="mt-3 block text-xs text-muted-foreground underline"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </main>
    </div>
  );
}

const PLANS = [
  { id: "free", name: "Free", price: "$0", features: ["Rarity score", "Archetype", "Top traits", "Public profile"], cta: null },
  { id: "premium", name: "Premium", price: "$4.99", features: ["Detailed trait analysis", "Hidden strengths & weaknesses", "Downloadable PDF"], cta: "Unlock Premium" },
  { id: "pro", name: "Pro", price: "$9.99", features: ["Everything in Premium", "Celebrity matches", "Wealth & career signals", "Compare profiles"] , cta: "Unlock Pro"},
  { id: "ultimate", name: "Ultimate", price: "$19.99", features: ["Everything in Pro", "Relationship analysis", "Historical snapshots", "Save comparisons", "Priority support"], cta: "Unlock Ultimate" },
] as const;

export function ResultsView({ result, username, tier }: { result: RarityResult; username: string | null; tier: "free" | "premium" | "pro" | "ultimate" }) {
  const badges = getBadges(result);
  const oneInXFormatted = formatOneInX(result.oneInX);
  const cardRef = useRef<HTMLDivElement>(null);
  const shareText = `I'm 1 in ${oneInXFormatted} — rarer than ${result.percentile.toFixed(2)}% of people. Find your number on 1 in X.`;
  const shareLink = typeof window !== "undefined"
    ? (username ? `${window.location.origin}/u/${username}` : window.location.origin)
    : "";

  const unlocked = tier !== "free";

  async function handleDownload() {
    if (!cardRef.current) return;
    try {
      await downloadShareCard(cardRef.current, `1-in-${result.oneInX}.png`);
      toast.success("Share card downloaded");
    } catch (e: any) {
      toast.error("Could not generate image");
    }
  }

  async function handleCopy() {
    const ok = await copyLink(shareLink);
    if (ok) toast.success("Link copied");
  }

  function handleUpgrade(plan: string) {
    toast("Payments coming soon", {
      description: `${plan} unlock will be enabled when payments go live. Earn it free by referring friends.`,
    });
  }

  return (
    <div className="grain relative min-h-screen">
      <CosmicBackground />
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-6 pb-24 pt-6">
        {/* HERO RESULT — also the share card */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative mx-auto max-w-3xl"
        >
          <div ref={cardRef} className="relative rounded-3xl glass-strong p-8 text-center shadow-card sm:p-14">
            <div className="absolute -inset-px rounded-3xl bg-gradient-cosmic opacity-25 blur-2xl animate-pulse-glow" />
            <div className="relative">
              <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                {username ? `@${username} is` : "You are"}
              </div>
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 90 }}
                className="mt-4 font-display text-6xl font-bold text-gradient-cosmic sm:text-8xl"
              >
                1 IN {oneInXFormatted}
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-4 text-base text-muted-foreground sm:text-lg">
                Rarer than <span className="font-semibold text-foreground"><CountUp to={result.percentile} decimals={2} suffix="%" duration={1500} /></span> of people on Earth
              </motion.div>
              <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-6">
                <RarityStat label="Global" pct={result.globalRarity} />
                <RarityStat label="Continent" pct={result.continentRarity} />
                <RarityStat label="Country" pct={result.countryRarity} />
              </div>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-[11px] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                Based on global statistical estimates · confidence {Math.round(result.confidence * 100)}%
              </div>
            </div>
          </div>
        </motion.section>

        {/* ARCHETYPE */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }} className="mt-10">
          <div className="relative overflow-hidden rounded-3xl glass-strong p-8 shadow-card">
            <div className={`absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gradient-to-br ${result.archetype.gradient} opacity-30 blur-3xl`} />
            <div className="relative grid gap-6 sm:grid-cols-[auto,1fr] sm:items-center">
              <div className="grid h-24 w-24 place-items-center rounded-3xl bg-gradient-cosmic text-5xl shadow-glow">
                {result.archetype.emoji}
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Your archetype</div>
                <h2 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">{result.archetype.name}</h2>
                <p className="mt-2 text-base text-foreground/80 italic">"{result.archetype.tagline}"</p>
                <p className="mt-3 text-sm text-muted-foreground">{result.archetype.description}</p>
              </div>
            </div>
            <div className="relative mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-xs uppercase tracking-wider text-gold">Strengths</div>
                <ul className="mt-2 space-y-1 text-sm">
                  {result.archetype.strengths.map((s) => <li key={s} className="text-foreground/85">• {s}</li>)}
                </ul>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Watch-outs</div>
                <ul className="mt-2 space-y-1 text-sm">
                  {result.archetype.weaknesses.map((s) => <li key={s} className="text-foreground/70">• {s}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </motion.section>

        {/* TRAITS */}
        <section className="mt-10 grid gap-5 sm:grid-cols-2">
          <TraitPanel title="Your rarest traits" subtitle="Statistically unusual" tone="gold" traits={result.rarestTraits} />
          <TraitPanel title="Most common traits" subtitle="Shared with many" tone="muted" traits={result.commonTraits} />
        </section>

        {/* TRAIT BREAKDOWN */}
        <section className="mt-10 rounded-3xl glass-strong p-7 shadow-card">
          <h3 className="font-display text-xl font-semibold">Full trait breakdown</h3>
          <p className="mt-1 text-sm text-muted-foreground">Smaller bars mean rarer traits.</p>
          <div className="mt-6 space-y-3">
            {result.traits.map((t) => (
              <div key={t.id}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-foreground/90">{t.label} <span className="text-muted-foreground">· {t.answerLabel}</span></span>
                  <span className="font-mono text-xs text-muted-foreground">{t.rarity < 1 ? t.rarity.toFixed(2) : t.rarity.toFixed(1)}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, t.rarity)}%` }}
                    transition={{ duration: 0.9, delay: 0.05 }}
                    className={`h-full ${t.rarity < 5 ? "bg-gold" : t.rarity < 20 ? "bg-gradient-violet-magenta" : "bg-white/30"}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BADGES */}
        <section className="mt-10">
          <h3 className="font-display text-xl font-semibold">Achievements</h3>
          <div className="mt-4 flex flex-wrap gap-3">
            {badges.map((b) => (
              <div key={b.name} className="flex items-center gap-3 rounded-2xl glass px-4 py-3">
                <span className="text-2xl">{b.emoji}</span>
                <div>
                  <div className="text-sm font-semibold">{b.name}</div>
                  <div className="text-xs text-muted-foreground">{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PREMIUM LOCKED PREVIEW */}
        <section className="mt-12">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h3 className="font-display text-2xl font-semibold">Locked insights</h3>
              <p className="mt-1 text-sm text-muted-foreground">Upgrade or redeem a referral reward to unlock.</p>
            </div>
            <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">PREMIUM</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { t: "Detailed trait analysis", d: "Deep dive into every answer" },
              { t: "Hidden strengths", d: "Traits you're underusing" },
              { t: "Hidden weaknesses", d: "Blind spots to watch" },
              { t: "Wealth indicators", d: "Statistical career signals" },
              { t: "Career compatibility", d: "Fields that fit your profile" },
              { t: "Relationship analysis", d: "How you mesh with others" },
              { t: "Celebrity matches", d: "Public figures most like you" },
              { t: "Full personality report", d: "Deep psychological breakdown" },
              { t: "Statistical deep-dive", d: "Confidence + cohort comparisons" },
            ].map((c) => (
              <div key={c.t} className="relative overflow-hidden rounded-2xl glass p-5">
                <div className="pointer-events-none absolute inset-0 backdrop-blur-[2px] bg-background/20" />
                <div className="relative">
                  <Lock className="h-4 w-4 text-gold" />
                  <div className={`mt-3 font-semibold ${unlocked ? "" : "blur-[2px] select-none"}`}>{c.t}</div>
                  <div className={`mt-1 text-xs text-muted-foreground ${unlocked ? "" : "blur-[1.5px] select-none"}`}>{c.d}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PLAN CARDS */}
        <section className="mt-12">
          <h3 className="font-display text-2xl font-semibold text-center">Choose your plan</h3>
          <p className="mt-1 text-center text-sm text-muted-foreground">One-time payments · lifetime access</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((p) => {
              const isCurrent = tier === p.id;
              return (
                <div key={p.id} className={`relative rounded-2xl p-6 ${p.id === "ultimate" ? "glass-strong ring-1 ring-gold/40" : "glass"}`}>
                  {p.id === "ultimate" && <div className="absolute -top-2 right-4 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">Best value</div>}
                  <div className="text-sm font-medium text-muted-foreground">{p.name}</div>
                  <div className="mt-1 font-display text-3xl font-bold">{p.price}</div>
                  <ul className="mt-4 space-y-1.5 text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" /><span className="text-foreground/85">{f}</span></li>
                    ))}
                  </ul>
                  <div className="mt-5">
                    {isCurrent ? (
                      <div className="w-full rounded-full bg-white/5 px-4 py-2 text-center text-xs font-semibold text-muted-foreground">Current plan</div>
                    ) : p.cta ? (
                      <button onClick={() => handleUpgrade(p.name)} className="w-full rounded-full bg-gradient-violet-magenta px-4 py-2 text-sm font-semibold text-white shadow-glow">
                        {p.cta}
                      </button>
                    ) : (
                      <Link to="/assessment" className="block w-full rounded-full glass px-4 py-2 text-center text-sm font-medium">Get started</Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            💳 Cards · Apple Pay · Google Pay · <span className="text-gold">Crypto coming soon</span>
          </p>
        </section>

        {/* SHARE */}
        <section className="mt-12 rounded-3xl glass-strong p-8 text-center shadow-card">
          <Share2 className="mx-auto h-7 w-7 text-gold" />
          <h3 className="mt-3 font-display text-2xl font-semibold">Share your rarity</h3>
          <p className="mt-2 text-sm text-muted-foreground">Download a card or post directly.</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button onClick={handleDownload} className="inline-flex items-center gap-2 rounded-full bg-gradient-violet-magenta px-5 py-2.5 text-sm font-semibold text-white shadow-glow">
              <Download className="h-4 w-4" /> Download card
            </button>
            <a href={shareUrl("x", shareText, shareLink)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full glass px-5 py-2.5 text-sm font-medium">Share on X</a>
            <a href={shareUrl("whatsapp", shareText, shareLink)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full glass px-5 py-2.5 text-sm font-medium">WhatsApp</a>
            <a href={shareUrl("facebook", shareText, shareLink)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full glass px-5 py-2.5 text-sm font-medium">Facebook</a>
            <button onClick={handleCopy} className="inline-flex items-center gap-2 rounded-full glass px-5 py-2.5 text-sm font-medium">
              <Copy className="h-4 w-4" /> Copy link
            </button>
          </div>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/assessment" className="inline-flex items-center gap-2 rounded-full glass px-5 py-2 text-xs font-medium">
              <RotateCcw className="h-3.5 w-3.5" /> Retake
            </Link>
            <Link to="/referrals" className="inline-flex items-center gap-2 rounded-full glass px-5 py-2 text-xs font-medium">
              <Trophy className="h-3.5 w-3.5" /> Earn free upgrades
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

function RarityStat({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="rounded-2xl bg-white/5 p-4">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-xl font-semibold sm:text-2xl">
        {pct < 0.01 ? "<0.01%" : pct < 1 ? pct.toFixed(2) + "%" : pct.toFixed(1) + "%"}
      </div>
    </div>
  );
}

function TraitPanel({ title, subtitle, tone, traits }: {
  title: string; subtitle: string; tone: "gold" | "muted"; traits: { id: string; label: string; answerLabel: string; rarity: number }[];
}) {
  return (
    <div className="rounded-3xl glass-strong p-6 shadow-card">
      <div className="flex items-center gap-2">
        {tone === "gold" ? <Trophy className="h-4 w-4 text-gold" /> : <Globe2 className="h-4 w-4 text-muted-foreground" />}
        <h3 className="font-display text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
      <ul className="mt-4 space-y-3">
        {traits.map((t) => (
          <li key={t.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2.5">
            <div>
              <div className="text-sm font-medium">{t.label}</div>
              <div className="text-xs text-muted-foreground">{t.answerLabel}</div>
            </div>
            <div className={`text-sm font-mono ${tone === "gold" ? "text-gold" : "text-muted-foreground"}`}>
              {t.rarity < 1 ? t.rarity.toFixed(2) : t.rarity.toFixed(1)}%
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
