ALTER TABLE public.comments
  ADD CONSTRAINT comments_content_length
  CHECK (length(btrim(content)) BETWEEN 1 AND 1000);