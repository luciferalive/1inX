import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Public reads use the anon client (no auth needed) — relies on RLS policies that allow public read.
async function publicClient() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const getPublicProfile = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({ username: z.string().regex(/^[a-z0-9_]{3,20}$/) }).parse(data)
  )
  .handler(async ({ data }) => {
    const supabase = await publicClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, country, bio, followers_count, following_count, likes_count, created_at")
      .eq("username", data.username)
      .maybeSingle();
    if (!profile) return { profile: null, result: null, badges: [] };

    const [{ data: result }, { data: badges }] = await Promise.all([
      supabase
        .from("results")
        .select("one_in_x, percentile, archetype_key, traits, created_at")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("achievements").select("badge_key, earned_at").eq("user_id", profile.id),
    ]);
    return { profile, result, badges: badges ?? [] };
  });

export const discoverUsers = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({
      q: z.string().max(40).optional(),
      archetype: z.string().max(40).optional(),
      country: z.string().max(40).optional(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const supabase = await publicClient();
    let query = supabase
      .from("profiles")
      .select("username, display_name, avatar_url, country, followers_count, likes_count")
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
    const supabase = await publicClient();
    let q = supabase
      .from("results")
      .select("user_id, one_in_x, percentile, archetype_key, created_at, profiles!inner(username, display_name, avatar_url, country)")
      .order("percentile", { ascending: false })
      .limit(50);
    if (data.scope === "weekly") {
      const since = new Date(Date.now() - 7 * 86400_000).toISOString();
      q = q.gte("created_at", since);
    } else if (data.scope === "monthly") {
      const since = new Date(Date.now() - 30 * 86400_000).toISOString();
      q = q.gte("created_at", since);
    }
    if (data.country) {
      // filter by joined profile country
      q = q.eq("profiles.country", data.country);
    }
    const { data: rows } = await q;
    return { rows: rows ?? [] };
  });
