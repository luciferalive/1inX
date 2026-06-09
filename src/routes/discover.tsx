import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CosmicBackground, SiteHeader } from "@/components/site-chrome";
import { discoverUsers } from "@/lib/public.functions";
import { getSeedDiscover } from "@/lib/seed-leaderboard";
import { ARCHETYPES } from "@/lib/rarity/archetypes";
import { Search, TrendingUp, Flame, Star } from "lucide-react";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover — 1 in X" },
      { name: "description", content: "Discover rare people from around the world." },
    ],
  }),
  component: Discover,
});

function Discover() {
  const [q, setQ] = useState("");
  const fetchFn = useServerFn(discoverUsers);
  const { data } = useQuery({
    queryKey: ["discover", q],
    queryFn: () => fetchFn({ data: { q: q || undefined } }),
  });

  const real = (data?.profiles ?? []) as any[];

  const merged = useMemo(() => {
    if (q) return real; // when searching, don't pad with seeds
    const need = Math.max(0, 30 - real.length);
    const seeds = getSeedDiscover(need);
    return [...real, ...seeds];
  }, [real, q]);

  const trending = merged.slice(0, 6);
  const rising = merged.slice(6, 12);
  const featured = merged.slice(12);

  const topArchetypes = useMemo(() => {
    const keys = Object.keys(ARCHETYPES);
    return keys.slice(0, 6).map((k) => ARCHETYPES[k]);
  }, []);

  return (
    <div className="grain relative min-h-screen">
      <CosmicBackground />
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-6">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Discover</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Trending profiles, rising stars, and archetypes worth meeting.
        </p>

        <div className="mt-6 flex items-center gap-2 rounded-full glass-strong px-4 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
            placeholder="search @username"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        {!q && (
          <>
            <Section title="Trending now" icon={<Flame className="h-4 w-4 text-rose-400" />}>
              <Grid items={trending} />
            </Section>

            <Section title="Rising" icon={<TrendingUp className="h-4 w-4 text-emerald-400" />}>
              <Grid items={rising} />
            </Section>

            <Section title="Top archetypes" icon={<Star className="h-4 w-4 text-gold" />}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {topArchetypes.map((a) => (
                  <Link
                    key={a.id}
                    to="/archetypes"
                    className="group relative overflow-hidden rounded-2xl glass p-5 transition hover:-translate-y-0.5"
                  >
                    <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${a.gradient} opacity-25 blur-2xl`} />
                    <div className="relative flex items-center gap-3">
                      <div className="text-2xl">{a.emoji}</div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{a.name}</div>
                        <div className="truncate text-xs italic text-muted-foreground">"{a.tagline}"</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Section>

            <Section title="More to discover">
              <Grid items={featured} />
            </Section>
          </>
        )}

        {q && (
          <div className="mt-6">
            <Grid items={merged} />
            {merged.length === 0 && (
              <div className="rounded-2xl glass p-8 text-center text-sm text-muted-foreground">
                No profiles match "{q}".
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function Section({ icon, title, children }: { icon?: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <h2 className="font-display text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Grid({ items }: { items: any[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((p) => (
        <Card key={p.username} p={p} />
      ))}
    </div>
  );
}

function Card({ p }: { p: any }) {
  const body = (
    <>
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-cosmic font-semibold text-white">
          {p.username.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="truncate font-medium">@{p.username}</div>
          <div className="truncate text-xs text-muted-foreground">{p.display_name ?? p.country ?? "—"}</div>
        </div>
      </div>
      <div className="mt-3 flex justify-between text-xs text-muted-foreground">
        <span>{p.followers_count ?? 0} followers</span>
        <span>{p.likes_count ?? 0} likes</span>
      </div>
    </>
  );

  if (p.seed) {
    return <div className="rounded-2xl glass p-5 opacity-90">{body}</div>;
  }
  return (
    <Link
      to="/u/$username"
      params={{ username: p.username }}
      className="rounded-2xl glass p-5 transition hover:-translate-y-0.5"
    >
      {body}
    </Link>
  );
}
