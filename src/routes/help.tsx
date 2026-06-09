import { createFileRoute, Link } from "@tanstack/react-router";
import { CosmicBackground, SiteHeader } from "@/components/site-chrome";
import { HelpCircle } from "lucide-react";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help & FAQ — 1 in X" },
      { name: "description", content: "How 1 in X works and answers to common questions." },
    ],
  }),
  component: HelpPage,
});

const FAQ = [
  {
    q: "How is my rarity score calculated?",
    a: "We take each answer's approximate population frequency, account for correlation between traits, and compute a combined probability — capped so results stay believable. Confidence improves as you answer more questions.",
  },
  {
    q: "Are my results private?",
    a: "Your profile is public at your @handle (you can share it), but raw answers are private and stored only against your account. You can delete your account anytime from Settings.",
  },
  {
    q: "What does '1 in X' mean?",
    a: "It's an estimate of how many people on Earth would share your combined profile. '1 in 8,000' means roughly 1 in every 8,000 people matches your trait combination.",
  },
  {
    q: "How do referral rewards work?",
    a: "Share your invite link. When 3 friends complete the assessment, you unlock Premium free. 5 friends = Pro, 10 friends = Ultimate. Track progress at /referrals.",
  },
  {
    q: "Can I retake the assessment?",
    a: "Yes — your latest result replaces the previous one on your public profile. Old results stay saved in your history.",
  },
  {
    q: "Is payment required?",
    a: "No — Free is fully usable. Premium tiers unlock deeper analysis, celebrity matches, and comparisons.",
  },
];

function HelpPage() {
  return (
    <div className="grain relative min-h-screen">
      <CosmicBackground />
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-6">
        <HelpCircle className="h-7 w-7 text-gold" />
        <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Help & FAQ</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Questions answered. Still stuck? Email{" "}
          <a href="mailto:hello@1inx.app" className="underline">hello@1inx.app</a>.
        </p>
        <div className="mt-8 space-y-3">
          {FAQ.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl glass-strong p-5 transition open:bg-white/[0.04]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <h2 className="font-display text-base font-semibold">{f.q}</h2>
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white/10 text-sm transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-foreground/80">{f.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-10 rounded-2xl bg-gradient-violet-magenta/20 p-6 text-center">
          <p className="text-sm font-medium">Haven't taken the test yet?</p>
          <Link
            to="/assessment"
            className="mt-3 inline-flex rounded-full bg-gradient-violet-magenta px-5 py-2 text-sm font-semibold text-white shadow-glow"
          >
            Start free →
          </Link>
        </div>
      </main>
    </div>
  );
}
