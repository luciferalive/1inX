import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CosmicBackground, SiteHeader } from "@/components/site-chrome";
import { getPublicProfile } from "@/lib/public.functions";
import { ARCHETYPES } from "@/lib/rarity/archetypes";
import { formatOneInX } from "@/lib/rarity/engine";
import { Trophy, MapPin } from "lucide-react";

export const Route = createFileRoute("/u/$username")({
  loader: async ({ params }) => {
    const { profile, result, badges } = await getPublicProfile({ data: { username: params.username } });
    if (!profile) throw notFound();
    return { profile, result, badges };
  },
  head: ({ loaderData }) => ({
    meta: loaderData?.profile
      ? [
          { title: `@${loaderData.profile.username} — 1 in X` },
          { name: "description", content: `@${loaderData.profile.username}'s rarity score on 1 in X.` },
          { property: "og:title", content: `@${loaderData.profile.username} on 1 in X` },
          { property: "og:description", content: `Discover @${loaderData.profile.username}'s rarity score and archetype.` },
        ]
      : [{ title: "Profile — 1 in X" }],
  }),
  notFoundComponent: () => (
    <div className="grain relative min-h-screen">
      <CosmicBackground />
      <SiteHeader />
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="font-display text-3xl">User not found</h1>
        <Link to="/discover" className="mt-6 inline-block text-sm underline">Browse profiles</Link>
      </div>
    </div>
  ),
  errorComponent: () => (
    <div className="grain relative min-h-screen">
      <CosmicBackground />
      <SiteHeader />
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="font-display text-2xl">Could not load profile</h1>
      </div>
    </div>
  ),
  component: PublicProfile,
});

function PublicProfile() {
  const { profile, result, badges } = Route.useLoaderData();
  const archetype = result ? ARCHETYPES[result.archetype_key] : null;

  return (
    <div className="grain relative min-h-screen">
      <CosmicBackground />
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-6">
        <div className="rounded-3xl glass-strong p-8 shadow-card">
          <div className="flex flex-wrap items-center gap-5">
            <div className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-cosmic text-3xl font-bold text-white">
              {profile.username.slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="font-display text-3xl font-semibold">@{profile.username}</h1>
              {profile.display_name && <p className="text-muted-foreground">{profile.display_name}</p>}
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                {profile.country && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {profile.country}</span>}
                <span>{profile.followers_count} followers</span>
                <span>{profile.likes_count} likes</span>
              </div>
            </div>
          </div>
          {profile.bio && <p className="mt-5 text-sm text-foreground/85">{profile.bio}</p>}
        </div>

        {result && archetype ? (
          <div className="mt-6 rounded-3xl glass-strong p-8 text-center shadow-card">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Rarity</div>
            <div className="mt-3 font-display text-5xl font-bold text-gradient-cosmic sm:text-7xl">
              1 IN {formatOneInX(Number(result.one_in_x))}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Rarer than {Number(result.percentile).toFixed(2)}% of people
            </div>
            <div className="mt-6 inline-flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3">
              <span className="text-2xl">{archetype.emoji}</span>
              <div className="text-left">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Archetype</div>
                <div className="font-display text-lg font-semibold">{archetype.name}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-3xl glass p-8 text-center">
            <p className="text-muted-foreground">This user hasn't completed an assessment yet.</p>
          </div>
        )}

        {badges.length > 0 && (
          <div className="mt-6">
            <h2 className="font-display text-lg font-semibold">Achievements</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {badges.map((b: any) => (
                <span key={b.badge_key} className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs">
                  <Trophy className="h-3 w-3 text-gold" /> {b.badge_key}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
