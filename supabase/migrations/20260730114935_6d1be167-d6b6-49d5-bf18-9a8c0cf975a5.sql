
-- TEAM MEMBERS
CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text,
  bio text,
  photo_url text,
  email text,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.team_members TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_members TO authenticated;
GRANT ALL ON public.team_members TO service_role;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members are viewable when visible" ON public.team_members FOR SELECT USING (is_visible OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage team members" ON public.team_members FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- SITE STATS
CREATE TABLE public.site_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  value text NOT NULL,
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_stats TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_stats TO authenticated;
GRANT ALL ON public.site_stats TO service_role;
ALTER TABLE public.site_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Stats are viewable when visible" ON public.site_stats FOR SELECT USING (is_visible OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage stats" ON public.site_stats FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RESOURCES
CREATE TABLE public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text,
  file_url text,
  is_available boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.resources TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resources TO authenticated;
GRANT ALL ON public.resources TO service_role;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Resources are publicly viewable" ON public.resources FOR SELECT USING (true);
CREATE POLICY "Admins manage resources" ON public.resources FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- SECURITY SCANS
CREATE TABLE public.security_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scanned_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'manual',
  total_findings integer NOT NULL DEFAULT 0,
  fixed_count integer NOT NULL DEFAULT 0,
  ignored_count integer NOT NULL DEFAULT 0,
  open_count integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.security_scans TO authenticated;
GRANT ALL ON public.security_scans TO service_role;
ALTER TABLE public.security_scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage security scans" ON public.security_scans FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- SECURITY FINDINGS
CREATE TABLE public.security_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id uuid REFERENCES public.security_scans(id) ON DELETE CASCADE,
  internal_id text NOT NULL,
  title text NOT NULL,
  description text,
  severity text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'open',
  fix_notes text,
  fixed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.security_findings TO authenticated;
GRANT ALL ON public.security_findings TO service_role;
ALTER TABLE public.security_findings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage security findings" ON public.security_findings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_security_findings_scan ON public.security_findings(scan_id);

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER update_site_stats_updated_at BEFORE UPDATE ON public.site_stats FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON public.resources FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER update_security_scans_updated_at BEFORE UPDATE ON public.security_scans FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER update_security_findings_updated_at BEFORE UPDATE ON public.security_findings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed known fixed findings from previous security work
INSERT INTO public.security_scans (source, total_findings, fixed_count, ignored_count, open_count, notes)
VALUES ('lovable-security-agent', 8, 8, 0, 0, 'Historical baseline of previously remediated findings.');

INSERT INTO public.security_findings (scan_id, internal_id, title, description, severity, status, fix_notes, fixed_at)
SELECT s.id, f.internal_id, f.title, f.description, f.severity, 'fixed', f.fix_notes, now()
FROM public.security_scans s,
(VALUES
  ('SUPA_anon_security_definer_function_executable','Security definer function executable by anon','A SECURITY DEFINER function was callable by anonymous users.','high','Revoked anon execute privileges.'),
  ('SUPA_authenticated_security_definer_function_executable','Security definer function executable by authenticated','A SECURITY DEFINER function was broadly callable.','high','Restricted execute privileges.'),
  ('SUPA_auth_leaked_password_protection','Leaked password protection disabled','Passwords were not checked against known breaches.','medium','Enabled HIBP password protection.'),
  ('SUPA_public_bucket_allows_listing','Public bucket allows listing','Storage bucket allowed object listing by anyone.','medium','Removed public listing policy.'),
  ('SUPA_rls_policy_always_true','RLS policy always true','A policy evaluated to true for all rows.','high','Scoped policy to owner/admin checks.'),
  ('user_roles_self_assign_any_role','Users could self-assign roles','Insert policy allowed users to grant themselves admin.','critical','Removed self-assign insert policy.'),
  ('images_bucket_public_no_select_policy','Images bucket public without select policy','Public bucket lacked an explicit select policy.','low','Confirmed bucket holds public marketing assets only; listing blocked.'),
  ('profiles_missing_delete_policy','Profiles missing delete policy','No delete policy existed on profiles.','low','Added owner-scoped delete policy.')
) AS f(internal_id,title,description,severity,fix_notes)
WHERE s.source = 'lovable-security-agent';
