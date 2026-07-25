
-- 1. Remove privilege-escalation policy on user_roles
DROP POLICY IF EXISTS "Users can insert their own role during signup" ON public.user_roles;

-- 2. Tighten newsletter INSERT policy: require valid-looking email
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe with valid email"
ON public.newsletter_subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL
  AND length(email) BETWEEN 5 AND 254
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- 3. Remove broad SELECT policy on storage.objects for images bucket
--    (Public bucket files remain accessible via their direct public URL;
--     this only prevents clients from listing the bucket contents.)
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;

-- 4. Move SECURITY DEFINER functions out of the exposed public schema
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated, anon, service_role;

-- Recreate has_role in private schema
CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION private.get_user_role(_user_id uuid)
RETURNS public.app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Keep a public.has_role wrapper for RPC compatibility BUT make it SECURITY INVOKER,
-- so it's no longer a SECURITY DEFINER function in the exposed schema.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY INVOKER
SET search_path = public
AS $$
  SELECT private.has_role(_user_id, _role)
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS public.app_role
LANGUAGE sql
STABLE SECURITY INVOKER
SET search_path = public
AS $$
  SELECT private.get_user_role(_user_id)
$$;

-- Grant execute on private functions to the roles that need them (via wrappers/policies)
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.get_user_role(uuid) TO anon, authenticated, service_role;

-- Move trigger functions to private schema (they're only called by triggers, not via API)
CREATE OR REPLACE FUNCTION private.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'phone'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION private.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Repoint any existing triggers to the private-schema functions
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT tgname, c.relname AS tblname, n.nspname AS schemaname
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_proc p ON p.oid = t.tgfoid
    JOIN pg_namespace pn ON pn.oid = p.pronamespace
    WHERE NOT t.tgisinternal
      AND pn.nspname = 'public'
      AND p.proname IN ('handle_new_user','update_updated_at_column')
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I.%I', r.tgname, r.schemaname, r.tblname);
    IF r.tgname = 'on_auth_user_created' THEN
      -- recreated below explicitly
      NULL;
    ELSE
      EXECUTE format(
        'CREATE TRIGGER %I BEFORE UPDATE ON %I.%I FOR EACH ROW EXECUTE FUNCTION private.update_updated_at_column()',
        r.tgname, r.schemaname, r.tblname
      );
    END IF;
  END LOOP;
END $$;

-- Recreate auth user trigger if it existed
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION private.handle_new_user();

-- Drop the old public SECURITY DEFINER trigger/utility functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Restrict execute on the remaining public wrapper functions from anon (only authenticated policies use has_role)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated, service_role;
