import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CosmicBackground, SiteHeader } from "@/components/site-chrome";
import { discoverUsers } from "@/lib/public.functions";
import { Search } from "lucide-react";

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

  return (
    <div className="grain relative min-h-screen">
      <CosmicBackground />
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-6">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Discover</h1>
        <p className="mt-2 text-sm text-muted-foreground">Find rare people by username.</p>

        <div className="mt-6 flex items-center gap-2 rounded-full glass-strong px-4 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
            placeholder="search @username"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data?.profiles ?? []).map((p: any) => (
            <Link
              key={p.username}
              to="/u/$username"
              params={{ username: p.username }}
              className="rounded-2xl glass p-5 transition hover:-translate-y-0.5"
            >
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
            </Link>
          ))}
          {data && data.profiles.length === 0 && (
            <div className="col-span-full rounded-2xl glass p-8 text-center text-sm text-muted-foreground">
              No profiles yet. Be the first to claim your @handle.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
