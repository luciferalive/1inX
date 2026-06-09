import { createFileRoute, Link } from "@tanstack/react-router";
import { CosmicBackground, SiteHeader } from "@/components/site-chrome";
import { Heart, Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/saved")({
  head: () => ({ meta: [{ title: "Saved Comparisons — 1 in X" }] }),
  component: SavedPage,
});

function SavedPage() {
  // Comparisons are an Ultimate-tier feature — show empty state with discovery suggestion.
  return (
    <div className="grain relative min-h-screen">
      <CosmicBackground />
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-6">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-gold" />
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">Saved Comparisons</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Compare your rarity profile against friends, public figures, and other users.
        </p>

        <div className="mt-8 rounded-3xl glass-strong p-8 text-center shadow-card">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-violet-magenta shadow-glow">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-4 font-display text-xl font-semibold">No comparisons yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse Discover, open a profile, and tap “Compare” to save it here.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/discover"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-violet-magenta px-5 py-2 text-sm font-semibold text-white shadow-glow"
            >
              <Search className="h-4 w-4" /> Discover users
            </Link>
            <Link
              to="/leaderboard"
              className="inline-flex rounded-full bg-white/10 px-5 py-2 text-sm font-semibold"
            >
              View leaderboard
            </Link>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-gold/10 p-4 text-xs text-gold">
          Saved comparisons are part of the Ultimate plan — or unlock free by referring 10 friends.
        </div>
      </main>
    </div>
  );
}
