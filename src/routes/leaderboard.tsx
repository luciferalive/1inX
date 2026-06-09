import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CosmicBackground, SiteHeader } from "@/components/site-chrome";
import { getLeaderboard } from "@/lib/public.functions";
import { formatOneInX } from "@/lib/rarity/engine";
import { ARCHETYPES } from "@/lib/rarity/archetypes";
import { getSeedLeaderboard } from "@/lib/seed-leaderboard";
import { Trophy, Sparkles } from "lucide-react";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — 1 in X" },
      { name: "description", content: "The rarest people on the planet." },
    ],
  }),
  component: Leaderboard,
});

function Leaderboard() {
  const [scope, setScope] = useState<"global" | "weekly" | "monthly">("global");
  const fn = useServerFn(getLeaderboard);
  const { data } = useQuery({
    queryKey: ["leaderboard", scope],
    queryFn: () => fn({ data: { scope } }),
  });

  const rows = useMemo(() => {
    const real = (data?.rows ?? []) as any[];
    // Fill with seed data so the page never feels empty. Real users always rank ahead.
    const need = Math.max(0, 100 - real.length);
    const seeds = getSeedLeaderboard(need);
    return [...real, ...seeds];
  }, [data]);

  return (
    <div className="grain relative min-h-screen">
      <CosmicBackground />
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold sm:text-4xl">Leaderboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">The rarest profiles on Earth.</p>
          </div>
          <Trophy className="h-6 w-6 text-gold" />
        </div>

        <div className="mt-5 flex gap-1 rounded-full bg-white/5 p-1 text-sm">
          {(["global", "monthly", "weekly"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={`flex-1 rounded-full px-3 py-1.5 capitalize transition ${
                scope === s ? "bg-gradient-violet-magenta text-white" : "text-muted-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <ol className="mt-8 space-y-2">
          {rows.map((r: any, i: number) => {
            const arch = ARCHETYPES[r.archetype_key]?.name ?? "—";
            return (
              <li
                key={r.user_id}
                className={`flex items-center gap-4 rounded-2xl px-4 py-3 ${i < 3 ? "glass-strong ring-1 ring-gold/40" : "glass"}`}
              >
                <span className={`w-7 text-center font-mono text-sm ${i < 3 ? "text-gold font-bold" : "text-muted-foreground"}`}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                </span>
                <ProfileLink seed={r.seed} username={r.profiles.username}>
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-cosmic text-sm font-semibold text-white">
                    {r.profiles.username.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">@{r.profiles.username}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {r.profiles.country ?? "—"} · {arch}
                    </div>
                  </div>
                </ProfileLink>
                <div className="text-right">
                  <div className="font-display text-sm font-semibold text-gradient-cosmic">
                    1 in {formatOneInX(Number(r.one_in_x))}
                  </div>
                  <div className="text-[11px] text-muted-foreground">{Number(r.percentile).toFixed(2)}%</div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-8 rounded-2xl bg-gradient-violet-magenta/15 p-5 text-center">
          <Sparkles className="mx-auto h-5 w-5 text-gold" />
          <p className="mt-2 text-sm">Think you're rarer? Prove it.</p>
          <Link
            to="/assessment"
            className="mt-3 inline-flex rounded-full bg-gradient-violet-magenta px-5 py-2 text-sm font-semibold text-white shadow-glow"
          >
            Take the test →
          </Link>
        </div>
      </main>
    </div>
  );
}

function ProfileLink({
  seed, username, children,
}: { seed?: boolean; username: string; children: React.ReactNode }) {
  // Seeded demo rows aren't clickable — they don't have a real profile.
  if (seed) {
    return <div className="flex flex-1 items-center gap-3 min-w-0 opacity-90">{children}</div>;
  }
  return (
    <Link to="/u/$username" params={{ username }} className="flex flex-1 items-center gap-3 min-w-0">
      {children}
    </Link>
  );
}
