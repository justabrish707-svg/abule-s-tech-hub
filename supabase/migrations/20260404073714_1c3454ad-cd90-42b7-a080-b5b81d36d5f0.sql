
ALTER TABLE public.blog_posts ADD COLUMN cover_image text;

INSERT INTO storage.buckets (id, name, public) VALUES ('blog-covers', 'blog-covers', true);

CREATE POLICY "Anyone can view blog covers" ON storage.objects FOR SELECT USING (bucket_id = 'blog-covers');

CREATE POLICY "Authenticated can upload blog covers" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'blog-covers');

CREATE POLICY "Authenticated can update blog covers" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'blog-covers');

CREATE POLICY "Authenticated can delete blog covers" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'blog-covers');
