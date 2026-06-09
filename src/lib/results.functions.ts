import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const AnswersSchema = z.record(z.string().max(40), z.union([z.string().max(200), z.number()]));

const SaveResultInput = z.object({
  answers: AnswersSchema,
  oneInX: z.number().int().min(1).max(10_000_000),
  percentile: z.number().min(0).max(100),
  archetypeKey: z.string().min(1).max(60),
  traits: z.array(
    z.object({
      id: z.string().max(40),
      label: z.string().max(120),
      category: z.string().max(40),
      answerLabel: z.string().max(120),
      rarity: z.number().min(0).max(100),
    })
  ).max(80),
  confidence: z.number().min(0).max(1),
  modelVersion: z.string().max(40),
});

export const saveResult = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => SaveResultInput.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: assessment, error: aErr } = await supabase
      .from("assessments")
      .insert({ user_id: userId, answers: data.answers })
      .select("id")
      .single();
    if (aErr || !assessment) throw new Error(aErr?.message ?? "Failed to save assessment");

    const { data: result, error: rErr } = await supabase
      .from("results")
      .insert({
        assessment_id: assessment.id,
        user_id: userId,
        one_in_x: data.oneInX,
        percentile: data.percentile,
        archetype_key: data.archetypeKey,
        traits: data.traits,
        confidence: data.confidence,
        model_version: data.modelVersion,
      })
      .select("id")
      .single();
    if (rErr || !result) throw new Error(rErr?.message ?? "Failed to save result");

    return { resultId: result.id, assessmentId: assessment.id };
  });

export const getMyLatestResult = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("results")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return { result: data };
  });

export const getReferralStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [referrals, rewards] = await Promise.all([
      supabase.from("referrals").select("status, created_at").eq("referrer_id", userId),
      supabase.from("rewards").select("tier, source, consumed_at, created_at").eq("user_id", userId).order("created_at", { ascending: false }),
    ]);
    const verified = (referrals.data ?? []).filter((r) => r.status !== "pending").length;
    const pending = (referrals.data ?? []).filter((r) => r.status === "pending").length;
    return {
      verified,
      pending,
      rewards: rewards.data ?? [],
    };
  });

export const consumeReward = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ rewardId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: updated, error } = await supabase
      .from("rewards")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", data.rewardId)
      .eq("user_id", userId)
      .is("consumed_at", null)
      .select("id, tier")
      .maybeSingle();
    if (error || !updated) throw new Error(error?.message ?? "Reward already used or not found");
    return updated;
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      display_name: z.string().trim().max(60).optional(),
      bio: z.string().trim().max(280).optional(),
      country: z.string().trim().max(60).optional(),
      avatar_url: z.string().url().max(500).optional(),
    }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("profiles").update(data).eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
