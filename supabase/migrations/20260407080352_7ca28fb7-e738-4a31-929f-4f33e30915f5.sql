-- 1. DB Indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_date ON public.blog_posts (date DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON public.blog_posts (category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON public.blog_posts (author_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments (post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments (parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments (user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments (created_at);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_is_read ON public.contact_messages (is_read);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscribers (email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles (username);
CREATE INDEX IF NOT EXISTS idx_projects_display_order ON public.projects (display_order);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles (user_id);

-- 2. Tighten projects RLS: only admins can insert/update/delete
DROP POLICY IF EXISTS "Authenticated can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated can update projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated can delete projects" ON public.projects;

CREATE POLICY "Admins can insert projects" ON public.projects
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update projects" ON public.projects
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete projects" ON public.projects
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Tighten blog_posts: only admins can insert/update/delete
DROP POLICY IF EXISTS "Authenticated users can insert blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authors can update own posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authors can delete own posts" ON public.blog_posts;

CREATE POLICY "Admins can insert blog posts" ON public.blog_posts
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update blog posts" ON public.blog_posts
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete blog posts" ON public.blog_posts
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 4. Tighten contact_messages read: only admins can read
DROP POLICY IF EXISTS "Authenticated can read messages" ON public.contact_messages;

CREATE POLICY "Admins can read messages" ON public.contact_messages
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 5. Tighten newsletter_subscribers read: only admins
DROP POLICY IF EXISTS "Authenticated can read subscribers" ON public.newsletter_subscribers;

CREATE POLICY "Admins can read subscribers" ON public.newsletter_subscribers
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));