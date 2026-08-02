-- Lock down SECURITY DEFINER helper functions
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- is_admin() is used inside RLS policies evaluated as the calling role,
-- so authenticated must keep EXECUTE. Anonymous visitors do not need it.
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

-- chatbot_unmatched: append-only log, admin-readable only.
REVOKE UPDATE, DELETE ON public.chatbot_unmatched FROM anon, authenticated;
GRANT INSERT ON public.chatbot_unmatched TO authenticated;
GRANT SELECT ON public.chatbot_unmatched TO authenticated;
GRANT ALL ON public.chatbot_unmatched TO service_role;

DROP POLICY IF EXISTS "No updates to unmatched questions" ON public.chatbot_unmatched;
CREATE POLICY "No updates to unmatched questions"
  ON public.chatbot_unmatched FOR UPDATE TO authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "No deletes of unmatched questions" ON public.chatbot_unmatched;
CREATE POLICY "No deletes of unmatched questions"
  ON public.chatbot_unmatched FOR DELETE TO authenticated
  USING (false);