
-- Security finding status overrides
CREATE TABLE public.security_finding_status (
  finding_id TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('open','fixed','accepted')),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.security_finding_status TO authenticated;
GRANT ALL ON public.security_finding_status TO service_role;
ALTER TABLE public.security_finding_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view finding status"
  ON public.security_finding_status FOR SELECT
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert finding status"
  ON public.security_finding_status FOR INSERT
  TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update finding status"
  ON public.security_finding_status FOR UPDATE
  TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete finding status"
  ON public.security_finding_status FOR DELETE
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Security audit trail
CREATE TABLE public.security_audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('note','status','reviewed')),
  message TEXT NOT NULL,
  author UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_security_audit_trail_finding ON public.security_audit_trail (finding_id, created_at DESC);
GRANT SELECT, INSERT ON public.security_audit_trail TO authenticated;
GRANT ALL ON public.security_audit_trail TO service_role;
ALTER TABLE public.security_audit_trail ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit trail"
  ON public.security_audit_trail FOR SELECT
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can append audit trail"
  ON public.security_audit_trail FOR INSERT
  TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') AND author = auth.uid());

-- Rate-limit store (server-managed; no client access)
CREATE TABLE public.rate_limit_hits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  identifier TEXT NOT NULL,
  hit_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_rate_limit_lookup ON public.rate_limit_hits (action, identifier, hit_at DESC);
GRANT ALL ON public.rate_limit_hits TO service_role;
ALTER TABLE public.rate_limit_hits ENABLE ROW LEVEL SECURITY;
-- No policies: only service_role (bypasses RLS) can touch it.

-- Helper: purge old hits + count within window + optionally record a hit
CREATE OR REPLACE FUNCTION public.check_and_record_rate_limit(
  _action TEXT,
  _identifier TEXT,
  _window_seconds INT,
  _max_hits INT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  hits INT;
  oldest TIMESTAMPTZ;
BEGIN
  DELETE FROM public.rate_limit_hits
    WHERE action = _action
      AND hit_at < now() - make_interval(secs => _window_seconds * 4);

  SELECT COUNT(*), MIN(hit_at) INTO hits, oldest
    FROM public.rate_limit_hits
    WHERE action = _action
      AND identifier = _identifier
      AND hit_at > now() - make_interval(secs => _window_seconds);

  IF hits >= _max_hits THEN
    RETURN jsonb_build_object(
      'ok', false,
      'retry_after_seconds', GREATEST(1, _window_seconds - EXTRACT(EPOCH FROM (now() - oldest))::INT),
      'hits', hits
    );
  END IF;

  INSERT INTO public.rate_limit_hits (action, identifier) VALUES (_action, _identifier);
  RETURN jsonb_build_object('ok', true, 'hits', hits + 1);
END;
$$;
