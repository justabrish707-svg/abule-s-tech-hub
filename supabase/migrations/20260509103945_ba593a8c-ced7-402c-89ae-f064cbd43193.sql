
-- 1. Tighten contact_messages INSERT (replace WITH CHECK true with length validation)
DROP POLICY IF EXISTS "Anyone can send messages" ON public.contact_messages;
CREATE POLICY "Anyone can send messages"
  ON public.contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(btrim(name)) BETWEEN 1 AND 100
    AND length(btrim(email)) BETWEEN 3 AND 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(btrim(message)) BETWEEN 1 AND 1000
    AND is_read = false
  );

-- 2. Tighten newsletter_subscribers INSERT
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe"
  ON public.newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(btrim(email)) BETWEEN 3 AND 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND is_active = true
  );

-- 3. Storage: drop broad SELECT policies that allow listing.
-- Public buckets still serve files via public URL without RLS, so direct access keeps working.
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view blog covers" ON storage.objects;

-- 4. SECURITY DEFINER hardening
-- Trigger-only functions: revoke EXECUTE from API roles entirely
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.assign_admin_on_signup() FROM PUBLIC, anon, authenticated;

-- has_role: convert to SECURITY INVOKER so callers only see their own roles
-- (auth.uid() is the current user; user_roles RLS allows reading own roles).
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
