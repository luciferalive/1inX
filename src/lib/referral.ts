// Client-side referral capture. Stores the inviter's profile id in localStorage
// for 30 days so signup can include it in user metadata.
const KEY = "rarity_ref";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function captureReferralFromUrl() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if (!ref) return;
  try {
    localStorage.setItem(KEY, JSON.stringify({ ref, ts: Date.now() }));
  } catch {}
}

export function getReferralId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const { ref, ts } = JSON.parse(raw);
    if (Date.now() - ts > TTL_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    return ref as string;
  } catch {
    return null;
  }
}

export function clearReferral() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
