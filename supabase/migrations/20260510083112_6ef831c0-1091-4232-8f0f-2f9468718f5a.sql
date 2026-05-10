
-- Admins can delete contact messages
CREATE POLICY "Admins can delete contact messages"
ON public.contact_messages FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete newsletter subscribers
CREATE POLICY "Admins can delete newsletter subscribers"
ON public.newsletter_subscribers FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Restrict blog-covers bucket modifications to admins
DROP POLICY IF EXISTS "Authenticated can upload blog covers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update blog covers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete blog covers" ON storage.objects;
DROP POLICY IF EXISTS "Anyone authenticated can upload blog covers" ON storage.objects;
DROP POLICY IF EXISTS "Anyone authenticated can update blog covers" ON storage.objects;
DROP POLICY IF EXISTS "Anyone authenticated can delete blog covers" ON storage.objects;

CREATE POLICY "Admins can upload blog covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-covers' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update blog covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'blog-covers' AND public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'blog-covers' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete blog covers"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'blog-covers' AND public.has_role(auth.uid(), 'admin'::app_role));
