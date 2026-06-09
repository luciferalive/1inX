import { createFileRoute, Link } from "@tanstack/react-router";
import { ARCHETYPES } from "@/lib/rarity/archetypes";
import { CosmicBackground, SiteHeader } from "@/components/site-chrome";

export const Route = createFileRoute("/archetypes")({
  head: () => ({
    meta: [
      { title: "Archetypes — 1 in X" },
      { name: "description", content: "Explore the 12 human archetypes." },
    ],
  }),
  component: ArchetypesPage,
});

function ArchetypesPage() {
  const list = Object.values(ARCHETYPES);
  return (
    <div className="grain relative min-h-screen">
      <CosmicBackground />
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-6">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Archetypes</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {list.length} ways to be unmistakably you. Take the assessment to find yours.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((a) => (
            <div
              key={a.id}
              className="group relative overflow-hidden rounded-2xl glass-strong p-6"
            >
              <div
                className={`absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br ${a.gradient} opacity-25 blur-2xl transition group-hover:opacity-40`}
              />
              <div className="relative">
                <div className="text-3xl">{a.emoji}</div>
                <h2 className="mt-2 font-display text-lg font-semibold">{a.name}</h2>
                <p className="mt-1 text-xs italic text-foreground/75">"{a.tagline}"</p>
                <p className="mt-3 text-xs text-muted-foreground line-clamp-3">{a.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {a.strengths.slice(0, 2).map((s) => (
                    <span key={s} className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-foreground/70">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/assessment"
            className="inline-flex rounded-full bg-gradient-violet-magenta px-6 py-3 text-sm font-semibold text-white shadow-glow"
          >
            Find my archetype →
          </Link>
        </div>
      </main>
    </div>
  );
}
