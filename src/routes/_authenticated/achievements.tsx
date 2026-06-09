import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CosmicBackground, SiteHeader } from "@/components/site-chrome";
import { useAuth } from "@/hooks/use-auth";
import { useServerFn } from "@tanstack/react-start";
import { getMyLatestResult } from "@/lib/results.functions";
import { calculateRarity, getBadges } from "@/lib/rarity/engine";
import { ARCHETYPES } from "@/lib/rarity/archetypes";
import { Award, Lock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/achievements")({
  head: () => ({ meta: [{ title: "Achievements — 1 in X" }] }),
  component: AchievementsPage,
});

const CATALOG = [
  { key: "explorer", emoji: "🧭", name: "Curious Explorer", desc: "Completed your first assessment." },
  { key: "rare_1k", emoji: "✨", name: "1 in 1,000", desc: "Reached a rarity of 1 in 1,000 or rarer." },
  { key: "rare_10k", emoji: "💎", name: "1 in 10,000", desc: "Reached a rarity of 1 in 10,000 or rarer." },
  { key: "rare_100k", emoji: "🌟", name: "1 in 100,000", desc: "Reached a rarity of 1 in 100,000 or rarer." },
  { key: "rare_1m", emoji: "👑", name: "One in a Million", desc: "Reached a rarity of 1 in 1,000,000 or rarer." },
  { key: "polyglot", emoji: "🗣️", name: "Polyglot", desc: "Speak 3+ languages." },
  { key: "globetrotter", emoji: "🌍", name: "Globetrotter", desc: "Visited 15+ countries." },
  { key: "shipper", emoji: "🚀", name: "Shipper", desc: "Profile shared publicly." },
  { key: "inviter_3", emoji: "🤝", name: "Connector", desc: "Invited 3 friends." },
  { key: "inviter_10", emoji: "🌐", name: "Network Effect", desc: "Invited 10 friends." },
];

function AchievementsPage() {
  const { user } = useAuth();
  const fetchLatest = useServerFn(getMyLatestResult);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    fetchLatest().then(({ result }) => setResult(result)).catch(() => {});
  }, [user, fetchLatest]);

  // Reconstruct minimal RarityResult for badge logic if we have stored data
  const reconstructed = result ? {
    oneInX: Number(result.one_in_x),
    percentile: Number(result.percentile),
    globalRarity: 100 - Number(result.percentile),
    countryRarity: 0,
    continentRarity: 0,
    traits: result.traits ?? [],
    rarestTraits: [],
    commonTraits: [],
    archetype: ARCHETYPES[result.archetype_key] ?? ARCHETYPES.curious_thinker,
    archetypeRarity: 8,
    confidence: Number(result.confidence ?? 0.5),
    modelVersion: "hybrid-v1",
  } as any : null;

  const earned = new Set<string>();
  if (reconstructed) {
    earned.add("explorer");
    getBadges(reconstructed).forEach((b) => {
      if (b.name === "Statistical Unicorn") earned.add("rare_1m");
      if (b.name === "Rare Bird") earned.add("rare_10k");
      if (b.name === "Stand-Out") earned.add("rare_1k");
    });
    if (reconstructed.oneInX >= 100_000) earned.add("rare_100k");
  }

  const earnedCount = earned.size;

  return (
    <div className="grain relative min-h-screen">
      <CosmicBackground />
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-6">
        <div className="flex items-center gap-2">
          <Award className="h-6 w-6 text-gold" />
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">Achievements</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {earnedCount} of {CATALOG.length} earned · keep going.
        </p>
        <div className="mt-3 h-1.5 max-w-md overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full bg-gradient-cosmic transition-all duration-700"
            style={{ width: `${(earnedCount / CATALOG.length) * 100}%` }}
          />
        </div>

        {!result && (
          <div className="mt-8 rounded-2xl glass-strong p-6 text-center">
            <p className="text-sm text-muted-foreground">Take the assessment to start unlocking badges.</p>
            <Link
              to="/assessment"
              className="mt-3 inline-flex rounded-full bg-gradient-violet-magenta px-5 py-2 text-sm font-semibold text-white shadow-glow"
            >
              Start free →
            </Link>
          </div>
        )}

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CATALOG.map((b) => {
            const got = earned.has(b.key);
            return (
              <div
                key={b.key}
                className={`relative rounded-2xl p-5 ${got ? "glass-strong shadow-card" : "glass opacity-70"}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`grid h-12 w-12 place-items-center rounded-xl text-2xl ${got ? "bg-gradient-cosmic shadow-glow" : "bg-white/5"}`}>
                    {got ? b.emoji : <Lock className="h-5 w-5 text-muted-foreground" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{b.name}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{b.desc}</div>
                    <div className={`mt-2 text-[10px] uppercase tracking-wider ${got ? "text-gold" : "text-muted-foreground"}`}>
                      {got ? "Earned" : "Locked"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
