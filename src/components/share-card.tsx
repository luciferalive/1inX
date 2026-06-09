import { forwardRef } from "react";
import { CountUp } from "@/components/count-up";
import type { RarityResult } from "@/lib/rarity/engine";
import { formatOneInX } from "@/lib/rarity/engine";

export type ShareTheme = "cosmic" | "gold" | "neon" | "dark";

export const THEME_LABELS: { id: ShareTheme; label: string; swatch: string }[] = [
  { id: "cosmic", label: "Cosmic", swatch: "linear-gradient(135deg,#7c3aed,#ec4899,#f59e0b)" },
  { id: "gold", label: "Gold Premium", swatch: "linear-gradient(135deg,#3a2a05,#facc15,#fde68a)" },
  { id: "neon", label: "Neon", swatch: "linear-gradient(135deg,#06b6d4,#22d3ee,#a3e635)" },
  { id: "dark", label: "Dark Elite", swatch: "linear-gradient(135deg,#0b0b14,#1f1f2e,#3b3b5a)" },
];

type Props = {
  result: RarityResult;
  username: string | null;
  theme: ShareTheme;
  animateCount?: boolean;
};

const THEME = {
  cosmic: {
    bg: "bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.7),transparent_60%),radial-gradient(circle_at_80%_90%,rgba(236,72,153,0.6),transparent_55%),linear-gradient(135deg,#0a0613,#1a0a2e)]",
    accent: "text-white",
    title: "bg-gradient-to-r from-amber-300 via-fuchsia-400 to-violet-300 bg-clip-text text-transparent",
    glow: "from-violet-500/40 via-fuchsia-500/40 to-amber-400/40",
    chip: "bg-white/10 text-white/80",
    badge: "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white",
  },
  gold: {
    bg: "bg-[radial-gradient(circle_at_20%_10%,rgba(250,204,21,0.55),transparent_60%),radial-gradient(circle_at_80%_90%,rgba(202,138,4,0.45),transparent_55%),linear-gradient(135deg,#1a1304,#3a2a05)]",
    accent: "text-amber-50",
    title: "bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-500 bg-clip-text text-transparent",
    glow: "from-yellow-400/40 via-amber-400/40 to-orange-400/40",
    chip: "bg-amber-100/10 text-amber-100/80",
    badge: "bg-gradient-to-r from-amber-400 to-yellow-300 text-zinc-900",
  },
  neon: {
    bg: "bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.7),transparent_55%),radial-gradient(circle_at_80%_90%,rgba(163,230,53,0.55),transparent_55%),linear-gradient(135deg,#020617,#082f49)]",
    accent: "text-cyan-50",
    title: "bg-gradient-to-r from-cyan-300 via-emerald-300 to-lime-300 bg-clip-text text-transparent",
    glow: "from-cyan-400/40 via-emerald-400/40 to-lime-400/40",
    chip: "bg-cyan-300/10 text-cyan-100/85",
    badge: "bg-gradient-to-r from-cyan-400 to-emerald-400 text-zinc-900",
  },
  dark: {
    bg: "bg-[radial-gradient(circle_at_30%_20%,rgba(120,120,180,0.18),transparent_60%),linear-gradient(135deg,#06060a,#0d0d18)]",
    accent: "text-zinc-100",
    title: "bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-100 bg-clip-text text-transparent",
    glow: "from-zinc-700/30 via-zinc-500/30 to-zinc-700/30",
    chip: "bg-white/5 text-zinc-300",
    badge: "bg-white text-zinc-900",
  },
} as const;

export const ShareCard = forwardRef<HTMLDivElement, Props>(function ShareCard(
  { result, username, theme, animateCount = true },
  ref,
) {
  const t = THEME[theme];
  const formatted = formatOneInX(result.oneInX);
  return (
    <div
      ref={ref}
      className={`relative overflow-hidden rounded-3xl ${t.bg} p-10 sm:p-14 ${t.accent}`}
      style={{ width: "100%", aspectRatio: "1 / 1.15" }}
    >
      {/* Glow halo */}
      <div className={`pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-br ${t.glow} blur-3xl opacity-50`} />
      {/* Grid texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:32px_32px]" />

      <div className="relative flex h-full flex-col">
        {/* Brand */}
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em]">
          <span className="opacity-70">1 in X</span>
          <span className="opacity-60">Human Rarity Index</span>
        </div>

        {/* Score */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="text-xs uppercase tracking-[0.3em] opacity-70">
            {username ? `@${username} is` : "You are"}
          </div>
          <div className={`mt-3 font-display text-7xl sm:text-8xl font-bold leading-none ${t.title}`}>
            1 IN {formatted}
          </div>
          <div className="mt-5 text-base sm:text-lg opacity-90">
            Rarer than{" "}
            <span className="font-semibold">
              {animateCount ? (
                <CountUp to={result.percentile} decimals={2} suffix="%" duration={1500} />
              ) : (
                `${result.percentile.toFixed(2)}%`
              )}
            </span>{" "}
            of people on Earth
          </div>

          {/* Archetype badge */}
          <div className={`mt-7 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${t.badge}`}>
            <span className="text-base">{result.archetype.emoji}</span>
            <span>{result.archetype.name}</span>
          </div>

          {/* Tagline */}
          <p className="mt-4 max-w-xs text-sm italic opacity-80">"{result.archetype.tagline}"</p>
        </div>

        {/* Footer chips */}
        <div className="mt-auto flex flex-wrap items-center justify-center gap-2">
          <span className={`rounded-full px-3 py-1 text-[11px] ${t.chip}`}>
            {result.traits.length} traits
          </span>
          <span className={`rounded-full px-3 py-1 text-[11px] ${t.chip}`}>
            Confidence {Math.round(result.confidence * 100)}%
          </span>
          <span className={`rounded-full px-3 py-1 text-[11px] ${t.chip}`}>
            1inX.app
          </span>
        </div>
      </div>
    </div>
  );
});
