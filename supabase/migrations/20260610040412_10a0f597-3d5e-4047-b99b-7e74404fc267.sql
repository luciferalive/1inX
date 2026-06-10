
-- 1) Privacy columns on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS profile_visibility TEXT NOT NULL DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS result_visibility  TEXT NOT NULL DEFAULT 'private',
  ADD COLUMN IF NOT EXISTS show_on_leaderboard BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS allow_search BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS consent_version TEXT,
  ADD COLUMN IF NOT EXISTS consented_at TIMESTAMPTZ;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_profile_visibility_check,
  ADD CONSTRAINT profiles_profile_visibility_check
    CHECK (profile_visibility IN ('public','members','private'));

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_result_visibility_check,
  ADD CONSTRAINT profiles_result_visibility_check
    CHECK (result_visibility IN ('private','link','public'));

-- 2) Results: owner-only read; validated insert; owner update/delete
DROP POLICY IF EXISTS "results public read" ON public.results;
DROP POLICY IF EXISTS "results own read" ON public.results;
CREATE POLICY "results own read" ON public.results
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "results own insert" ON public.results;
CREATE POLICY "results own insert" ON public.results
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.id = assessment_id AND a.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "results own update" ON public.results;
CREATE POLICY "results own update" ON public.results
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "results own delete" ON public.results;
CREATE POLICY "results own delete" ON public.results
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 3) Profiles: remove public read; owner-only (server fns elevate for public reads)
DROP POLICY IF EXISTS "profiles public read" ON public.profiles;
DROP POLICY IF EXISTS "profiles owner read" ON public.profiles;
CREATE POLICY "profiles owner read" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles owner delete" ON public.profiles;
CREATE POLICY "profiles owner delete" ON public.profiles
  FOR DELETE TO authenticated
  USING (auth.uid() = id);

-- 4) Follows/likes: drop public read (counts are denormalized on profile row already)
DROP POLICY IF EXISTS "follows public read" ON public.follows;
CREATE POLICY "follows participant read" ON public.follows
  FOR SELECT TO authenticated
  USING (auth.uid() = follower_id OR auth.uid() = followed_id);

DROP POLICY IF EXISTS "likes public read" ON public.likes;
CREATE POLICY "likes own read" ON public.likes
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 5) Achievements: keep public — but only via server-fn projection (no PII).
--    Already public; no change.

-- 6) Lock down SECURITY DEFINER helpers from end users.
--    has_role is invoked from RLS via SECURITY DEFINER context — end users do not need EXECUTE.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;
GRANT  EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
