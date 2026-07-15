
CREATE TABLE public.security_scan_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual',
  findings JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_count INT NOT NULL DEFAULT 0,
  open_count INT NOT NULL DEFAULT 0,
  fixed_count INT NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.security_scan_snapshots TO authenticated;
GRANT ALL ON public.security_scan_snapshots TO service_role;

ALTER TABLE public.security_scan_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view scan snapshots"
  ON public.security_scan_snapshots FOR SELECT
  TO authenticated
  USING (public.has_role('admin'));

CREATE POLICY "Admins can insert scan snapshots"
  ON public.security_scan_snapshots FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role('admin') AND (created_by IS NULL OR created_by = auth.uid()));

CREATE POLICY "Admins can delete scan snapshots"
  ON public.security_scan_snapshots FOR DELETE
  TO authenticated
  USING (public.has_role('admin'));

CREATE INDEX security_scan_snapshots_created_at_idx
  ON public.security_scan_snapshots (created_at DESC);
