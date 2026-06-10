import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Public reads run server-side with the service role so we can enforce
// per-row visibility AND project only safe (non-sensitive) columns.
// RLS is bypassed by design — column projection is the security boundary.
async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

const SAFE_PROFILE_COLS =
  "id, username, display_name, avatar_url, country, bio, followers_count, following_count, likes_count, created_at, profile_visibility, result_visibility, show_on_leaderboard, allow_search";

export const getPublicProfile = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({
      username: z.string().regex(/^[a-z0-9_]{3,20}$/),
      viewerId: z.string().uuid().optional(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const supabase = await admin();
    const { data: profile } = await supabase
      .from("profiles")
      .select(SAFE_PROFILE_COLS)
      .eq("username", data.username)
      .maybeSingle();
    if (!profile) return { profile: null, result: null, badges: [], visibility: "not_found" as const };

    const isOwner = data.viewerId && data.viewerId === (profile as any).id;
    const vis = (profile as any).profile_visibility as "public" | "members" | "private";
    if (!isOwner) {
      if (vis === "private") return { profile: null, result: null, badges: [], visibility: "private" as const };
      if (vis === "members" && !data.viewerId)
        return { profile: null, result: null, badges: [], visibility: "members_only" as const };
    }

    // Result is only shared if the owner opted in (or the viewer is the owner)
    const resultVis = (profile as any).result_visibility as "private" | "link" | "public";
    let result: any = null;
    if (isOwner || resultVis === "public") {
      const { data: r } = await supabase
        .from("results")
        .select("one_in_x, percentile, archetype_key, traits, created_at")
        .eq("user_id", (profile as any).id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      result = r ?? null;
    }

    const { data: badges } = await supabase
      .from("achievements")
      .select("badge_key, earned_at")
      .eq("user_id", (profile as any).id);

    return { profile, result, badges: badges ?? [], visibility: "ok" as const };
  });

export const discoverUsers = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({
      q: z.string().max(40).optional(),
      country: z.string().max(40).optional(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const supabase = await admin();
    let query = supabase
      .from("profiles")
      .select("username, display_name, avatar_url, country, followers_count, likes_count")
      .eq("profile_visibility", "public")
      .eq("allow_search", true)
      .limit(48);
    if (data.q) query = query.ilike("username", `%${data.q.toLowerCase()}%`);
    if (data.country) query = query.eq("country", data.country);
    const { data: profiles } = await query;
    return { profiles: profiles ?? [] };
  });

export const getLeaderboard = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({
      scope: z.enum(["global", "weekly", "monthly"]).default("global"),
      country: z.string().max(40).optional(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const supabase = await admin();
    let q = supabase
      .from("results")
      .select(
        "user_id, one_in_x, percentile, archetype_key, created_at, profiles!inner(username, display_name, avatar_url, country, profile_visibility, show_on_leaderboard, result_visibility)"
      )
      .order("percentile", { ascending: false })
      .limit(50);
    if (data.scope === "weekly") {
      const since = new Date(Date.now() - 7 * 86400_000).toISOString();
      q = q.gte("created_at", since);
    } else if (data.scope === "monthly") {
      const since = new Date(Date.now() - 30 * 86400_000).toISOString();
      q = q.gte("created_at", since);
    }
    if (data.country) q = q.eq("profiles.country", data.country);
    // Only include users who opted in to leaderboard and have a public profile
    q = q.eq("profiles.show_on_leaderboard", true).eq("profiles.profile_visibility", "public");
    const { data: rows } = await q;
    return { rows: rows ?? [] };
  });
