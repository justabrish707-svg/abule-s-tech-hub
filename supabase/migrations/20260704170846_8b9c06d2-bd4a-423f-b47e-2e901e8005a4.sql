
-- Refactor has_role to internally resolve auth.uid() instead of accepting a user_id argument.
-- This prevents any future policy or code path from checking roles for arbitrary users.

CREATE OR REPLACE FUNCTION public.has_role(_role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = _role
  )
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(public.app_role) TO authenticated;

-- Repoint every policy from has_role(auth.uid(), 'admin') to has_role('admin').

-- public.blog_posts
DROP POLICY IF EXISTS "Admins can delete blog posts" ON public.blog_posts;
CREATE POLICY "Admins can delete blog posts" ON public.blog_posts FOR DELETE TO authenticated USING (public.has_role('admin'));
DROP POLICY IF EXISTS "Admins can insert blog posts" ON public.blog_posts;
CREATE POLICY "Admins can insert blog posts" ON public.blog_posts FOR INSERT TO authenticated WITH CHECK (public.has_role('admin'));
DROP POLICY IF EXISTS "Admins can update blog posts" ON public.blog_posts;
CREATE POLICY "Admins can update blog posts" ON public.blog_posts FOR UPDATE TO authenticated USING (public.has_role('admin')) WITH CHECK (public.has_role('admin'));

-- public.contact_messages
DROP POLICY IF EXISTS "Admins can delete contact messages" ON public.contact_messages;
CREATE POLICY "Admins can delete contact messages" ON public.contact_messages FOR DELETE TO authenticated USING (public.has_role('admin'));
DROP POLICY IF EXISTS "Admins can read messages" ON public.contact_messages;
CREATE POLICY "Admins can read messages" ON public.contact_messages FOR SELECT TO authenticated USING (public.has_role('admin'));
DROP POLICY IF EXISTS "Admins can update messages" ON public.contact_messages;
CREATE POLICY "Admins can update messages" ON public.contact_messages FOR UPDATE TO authenticated USING (public.has_role('admin')) WITH CHECK (public.has_role('admin'));

-- public.newsletter_subscribers
DROP POLICY IF EXISTS "Admins can delete newsletter subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can delete newsletter subscribers" ON public.newsletter_subscribers FOR DELETE TO authenticated USING (public.has_role('admin'));
DROP POLICY IF EXISTS "Admins can read subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can read subscribers" ON public.newsletter_subscribers FOR SELECT TO authenticated USING (public.has_role('admin'));

-- public.projects
DROP POLICY IF EXISTS "Admins can delete projects" ON public.projects;
CREATE POLICY "Admins can delete projects" ON public.projects FOR DELETE TO authenticated USING (public.has_role('admin'));
DROP POLICY IF EXISTS "Admins can insert projects" ON public.projects;
CREATE POLICY "Admins can insert projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (public.has_role('admin'));
DROP POLICY IF EXISTS "Admins can update projects" ON public.projects;
CREATE POLICY "Admins can update projects" ON public.projects FOR UPDATE TO authenticated USING (public.has_role('admin')) WITH CHECK (public.has_role('admin'));

-- public.security_audit_trail
DROP POLICY IF EXISTS "Admins can append audit trail" ON public.security_audit_trail;
CREATE POLICY "Admins can append audit trail" ON public.security_audit_trail FOR INSERT TO authenticated WITH CHECK (public.has_role('admin') AND author = auth.uid());
DROP POLICY IF EXISTS "Admins can view audit trail" ON public.security_audit_trail;
CREATE POLICY "Admins can view audit trail" ON public.security_audit_trail FOR SELECT TO authenticated USING (public.has_role('admin'));

-- public.security_finding_status
DROP POLICY IF EXISTS "Admins can delete finding status" ON public.security_finding_status;
CREATE POLICY "Admins can delete finding status" ON public.security_finding_status FOR DELETE TO authenticated USING (public.has_role('admin'));
DROP POLICY IF EXISTS "Admins can insert finding status" ON public.security_finding_status;
CREATE POLICY "Admins can insert finding status" ON public.security_finding_status FOR INSERT TO authenticated WITH CHECK (public.has_role('admin'));
DROP POLICY IF EXISTS "Admins can update finding status" ON public.security_finding_status;
CREATE POLICY "Admins can update finding status" ON public.security_finding_status FOR UPDATE TO authenticated USING (public.has_role('admin')) WITH CHECK (public.has_role('admin'));
DROP POLICY IF EXISTS "Admins can view finding status" ON public.security_finding_status;
CREATE POLICY "Admins can view finding status" ON public.security_finding_status FOR SELECT TO authenticated USING (public.has_role('admin'));

-- storage.objects (blog-covers)
DROP POLICY IF EXISTS "Admins can delete blog covers" ON storage.objects;
CREATE POLICY "Admins can delete blog covers" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'blog-covers' AND public.has_role('admin'));
DROP POLICY IF EXISTS "Admins can update blog covers" ON storage.objects;
CREATE POLICY "Admins can update blog covers" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'blog-covers' AND public.has_role('admin')) WITH CHECK (bucket_id = 'blog-covers' AND public.has_role('admin'));
DROP POLICY IF EXISTS "Admins can upload blog covers" ON storage.objects;
CREATE POLICY "Admins can upload blog covers" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'blog-covers' AND public.has_role('admin'));

-- Drop the old two-argument has_role now that nothing depends on it.
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
