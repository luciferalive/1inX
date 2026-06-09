
-- ENUMS
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TYPE public.tier AS ENUM ('free', 'premium', 'pro', 'ultimate');
CREATE TYPE public.referral_status AS ENUM ('pending', 'verified', 'rewarded');
CREATE TYPE public.reward_source AS ENUM ('referral_3', 'referral_5', 'referral_10', 'admin_grant');

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE CHECK (username ~ '^[a-z0-9_]{3,20}$'),
  display_name TEXT,
  avatar_url TEXT,
  country TEXT,
  bio TEXT CHECK (bio IS NULL OR char_length(bio) <= 280),
  tier public.tier NOT NULL DEFAULT 'free',
  referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  followers_count INT NOT NULL DEFAULT 0,
  following_count INT NOT NULL DEFAULT 0,
  likes_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles public read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles update own" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles insert own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ASSESSMENTS
CREATE TABLE public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  answers JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.assessments TO authenticated;
GRANT ALL ON public.assessments TO service_role;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assessments own read" ON public.assessments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "assessments own insert" ON public.assessments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RESULTS
CREATE TABLE public.results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.assessments ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  one_in_x BIGINT NOT NULL,
  percentile NUMERIC(6,3) NOT NULL,
  archetype_key TEXT NOT NULL,
  traits JSONB NOT NULL,
  confidence NUMERIC(3,2) NOT NULL DEFAULT 0.5,
  model_version TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.results TO anon;
GRANT SELECT, INSERT ON public.results TO authenticated;
GRANT ALL ON public.results TO service_role;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "results public read" ON public.results FOR SELECT USING (true);
CREATE POLICY "results own insert" ON public.results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX results_user_idx ON public.results(user_id, created_at DESC);
CREATE INDEX results_percentile_idx ON public.results(percentile DESC);

-- PURCHASES
CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  tier public.tier NOT NULL,
  amount_cents INT NOT NULL,
  stripe_session_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.purchases TO authenticated;
GRANT ALL ON public.purchases TO service_role;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "purchases own read" ON public.purchases FOR SELECT USING (auth.uid() = user_id);

-- REFERRALS
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL UNIQUE REFERENCES auth.users ON DELETE CASCADE,
  status public.referral_status NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "referrals own read" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

-- REWARDS (single-use, consumable)
CREATE TABLE public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  tier public.tier NOT NULL,
  source public.reward_source NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.rewards TO authenticated;
GRANT ALL ON public.rewards TO service_role;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rewards own read" ON public.rewards FOR SELECT USING (auth.uid() = user_id);

-- ACHIEVEMENTS
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  badge_key TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_key)
);
GRANT SELECT ON public.achievements TO anon;
GRANT SELECT ON public.achievements TO authenticated;
GRANT ALL ON public.achievements TO service_role;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "achievements public read" ON public.achievements FOR SELECT USING (true);

-- USER ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles own read" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- FOLLOWS
CREATE TABLE public.follows (
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  followed_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, followed_id),
  CHECK (follower_id <> followed_id)
);
GRANT SELECT ON public.follows TO anon;
GRANT SELECT, INSERT, DELETE ON public.follows TO authenticated;
GRANT ALL ON public.follows TO service_role;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "follows public read" ON public.follows FOR SELECT USING (true);
CREATE POLICY "follows insert own" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows delete own" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- LIKES
CREATE TABLE public.likes (
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, profile_id)
);
GRANT SELECT ON public.likes TO anon;
GRANT SELECT, INSERT, DELETE ON public.likes TO authenticated;
GRANT ALL ON public.likes TO service_role;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "likes public read" ON public.likes FOR SELECT USING (true);
CREATE POLICY "likes insert own" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes delete own" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- updated_at trigger fn
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on signup using metadata-provided username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_username TEXT;
  v_referrer UUID;
BEGIN
  v_username := lower(coalesce(NEW.raw_user_meta_data->>'username',
                               regexp_replace(split_part(NEW.email, '@', 1), '[^a-z0-9_]', '', 'g')));
  IF char_length(v_username) < 3 THEN
    v_username := 'user_' || substr(NEW.id::text, 1, 8);
  END IF;
  -- ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = v_username) LOOP
    v_username := v_username || substr(md5(random()::text), 1, 3);
  END LOOP;

  v_referrer := NULLIF(NEW.raw_user_meta_data->>'referred_by','')::UUID;

  INSERT INTO public.profiles (id, username, display_name, avatar_url, referred_by)
  VALUES (NEW.id, v_username,
          NEW.raw_user_meta_data->>'display_name',
          NEW.raw_user_meta_data->>'avatar_url',
          v_referrer);

  IF v_referrer IS NOT NULL THEN
    INSERT INTO public.referrals (referrer_id, referred_user_id, status)
    VALUES (v_referrer, NEW.id, 'pending')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Counter triggers for follows/likes
CREATE OR REPLACE FUNCTION public.bump_counts() RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_TABLE_NAME = 'follows' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.profiles SET followers_count = followers_count + 1 WHERE id = NEW.followed_id;
      UPDATE public.profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.profiles SET followers_count = greatest(0, followers_count - 1) WHERE id = OLD.followed_id;
      UPDATE public.profiles SET following_count = greatest(0, following_count - 1) WHERE id = OLD.follower_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'likes' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.profiles SET likes_count = likes_count + 1 WHERE id = NEW.profile_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.profiles SET likes_count = greatest(0, likes_count - 1) WHERE id = OLD.profile_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;

CREATE TRIGGER follows_count_ins AFTER INSERT ON public.follows FOR EACH ROW EXECUTE FUNCTION public.bump_counts();
CREATE TRIGGER follows_count_del AFTER DELETE ON public.follows FOR EACH ROW EXECUTE FUNCTION public.bump_counts();
CREATE TRIGGER likes_count_ins AFTER INSERT ON public.likes FOR EACH ROW EXECUTE FUNCTION public.bump_counts();
CREATE TRIGGER likes_count_del AFTER DELETE ON public.likes FOR EACH ROW EXECUTE FUNCTION public.bump_counts();

-- Verify a referral when the referred user inserts their first result.
-- Grants a reward at 3/5/10 verified referrals (consumable, single-use each).
CREATE OR REPLACE FUNCTION public.verify_referral_on_result()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_referrer UUID;
  v_count INT;
BEGIN
  -- only first result per user counts
  IF (SELECT count(*) FROM public.results WHERE user_id = NEW.user_id) > 1 THEN
    RETURN NEW;
  END IF;

  UPDATE public.referrals
     SET status = 'verified', verified_at = now()
   WHERE referred_user_id = NEW.user_id AND status = 'pending'
   RETURNING referrer_id INTO v_referrer;

  IF v_referrer IS NULL THEN RETURN NEW; END IF;

  SELECT count(*) INTO v_count FROM public.referrals
   WHERE referrer_id = v_referrer AND status IN ('verified','rewarded');

  IF v_count % 3 = 0 THEN
    INSERT INTO public.rewards (user_id, tier, source) VALUES (v_referrer, 'premium', 'referral_3');
  END IF;
  IF v_count % 5 = 0 THEN
    INSERT INTO public.rewards (user_id, tier, source) VALUES (v_referrer, 'pro', 'referral_5');
  END IF;
  IF v_count % 10 = 0 THEN
    INSERT INTO public.rewards (user_id, tier, source) VALUES (v_referrer, 'ultimate', 'referral_10');
  END IF;

  RETURN NEW;
END $$;

CREATE TRIGGER results_verify_referral
AFTER INSERT ON public.results FOR EACH ROW EXECUTE FUNCTION public.verify_referral_on_result();
