-- rate_limit_hits: explicit, service-only access model
REVOKE ALL ON public.rate_limit_hits FROM anon, authenticated;
GRANT ALL ON public.rate_limit_hits TO service_role;
ALTER TABLE public.rate_limit_hits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_hits FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "No client access to rate limit hits" ON public.rate_limit_hits;
CREATE POLICY "No client access to rate limit hits"
ON public.rate_limit_hits
AS RESTRICTIVE
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

COMMENT ON TABLE public.rate_limit_hits IS 'Internal rate limit ledger. Written/read only by the SECURITY DEFINER function check_and_record_rate_limit and service_role. No client role has any access.';

-- security_scan_snapshots: snapshots are append-only, updates explicitly denied
REVOKE UPDATE ON public.security_scan_snapshots FROM anon, authenticated;

DROP POLICY IF EXISTS "Snapshots are immutable" ON public.security_scan_snapshots;
CREATE POLICY "Snapshots are immutable"
ON public.security_scan_snapshots
AS RESTRICTIVE
FOR UPDATE
TO anon, authenticated
USING (false)
WITH CHECK (false);

COMMENT ON TABLE public.security_scan_snapshots IS 'Append-only security scan history. Admins may insert, read and delete; updates are intentionally denied so stored snapshots cannot be silently modified.';