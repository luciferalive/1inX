import { createFileRoute } from "@tanstack/react-router";
import { CosmicBackground, SiteHeader } from "@/components/site-chrome";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — 1 in X" },
      { name: "description", content: "How 1 in X collects, uses, and protects your data." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="grain relative min-h-screen">
      <CosmicBackground />
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-6 prose prose-invert">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: June 2026 · Version 1.0</p>

        <Section title="1. What we collect">
          <ul>
            <li><b>Account:</b> email, username, optional display name, country, bio, avatar.</li>
            <li><b>Assessment data:</b> the answers you provide to compute your rarity (e.g. age range, height unit, eye color).</li>
            <li><b>Derived data:</b> your rarity score, percentile, archetype, and trait breakdown.</li>
            <li><b>Usage:</b> anonymous analytics about page views and feature use.</li>
            <li><b>Referrals:</b> the user (if any) who invited you.</li>
            <li><b>Payments:</b> processed by Stripe — we never store your card details.</li>
          </ul>
        </Section>

        <Section title="2. How we use it">
          <ul>
            <li>To generate and display your personal rarity result.</li>
            <li>To operate your account, leaderboards, referrals, and notifications.</li>
            <li>To improve the product (aggregate, de-identified analytics only).</li>
          </ul>
        </Section>

        <Section title="3. What is public">
          <p>By default, your <b>profile</b> (username, avatar, archetype, public badges) may appear on Discover and Leaderboards. Your <b>raw assessment answers are never public</b>. You can switch your profile to <i>Members only</i> or <i>Private</i>, hide yourself from Leaderboards, and hide yourself from search in Settings → Privacy.</p>
        </Section>

        <Section title="4. Sharing">
          <p>We do not sell your personal data. We share data only with processors that operate the service (hosting, auth, payments). We may disclose data if required by law.</p>
        </Section>

        <Section title="5. Retention">
          <p>We retain your data while your account exists. Delete your account at any time in Settings → Danger zone. Deletion removes your profile, assessment history, results, and referral links within 30 days. Aggregated, de-identified statistics may be retained.</p>
        </Section>

        <Section title="6. Your rights">
          <p>You can access, correct, export, or delete your data. Email <a href="mailto:hello@1inx.app">hello@1inx.app</a> for any request. EU/UK/CA residents have additional rights under GDPR/UK-GDPR/PIPEDA.</p>
        </Section>

        <Section title="7. Children">
          <p>1 in X is not intended for users under 13. Do not use the service if you are under 13.</p>
        </Section>

        <Section title="8. Contact">
          <p>Email <a href="mailto:hello@1inx.app">hello@1inx.app</a>.</p>
        </Section>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 rounded-3xl glass-strong p-6 shadow-card not-prose">
      <h2 className="mb-3 font-display text-xl font-semibold">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed [&_a]:underline [&_b]:text-foreground [&_li]:mb-1">{children}</div>
    </section>
  );
}
