import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Lock, Share2, Sparkles, ArrowRight, RotateCcw, Trophy, Globe2 } from "lucide-react";
import { CosmicBackground, SiteHeader } from "@/components/site-chrome";
import { CountUp } from "@/components/count-up";
import { calculateRarity, formatOneInX, getBadges, type RarityResult } from "@/lib/rarity/engine";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Your Rarity — 1 in X" },
      { name: "description", content: "Your personal 1 in X rarity score and archetype." },
    ],
  }),
  component: Results,
});

function Results() {

  const [answers, setAnswers] = useState<Record<string, string | number> | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("rarity_answers");
      if (raw) setAnswers(JSON.parse(raw));
      else setAnswers(null);
    } catch { setAnswers(null); }
  }, []);

  const result = useMemo(() => answers ? calculateRarity(answers) : null, [answers]);

  if (answers === null) {
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

  return <ResultsView result={result!} />;
}

export function ResultsView({ result }: { result: RarityResult }) {
  const badges = getBadges(result);
  const oneInXFormatted = formatOneInX(result.oneInX);

  return (
    <div className="grain relative min-h-screen">
      <CosmicBackground />
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-6 pb-24 pt-6">
        {/* HERO RESULT */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative mx-auto max-w-3xl"
        >
          <div className="relative rounded-3xl glass-strong p-8 text-center shadow-card sm:p-14">
            <div className="absolute -inset-px rounded-3xl bg-gradient-cosmic opacity-25 blur-2xl animate-pulse-glow" />
            <div className="relative">
              <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">You are</div>
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 90 }}
                className="mt-4 font-display text-6xl font-bold text-gradient-cosmic sm:text-8xl"
              >
                1 IN {oneInXFormatted}
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="mt-4 text-base text-muted-foreground sm:text-lg"
              >
                Rarer than <span className="font-semibold text-foreground"><CountUp to={result.percentile} decimals={2} suffix="%" duration={1500} /></span> of people on Earth
              </motion.div>

              <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-6">
                <RarityStat label="Global" pct={result.globalRarity} />
                <RarityStat label="Continent" pct={result.continentRarity} />
                <RarityStat label="Country" pct={result.countryRarity} />
              </div>
            </div>
          </div>
        </motion.section>

        {/* ARCHETYPE */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-10"
        >
          <div className={`relative overflow-hidden rounded-3xl glass-strong p-8 shadow-card`}>
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

        {/* PREMIUM UPSELL */}
        <section className="mt-12">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h3 className="font-display text-2xl font-semibold">Unlock the full picture</h3>
              <p className="mt-1 text-sm text-muted-foreground">Go deeper with Premium · one-time payment</p>
            </div>
            <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">PREMIUM</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { t: "Full personality profile", d: "Deep psychological breakdown" },
              { t: "Hidden strengths", d: "Traits you're underusing" },
              { t: "Celebrity matches", d: "Public figures most like you" },
              { t: "Compatibility analysis", d: "How you mesh with others" },
              { t: "Wealth & career indicators", d: "Statistical career signals" },
              { t: "PDF report", d: "Beautiful, downloadable, shareable" },
            ].map((c) => (
              <div key={c.t} className="relative overflow-hidden rounded-2xl glass p-5">
                <div className="pointer-events-none absolute inset-0 backdrop-blur-[2px] bg-background/20" />
                <div className="relative">
                  <Lock className="h-4 w-4 text-gold" />
                  <div className="mt-3 font-semibold blur-[2px] select-none">{c.t}</div>
                  <div className="mt-1 text-xs text-muted-foreground blur-[1.5px] select-none">{c.d}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-2xl bg-gradient-violet-magenta/10 p-5 sm:flex-row">
            <div className="text-sm">
              <span className="font-semibold">Premium</span> · $4.99 one-time ·
              <span className="text-muted-foreground"> Lifetime access</span>
            </div>
            <button className="rounded-full bg-gradient-violet-magenta px-6 py-2.5 text-sm font-semibold text-white shadow-glow">
              Unlock Premium
            </button>
          </div>
        </section>

        {/* SHARE */}
        <section className="mt-12 rounded-3xl glass-strong p-8 text-center shadow-card">
          <Share2 className="mx-auto h-7 w-7 text-gold" />
          <h3 className="mt-3 font-display text-2xl font-semibold">Share your rarity</h3>
          <p className="mt-2 text-sm text-muted-foreground">Generate a screenshot-worthy card for Instagram, X, or anywhere.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button className="rounded-full bg-gradient-violet-magenta px-6 py-2.5 text-sm font-semibold text-white shadow-glow">Download share card</button>
            <Link to="/assessment" className="inline-flex items-center gap-2 rounded-full glass px-6 py-2.5 text-sm font-medium">
              <RotateCcw className="h-4 w-4" /> Retake
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
