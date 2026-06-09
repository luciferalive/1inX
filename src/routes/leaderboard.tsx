import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CosmicBackground, SiteHeader } from "@/components/site-chrome";
import { getLeaderboard } from "@/lib/public.functions";
import { formatOneInX } from "@/lib/rarity/engine";
import { Trophy } from "lucide-react";

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

  return (
    <div className="grain relative min-h-screen">
      <CosmicBackground />
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">Leaderboard</h1>
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
          {(data?.rows ?? []).map((r: any, i: number) => (
            <li key={r.user_id} className="flex items-center gap-4 rounded-2xl glass px-4 py-3">
              <span className="w-6 font-mono text-sm text-muted-foreground">{i + 1}</span>
              <Link
                to="/u/$username"
                params={{ username: r.profiles.username }}
                className="flex flex-1 items-center gap-3 min-w-0"
              >
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-cosmic text-sm font-semibold text-white">
                  {r.profiles.username.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">@{r.profiles.username}</div>
                  <div className="truncate text-xs text-muted-foreground">{r.profiles.country ?? "—"}</div>
                </div>
              </Link>
              <div className="text-right">
                <div className="font-display text-sm font-semibold text-gradient-cosmic">1 in {formatOneInX(Number(r.one_in_x))}</div>
                <div className="text-[11px] text-muted-foreground">{Number(r.percentile).toFixed(2)}%</div>
              </div>
            </li>
          ))}
          {data && data.rows.length === 0 && (
            <li className="rounded-2xl glass p-8 text-center text-sm text-muted-foreground">No entries yet — be the first.</li>
          )}
        </ol>
      </main>
    </div>
  );
}
