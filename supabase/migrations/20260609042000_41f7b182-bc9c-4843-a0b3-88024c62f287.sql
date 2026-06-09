
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.verify_referral_on_result() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.bump_counts() FROM PUBLIC, anon, authenticated;
-- has_role is used in policies — keep authenticated EXECUTE but revoke anon
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
