
# Production Readiness Plan for 1 in X

This is a very large scope — roughly 2-4 weeks of focused build work. I'll do it in **5 phases** so you can review and ship value at each step rather than waiting for one giant change.

Before I start, I need a few decisions from you (questions at the bottom). Phase 1 I can ship immediately without any answers.

---

## Phase 1 — Rarity engine credibility fix (ship now, no backend needed)

Replace the current dampened log-sum with a calibrated model so results always land in believable ranges.

- Clamp final `oneInX` between **1 in 8** and **1 in 2,500,000** (hard ceiling/floor).
- Clamp percentile between **50.0%** and **99.97%** — never 100%, never 99.9999%.
- Per-question rarity floors at 2% (no single answer makes someone "0.0001%").
- Stronger correlation dampening (current 0.35 → adaptive 0.25-0.40 based on trait count).
- Country/continent rarity recomputed from realistic population multipliers (not just ×3 / ×8).
- Internal `confidenceScore` field (0-1) computed from: # of answers given, simulated-vs-real ratio. Stored on result, surfaced subtly ("Based on global estimates").
- Add a `populationModel.ts` with baseline distributions (income brackets, languages spoken, countries visited, etc.) sourced from public stats so the rarity values have a defensible basis.

**Outcome:** No more "100% rare" or "1 in 999,999,999". Every result feels plausible.

## Phase 2 — Lovable Cloud + Auth + DB

Enable Lovable Cloud and create the schema:

```text
profiles        (id, username UNIQUE, display_name, avatar_url, country, bio, created_at)
assessments    (id, user_id, answers JSONB, created_at)
results        (id, assessment_id, user_id, one_in_x, percentile, archetype_id,
                 traits JSONB, confidence, created_at)
purchases      (id, user_id, tier, stripe_session_id, status, created_at)
referrals      (id, referrer_id, referred_user_id, status, verified_at)
rewards        (id, user_id, tier, source, consumed_at, expires_at)
achievements   (id, user_id, badge_key, earned_at)
user_roles     (id, user_id, role)   -- for admin
follows        (follower_id, followed_id)
likes          (user_id, profile_id)
```

All tables get RLS + GRANTs. Roles via separate `user_roles` + `has_role()` security-definer function (per project rules).

- Gate results behind signup: assessment → "Create account to reveal" → Google + Email/password (Apple later, requires Apple Developer account).
- Username chosen at signup, validated unique, lowercase, `[a-z0-9_]{3,20}`.
- Public profile route `/u/$username` (server-fn loader, no auth required).
- Past results visible on own profile.

## Phase 3 — Monetization

- Stripe via Lovable's built-in seamless payments (no API key needed from you).
- Plan cards: Free / Premium ($4.99) / Pro ($9.99) / Ultimate ($19.99). I'll confirm pricing/features with you.
- Webhook → unlock tier in `purchases`.
- Locked sections on results page become unlocked based on user tier OR consumed reward.
- "Crypto payments coming soon" badge (no implementation).

## Phase 4 — Referrals + Social

- `?ref=username` link tracked in cookie → recorded on signup.
- Verified referral = signup + email verified + assessment completed (DB trigger or server-fn).
- Reward thresholds (3 → Premium report, 5 → Pro, 10 → Ultimate), single-use, consumable.
- Referral dashboard with progress bars.
- Follow/like, Discover page (search by username/archetype/country), leaderboards (global, country, weekly, monthly).

## Phase 5 — Polish

- Working share card PNG generation (html-to-image lib, client-side render of a hidden card div).
- Share buttons: WhatsApp, X, Facebook, Copy link — all functional intent URLs.
- Celebrity match system — needs a curated dataset; I'll seed ~50 public figures with trait vectors.
- Admin dashboard at `/_authenticated/_admin` (role-gated).
- Achievement badge engine runs on result save.

---

## Questions before I start Phase 2+

1. **Pricing & features per tier** — confirm the $4.99 / $9.99 / $19.99 split, or give me the breakdown you want.
2. **Apple Sign-In** — skip for now (needs your Apple Developer account) or include later?
3. **Celebrity dataset** — OK if I seed ~50 well-known public figures with my own trait estimates, or do you want to provide the list?

I can ship **Phase 1 immediately** while you answer. Want me to proceed?
