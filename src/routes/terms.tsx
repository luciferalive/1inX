import { createFileRoute } from "@tanstack/react-router";
import { CosmicBackground, SiteHeader } from "@/components/site-chrome";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — 1 in X" },
      { name: "description", content: "The rules of using 1 in X." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="grain relative min-h-screen">
      <CosmicBackground />
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-6">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Terms of Service</h1>
        <p className="mt-1 text-sm text-muted-foreground">Last updated: June 2026 · Version 1.0</p>

        {[
          ["1. Acceptance", "By creating an account you agree to these Terms and our Privacy Policy."],
          ["2. The service", "1 in X computes a statistical rarity score from the answers you provide. Results are entertainment and self-reflection — not medical, psychological, or professional advice."],
          ["3. Your account", "You're responsible for activity under your account. Use a strong password. Don't impersonate others."],
          ["4. Acceptable use", "No harassment, hate, illegal content, scraping, automated abuse, or attempts to break our security."],
          ["5. Payments", "One-time upgrades are processed by Stripe. Refunds within 14 days if the upgrade is unused."],
          ["6. Termination", "You can delete your account anytime. We may suspend accounts that violate these Terms."],
          ["7. Liability", "The service is provided 'as is' without warranty. To the maximum extent permitted by law, we are not liable for indirect or consequential damages."],
          ["8. Changes", "We may update these Terms. Material changes will be announced in-app."],
          ["9. Contact", "Email hello@1inx.app."],
        ].map(([title, body]) => (
          <section key={title} className="mt-6 rounded-3xl glass-strong p-6 shadow-card">
            <h2 className="mb-2 font-display text-xl font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
          </section>
        ))}
      </main>
    </div>
  );
}
