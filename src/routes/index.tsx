import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, Sparkles, Globe2, Trophy, Share2 } from "lucide-react";
import { CosmicBackground, SiteHeader } from "@/components/site-chrome";
import { CountUp } from "@/components/count-up";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "1 in X — Discover How Rare You Really Are" },
      { name: "description", content: "Take a 5-minute assessment and find out your 1 in X rarity score, archetype, and trait analysis." },
      { property: "og:title", content: "1 in X — Discover How Rare You Really Are" },
      { property: "og:description", content: "Compare yourself against millions. Discover how unique your life truly is." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="grain relative min-h-screen overflow-hidden">
      <CosmicBackground />
      <SiteHeader />

      {/* HERO */}
      <section className="relative mx-auto max-w-6xl px-6 pt-12 pb-20 text-center sm:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-muted-foreground"
        >
          <Sparkles className="h-3.5 w-3.5 text-gold" />
          The Human Rarity Index · launching globally
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl"
        >
          Discover how <span className="text-gradient-cosmic">rare</span><br />
          you really are.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg"
        >
          Compare yourself against millions of people and uncover how unique your life,
          skills, experiences, and personality truly are.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            to="/assessment"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-violet-magenta px-7 py-3.5 text-base font-semibold text-white shadow-glow transition hover:scale-[1.03]"
          >
            Start Free Assessment
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
          <Link
            to="/sample"
            className="inline-flex items-center gap-2 rounded-full glass px-7 py-3.5 text-base font-medium text-foreground hover:bg-white/5"
          >
            View Sample Results
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-5 text-xs text-muted-foreground"
        >
          Free · No signup required · ~5 minutes
        </motion.p>

        {/* Stats */}
        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-3 sm:gap-6">
          {[
            { label: "Total Users", value: 184_217, suffix: "" },
            { label: "Countries", value: 162, suffix: "" },
            { label: "Assessments", value: 412_980, suffix: "" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl glass p-5">
              <div className="font-display text-2xl font-semibold text-gradient-cosmic sm:text-4xl">
                <CountUp to={s.value} />
                {s.suffix}
              </div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Hero sample card */}
        <SampleCard />
      </section>

      {/* HOW IT WORKS */}
      <section className="relative mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center font-display text-3xl font-semibold sm:text-5xl">
          Three steps to <span className="text-gradient-cosmic">your number</span>
        </h2>
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {[
            { i: "01", t: "Answer", d: "40+ questions about your life, skills, traits, and habits.", icon: Sparkles },
            { i: "02", t: "Calculate", d: "Our rarity engine compares you against global population data.", icon: Globe2 },
            { i: "03", t: "Share", d: "Get your archetype, score, and a screenshot-worthy share card.", icon: Share2 },
          ].map((s) => (
            <div key={s.i} className="rounded-3xl glass p-7 transition hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <span className="font-display text-sm text-muted-foreground">{s.i}</span>
                <s.icon className="h-5 w-5 text-gold" />
              </div>
              <h3 className="mt-6 font-display text-xl font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center font-display text-3xl font-semibold sm:text-4xl">
          People are obsessed.
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { q: "I genuinely didn't realize how unusual my life was until I saw the number.", a: "@shadowfox", r: "1 in 12,450" },
            { q: "The archetype description felt scarily accurate. Sent it to everyone I know.", a: "@mariak", r: "1 in 3,201" },
            { q: "Better than any personality test I've taken. The share card is gorgeous.", a: "@devdani", r: "1 in 8,118" },
          ].map((t, i) => (
            <div key={i} className="rounded-2xl glass p-6">
              <p className="text-sm text-foreground/90">"{t.q}"</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{t.a}</span>
                <span className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-medium text-gold">{t.r}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-3xl px-6 py-24 text-center">
        <div className="rounded-3xl glass-strong p-10 shadow-card sm:p-14">
          <Trophy className="mx-auto h-8 w-8 text-gold" />
          <h2 className="mt-4 font-display text-3xl font-semibold sm:text-5xl">
            What's your <span className="text-gradient-cosmic">1 in X</span>?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Find out in 5 minutes. Free, no account needed.
          </p>
          <Link
            to="/assessment"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-violet-magenta px-7 py-3.5 text-base font-semibold text-white shadow-glow transition hover:scale-[1.03]"
          >
            Start Free Assessment
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="relative mx-auto max-w-6xl px-6 py-10 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} 1 in X — The Human Rarity Index
      </footer>
    </div>
  );
}

function SampleCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.35 }}
      className="mx-auto mt-16 max-w-md"
    >
      <div className="relative rounded-3xl glass-strong p-8 shadow-card">
        <div className="absolute -inset-px rounded-3xl bg-gradient-cosmic opacity-20 blur-2xl animate-pulse-glow" />
        <div className="relative">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">You are</div>
          <div className="mt-3 font-display text-6xl font-bold text-gradient-cosmic sm:text-7xl">
            1 in 8,250
          </div>
          <div className="mt-2 text-sm text-muted-foreground">Rarer than 98.79% of people</div>
          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
            <div className="text-left">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Archetype</div>
              <div className="font-display text-lg font-semibold">Visionary Operator 🚀</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Top</div>
              <div className="font-display text-lg font-semibold text-gold">1.2%</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
