import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { CosmicBackground, SiteHeader } from "@/components/site-chrome";
import { QUESTIONS, type Question } from "@/lib/rarity/questions";

export const Route = createFileRoute("/assessment")({
  head: () => ({
    meta: [
      { title: "Assessment — 1 in X" },
      { name: "description", content: "Answer a few questions to discover your rarity score." },
    ],
  }),
  component: Assessment,
});

function Assessment() {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});

  const q = QUESTIONS[idx];
  const progress = ((idx + 1) / QUESTIONS.length) * 100;
  const value = answers[q.id];
  const canNext = value !== undefined && value !== "";

  function next() {
    if (idx === QUESTIONS.length - 1) {
      try {
        sessionStorage.setItem("rarity_answers", JSON.stringify(answers));
      } catch {}
      navigate({ to: "/results" });
      return;
    }
    setIdx((i) => Math.min(QUESTIONS.length - 1, i + 1));
  }

  function prev() {
    setIdx((i) => Math.max(0, i - 1));
  }

  return (
    <div className="grain relative min-h-screen">
      <CosmicBackground />
      <SiteHeader />

      <main className="mx-auto max-w-2xl px-6 pb-24 pt-6">
        {/* Progress */}
        <div className="mb-10">
          <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>{q.category}</span>
            <span>{idx + 1} / {QUESTIONS.length}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
            <motion.div
              className="h-full bg-gradient-cosmic"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 80, damping: 20 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">{q.label}</h2>
            <div className="mt-8">
              <QuestionInput
                q={q}
                value={value}
                onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
                onSubmit={() => canNext && next()}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 flex items-center justify-between">
          <button
            onClick={prev}
            disabled={idx === 0}
            className="inline-flex items-center gap-2 rounded-full glass px-5 py-2.5 text-sm font-medium text-foreground disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <button
            onClick={next}
            disabled={!canNext}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-violet-magenta px-6 py-2.5 text-sm font-semibold text-white shadow-glow transition enabled:hover:scale-[1.03] disabled:opacity-40"
          >
            {idx === QUESTIONS.length - 1 ? "Reveal my rarity" : "Next"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </main>
    </div>
  );
}

function QuestionInput({
  q, value, onChange, onSubmit,
}: { q: Question; value: string | number | undefined; onChange: (v: string | number) => void; onSubmit: () => void }) {
  if (q.type === "select" && q.options) {
    return (
      <div className="grid gap-2.5">
        {q.options.map((o) => {
          const selected = value === o.value;
          return (
            <button
              key={o.value}
              onClick={() => onChange(o.value)}
              className={`group flex items-center justify-between rounded-2xl border px-5 py-4 text-left transition ${
                selected
                  ? "border-transparent bg-gradient-violet-magenta/20 ring-1 ring-primary/60 shadow-glow"
                  : "border-white/10 glass hover:border-white/20"
              }`}
            >
              <span className="font-medium">{o.label}</span>
              <span
                className={`grid h-5 w-5 place-items-center rounded-full border ${
                  selected ? "border-transparent bg-gradient-violet-magenta" : "border-white/20"
                }`}
              >
                {selected && <Check className="h-3 w-3 text-white" />}
              </span>
            </button>
          );
        })}
      </div>
    );
  }
  if (q.type === "number") {
    return (
      <div className="rounded-2xl glass p-6">
        <input
          type="number"
          min={q.min}
          max={q.max}
          step={q.step ?? 1}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          onKeyDown={(e) => { if (e.key === "Enter") onSubmit(); }}
          autoFocus
          placeholder={`${q.min ?? 0}${q.unit ? " " + q.unit : ""}`}
          className="w-full bg-transparent text-center font-display text-5xl font-semibold outline-none placeholder:text-muted-foreground/40"
        />
        {q.unit && <div className="mt-2 text-center text-xs text-muted-foreground">{q.unit}</div>}
      </div>
    );
  }
  // slider
  const v = typeof value === "number" ? value : Math.round(((q.min ?? 1) + (q.max ?? 10)) / 2);
  return (
    <div className="rounded-2xl glass p-6">
      <div className="text-center font-display text-5xl font-semibold text-gradient-cosmic">{v}</div>
      <input
        type="range"
        min={q.min ?? 1}
        max={q.max ?? 10}
        step={q.step ?? 1}
        value={v}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-6 w-full accent-[oklch(0.65_0.27_305)]"
      />
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{q.min ?? 1}</span>
        <span>{q.max ?? 10}</span>
      </div>
    </div>
  );
}
