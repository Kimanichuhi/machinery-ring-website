-- ============================================================
-- Machinery Ring — full schema for project zsrnodjburezmlnuuzrt
-- Reconstructed from supabase/migrations/*, collapsed to the
-- final (security-hardened) end state — NOT a literal replay of
-- history, so the since-fixed user_roles self-assign bug and the
-- public-listing storage bug are not reintroduced.
-- Safe to re-run: every statement is idempotent.
-- ============================================================

-- Required: LANGUAGE sql functions below (has_role/get_user_role) are
-- defined before public.user_roles exists. Postgres validates SQL-language
-- function bodies against real tables at CREATE FUNCTION time unless this
-- is off (pg_dump always sets it for this exact reason).
SET check_function_bodies = false;

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

-- ---------- Types ----------
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'tots', 'manager', 'farmer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------- Helper schema + functions (final hardened form) ----------
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated, anon, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION private.get_user_role(_user_id uuid)
RETURNS public.app_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT private.has_role(_user_id, _role)
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS public.app_role LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT private.get_user_role(_user_id)
$$;

GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.get_user_role(uuid) TO anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated, service_role;

-- New-signup trigger: creates a profile row only. Role assignment is
-- deliberately NOT self-service (that was the critical bug that got
-- fixed) — an admin must grant roles via user_roles directly.
CREATE OR REPLACE FUNCTION private.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'phone');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- ---------- Tables ----------

-- These three were created by hand via the dashboard earlier and are
-- confirmed empty (0 rows) but missing constraints the app needs (e.g.
-- services.id has no primary key, which breaks the bookings FK below).
-- Safe to drop and let CREATE TABLE rebuild them correctly.
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.guides CASCADE;
DROP TABLE IF EXISTS public.page_content CASCADE;

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  unit text DEFAULT 'each',
  location text DEFAULT '',
  rating numeric DEFAULT 0,
  stock integer DEFAULT 0,
  image_url text DEFAULT '/placeholder.svg',
  tags text[] DEFAULT '{}',
  is_available boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  src text NOT NULL,
  alt text DEFAULT '',
  title text DEFAULT '',
  description text DEFAULT '',
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.page_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug text NOT NULL,
  section_key text NOT NULL,
  title text DEFAULT '',
  content text DEFAULT '',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (page_slug, section_key)
);

CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  price text DEFAULT '',
  duration text DEFAULT '',
  rating numeric DEFAULT 0,
  features text[] DEFAULT '{}',
  category text DEFAULT '',
  bookings text DEFAULT '',
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.promo_posters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  image_url text NOT NULL,
  link_url text DEFAULT '',
  link_label text DEFAULT 'Learn More',
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text DEFAULT '',
  category text DEFAULT 'General',
  content text DEFAULT '',
  image_url text DEFAULT '',
  read_time text DEFAULT '5 min read',
  is_popular boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  order_number text NOT NULL UNIQUE DEFAULT ('MR-' || to_char(now(), 'YYYYMMDD') || '-' || substr(gen_random_uuid()::text, 1, 6)),
  status text NOT NULL DEFAULT 'pending',
  subtotal numeric NOT NULL DEFAULT 0,
  delivery_fee numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  delivery_address text NOT NULL DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  unit_price numeric NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 1,
  subtotal numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  service_name text DEFAULT '',
  booking_type text NOT NULL DEFAULT 'booking',
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  preferred_date date,
  farm_size text DEFAULT '',
  location text DEFAULT '',
  message text DEFAULT '',
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT '',
  subject text DEFAULT '',
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.team_members (
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

CREATE TABLE IF NOT EXISTS public.site_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  value text NOT NULL,
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.resources (
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

CREATE TABLE IF NOT EXISTS public.security_scans (
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

CREATE TABLE IF NOT EXISTS public.security_findings (
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
CREATE INDEX IF NOT EXISTS idx_security_findings_scan ON public.security_findings(scan_id);

-- ---------- Row Level Security ----------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_posters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_findings ENABLE ROW LEVEL SECURITY;

-- profiles
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
CREATE POLICY "Users can delete their own profile" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- user_roles — deliberately NO insert policy for anon/authenticated (fixed critical bug)
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
CREATE POLICY "Users can view their own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- products
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- gallery_images
DROP POLICY IF EXISTS "Anyone can view gallery" ON public.gallery_images;
CREATE POLICY "Anyone can view gallery" ON public.gallery_images FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can insert gallery" ON public.gallery_images;
CREATE POLICY "Admins can insert gallery" ON public.gallery_images FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update gallery" ON public.gallery_images;
CREATE POLICY "Admins can update gallery" ON public.gallery_images FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can delete gallery" ON public.gallery_images;
CREATE POLICY "Admins can delete gallery" ON public.gallery_images FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- page_content
DROP POLICY IF EXISTS "Anyone can view page content" ON public.page_content;
CREATE POLICY "Anyone can view page content" ON public.page_content FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can insert page content" ON public.page_content;
CREATE POLICY "Admins can insert page content" ON public.page_content FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update page content" ON public.page_content;
CREATE POLICY "Admins can update page content" ON public.page_content FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can delete page content" ON public.page_content;
CREATE POLICY "Admins can delete page content" ON public.page_content FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- services
DROP POLICY IF EXISTS "Anyone can view services" ON public.services;
CREATE POLICY "Anyone can view services" ON public.services FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can insert services" ON public.services;
CREATE POLICY "Admins can insert services" ON public.services FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update services" ON public.services;
CREATE POLICY "Admins can update services" ON public.services FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can delete services" ON public.services;
CREATE POLICY "Admins can delete services" ON public.services FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- promo_posters
GRANT SELECT ON public.promo_posters TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promo_posters TO authenticated;
GRANT ALL ON public.promo_posters TO service_role;
DROP POLICY IF EXISTS "Anyone can view posters" ON public.promo_posters;
CREATE POLICY "Anyone can view posters" ON public.promo_posters FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can insert posters" ON public.promo_posters;
CREATE POLICY "Admins can insert posters" ON public.promo_posters FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update posters" ON public.promo_posters;
CREATE POLICY "Admins can update posters" ON public.promo_posters FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can delete posters" ON public.promo_posters;
CREATE POLICY "Admins can delete posters" ON public.promo_posters FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- guides
GRANT SELECT ON public.guides TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guides TO authenticated;
GRANT ALL ON public.guides TO service_role;
DROP POLICY IF EXISTS "Anyone can view published guides" ON public.guides;
CREATE POLICY "Anyone can view published guides" ON public.guides FOR SELECT USING (is_published OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can insert guides" ON public.guides;
CREATE POLICY "Admins can insert guides" ON public.guides FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update guides" ON public.guides;
CREATE POLICY "Admins can update guides" ON public.guides FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can delete guides" ON public.guides;
CREATE POLICY "Admins can delete guides" ON public.guides FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- newsletter_subscribers (final hardened insert policy)
GRANT INSERT ON public.newsletter_subscribers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Anyone can subscribe with valid email" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe with valid email" ON public.newsletter_subscribers FOR INSERT TO anon, authenticated
  WITH CHECK (email IS NOT NULL AND length(email) BETWEEN 5 AND 254 AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
DROP POLICY IF EXISTS "Admins can view subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can view subscribers" ON public.newsletter_subscribers FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can update subscribers" ON public.newsletter_subscribers FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can delete subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can delete subscribers" ON public.newsletter_subscribers FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- orders
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
DROP POLICY IF EXISTS "Users view own orders" ON public.orders;
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Users create own orders" ON public.orders;
CREATE POLICY "Users create own orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins update orders" ON public.orders;
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins delete orders" ON public.orders;
CREATE POLICY "Admins delete orders" ON public.orders FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- order_items
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
DROP POLICY IF EXISTS "Users view own order items" ON public.order_items;
CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));
DROP POLICY IF EXISTS "Users create own order items" ON public.order_items;
CREATE POLICY "Users create own order items" ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
DROP POLICY IF EXISTS "Admins delete order items" ON public.order_items;
CREATE POLICY "Admins delete order items" ON public.order_items FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- bookings
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT INSERT ON public.bookings TO anon;
GRANT ALL ON public.bookings TO service_role;
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
CREATE POLICY "Anyone can create bookings" ON public.bookings FOR INSERT TO anon, authenticated
  WITH CHECK (length(full_name) > 0 AND length(email) >= 5 AND length(phone) >= 6);
DROP POLICY IF EXISTS "Users view own bookings" ON public.bookings;
CREATE POLICY "Users view own bookings" ON public.bookings FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins update bookings" ON public.bookings;
CREATE POLICY "Admins update bookings" ON public.bookings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins delete bookings" ON public.bookings;
CREATE POLICY "Admins delete bookings" ON public.bookings FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- contact_messages
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT INSERT ON public.contact_messages TO anon;
GRANT ALL ON public.contact_messages TO service_role;
DROP POLICY IF EXISTS "Anyone can send message" ON public.contact_messages;
CREATE POLICY "Anyone can send message" ON public.contact_messages FOR INSERT TO anon, authenticated
  WITH CHECK (length(name) > 0 AND length(message) > 0 AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
DROP POLICY IF EXISTS "Admins view messages" ON public.contact_messages;
CREATE POLICY "Admins view messages" ON public.contact_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins update messages" ON public.contact_messages;
CREATE POLICY "Admins update messages" ON public.contact_messages FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins delete messages" ON public.contact_messages;
CREATE POLICY "Admins delete messages" ON public.contact_messages FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- team_members
GRANT SELECT ON public.team_members TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_members TO authenticated;
GRANT ALL ON public.team_members TO service_role;
DROP POLICY IF EXISTS "Team members are viewable when visible" ON public.team_members;
CREATE POLICY "Team members are viewable when visible" ON public.team_members FOR SELECT USING (is_visible OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins manage team members" ON public.team_members;
CREATE POLICY "Admins manage team members" ON public.team_members FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- site_stats
GRANT SELECT ON public.site_stats TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_stats TO authenticated;
GRANT ALL ON public.site_stats TO service_role;
DROP POLICY IF EXISTS "Stats are viewable when visible" ON public.site_stats;
CREATE POLICY "Stats are viewable when visible" ON public.site_stats FOR SELECT USING (is_visible OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins manage stats" ON public.site_stats;
CREATE POLICY "Admins manage stats" ON public.site_stats FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- resources
GRANT SELECT ON public.resources TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resources TO authenticated;
GRANT ALL ON public.resources TO service_role;
DROP POLICY IF EXISTS "Resources are publicly viewable" ON public.resources;
CREATE POLICY "Resources are publicly viewable" ON public.resources FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage resources" ON public.resources;
CREATE POLICY "Admins manage resources" ON public.resources FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- security_scans / security_findings (admin-only, no public access)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.security_scans TO authenticated;
GRANT ALL ON public.security_scans TO service_role;
DROP POLICY IF EXISTS "Admins manage security scans" ON public.security_scans;
CREATE POLICY "Admins manage security scans" ON public.security_scans FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.security_findings TO authenticated;
GRANT ALL ON public.security_findings TO service_role;
DROP POLICY IF EXISTS "Admins manage security findings" ON public.security_findings;
CREATE POLICY "Admins manage security findings" ON public.security_findings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ---------- Triggers ----------
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS update_page_content_updated_at ON public.page_content;
CREATE TRIGGER update_page_content_updated_at BEFORE UPDATE ON public.page_content FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS update_promo_posters_updated_at ON public.promo_posters;
CREATE TRIGGER update_promo_posters_updated_at BEFORE UPDATE ON public.promo_posters FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS update_guides_updated_at ON public.guides;
CREATE TRIGGER update_guides_updated_at BEFORE UPDATE ON public.guides FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS bookings_updated_at ON public.bookings;
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS update_team_members_updated_at ON public.team_members;
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS update_site_stats_updated_at ON public.site_stats;
CREATE TRIGGER update_site_stats_updated_at BEFORE UPDATE ON public.site_stats FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS update_resources_updated_at ON public.resources;
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON public.resources FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS update_security_scans_updated_at ON public.security_scans;
CREATE TRIGGER update_security_scans_updated_at BEFORE UPDATE ON public.security_scans FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS update_security_findings_updated_at ON public.security_findings;
CREATE TRIGGER update_security_findings_updated_at BEFORE UPDATE ON public.security_findings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION private.handle_new_user();

-- ---------- Order pricing integrity (server-side price enforcement) ----------
-- The cart is client-side (localStorage) and Cart.tsx used to send
-- unit_price/subtotal/total straight from client state. RLS only checked
-- auth.uid() = user_id, never the price, so any authenticated customer
-- could tamper their cart and check out real products at an arbitrary
-- price. These triggers recompute pricing server-side and ignore
-- client-submitted numeric values.
CREATE OR REPLACE FUNCTION public.zero_new_order_totals()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.subtotal := 0;
  NEW.total := 0;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS zero_new_order_totals ON public.orders;
CREATE TRIGGER zero_new_order_totals BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.zero_new_order_totals();

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS delivery_fee_non_negative;
ALTER TABLE public.orders ADD CONSTRAINT delivery_fee_non_negative CHECK (delivery_fee >= 0);

CREATE OR REPLACE FUNCTION public.enforce_order_item_price()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  current_price numeric;
BEGIN
  IF NEW.product_id IS NULL THEN
    RAISE EXCEPTION 'order_items.product_id is required';
  END IF;
  SELECT price INTO current_price FROM public.products WHERE id = NEW.product_id;
  IF current_price IS NULL THEN
    RAISE EXCEPTION 'Unknown product %', NEW.product_id;
  END IF;
  NEW.unit_price := current_price;
  NEW.subtotal := current_price * NEW.quantity;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS enforce_order_item_price ON public.order_items;
CREATE TRIGGER enforce_order_item_price BEFORE INSERT ON public.order_items FOR EACH ROW EXECUTE FUNCTION public.enforce_order_item_price();

CREATE OR REPLACE FUNCTION public.recompute_order_totals()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_subtotal numeric;
BEGIN
  SELECT COALESCE(SUM(subtotal), 0) INTO new_subtotal FROM public.order_items WHERE order_id = NEW.order_id;
  UPDATE public.orders SET subtotal = new_subtotal, total = new_subtotal + delivery_fee WHERE id = NEW.order_id;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS recompute_order_totals ON public.order_items;
CREATE TRIGGER recompute_order_totals AFTER INSERT ON public.order_items FOR EACH ROW EXECUTE FUNCTION public.recompute_order_totals();

-- ---------- Storage bucket for images ----------
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Admins can upload images" ON storage.objects;
CREATE POLICY "Admins can upload images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'images' AND public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update images" ON storage.objects;
CREATE POLICY "Admins can update images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'images' AND public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can delete images" ON storage.objects;
CREATE POLICY "Admins can delete images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'images' AND public.has_role(auth.uid(), 'admin'));
-- Note: deliberately no public SELECT/listing policy on storage.objects.
-- Files in the public "images" bucket are still fetchable by their direct
-- URL (public buckets serve objects without an RLS check); this only
-- blocks anyone from *listing* the bucket's contents via the API.

-- ---------- Seed: historical security findings (informational) ----------
INSERT INTO public.security_scans (source, total_findings, fixed_count, ignored_count, open_count, notes)
SELECT 'security-audit', 8, 8, 0, 0, 'Historical baseline of previously remediated findings.'
WHERE NOT EXISTS (SELECT 1 FROM public.security_scans WHERE source = 'security-audit');

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
WHERE s.source = 'security-audit'
  AND NOT EXISTS (SELECT 1 FROM public.security_findings WHERE internal_id = f.internal_id);
-- GUIDES DATA
INSERT INTO public.guides (id, slug, title, description, category, content, image_url, read_time, is_popular, is_published, sort_order, created_at, updated_at) VALUES
  ('a3371459-1386-4410-8472-d63bdd48c340', 'maize-farming', 'Complete Guide to Maize Farming', 'From land preparation to harvesting, learn everything about successful maize cultivation.', 'Crop Guides', '## Land Preparation
Plough land 2-3 weeks before planting. Test soil pH (ideal 5.5-7.0) and add lime if acidic.

## Seed Selection
Use certified hybrid seeds suited to your region. Recommended varieties: H614, H6213, DK8031.

## Planting
- Spacing: 75cm between rows, 25cm between plants
- Depth: 3-5cm
- 2 seeds per hole, thin to 1 strong seedling after germination

## Fertilization
Apply DAP at planting (50kg/acre) and top-dress with CAN at knee-height (50kg/acre).

## Pest & Disease Management
Scout weekly for fall armyworm, stalk borer, and MLN. Use IPM approach.

## Harvesting
Harvest when husks dry and moisture is below 20%. Dry to 13.5% before storage.', '', '15 min read', true, true, 1, '2026-06-04 19:37:44.173925+00', '2026-06-04 19:37:44.173925+00'),
  ('87dcb181-7843-4fb7-a15e-f271fd9b2b8a', 'organic-farming', 'Organic Farming Practices', 'Sustainable farming methods to improve soil health and crop quality naturally.', 'Sustainable Farming', '## Building Healthy Soil
Use compost, green manures, and cover crops to maintain soil fertility.

## Natural Pest Control
Encourage beneficial insects. Use neem oil, pyrethrum, and crop rotation.

## Composting Basics
Layer browns (dry leaves, straw) and greens (kitchen waste, fresh manure) in 3:1 ratio.', '', '12 min read', false, true, 2, '2026-06-04 19:37:44.173925+00', '2026-06-04 19:37:44.173925+00'),
  ('d9cd3ab1-ed97-4044-aefa-437ca04568f2', 'water-management', 'Water Management Techniques', 'Efficient irrigation methods and water conservation strategies for your farm.', 'Water Management', '## Drip Irrigation
Most water-efficient method. Saves up to 60% water compared to flood irrigation.

## Mulching
Reduces evaporation by 50-70%. Use straw, grass, or plastic mulch.

## Rainwater Harvesting
Collect from roofs into tanks. Build farm ponds for runoff capture.', '', '10 min read', true, true, 3, '2026-06-04 19:37:44.173925+00', '2026-06-04 19:37:44.173925+00'),
  ('bb4df476-1680-48cc-9521-af55f936a387', 'pest-control', 'Pest and Disease Control', 'Identify, prevent, and treat common agricultural pests and diseases.', 'Plant Health', '## Integrated Pest Management (IPM)
Combine biological, cultural, and chemical methods. Chemicals are last resort.

## Common Pests in Kenya
- Fall armyworm (maize)
- Aphids (vegetables)
- Tuta absoluta (tomatoes)

## Disease Prevention
- Use certified seeds
- Practice crop rotation
- Maintain field hygiene', '', '18 min read', false, true, 4, '2026-06-04 19:37:44.173925+00', '2026-06-04 19:37:44.173925+00'),
  ('8eb0fb01-5d25-4a9d-bee9-1ae6b151d94c', 'dairy-farming-in-kenya', 'Dairy Farming in Kenya: A Complete Beginner''s Guide', 'How to start a profitable dairy farm in Kenya â breed selection, feeding, housing, health, and milk production optimization.', 'Livestock', '## Why Dairy Farming in Kenya

Dairy farming is one of Kenya''s most reliable agribusinesses. Steady local demand for milk, established cooperatives, and improved breeds make it a strong entry point for both smallholders and commercial farmers.

## Starting a Dairy Farm

- Assess land, water and feed availability before buying animals
- Register with your county''s livestock office and local dairy cooperative
- Start small (2â5 cows) and scale as you learn
- Budget for housing, feed, veterinary care and milk handling equipment

## Breed Selection

- **Friesian** â highest milk yields, needs quality feed and good management
- **Ayrshire** â hardy, good butterfat, suits medium-altitude areas
- **Jersey** â smaller intake, rich creamy milk, excellent for smallholders
- **Guernsey** â moderate yields, good in warmer regions
- Cross-breeds with local Zebu often perform well in low-input systems

## Feeding for High Milk Production

- Provide fresh forage daily (Napier grass, Boma Rhodes, lucerne)
- Supplement with dairy meal based on milk yield (1 kg per 2â3 L above maintenance)
- Ensure constant access to clean water and mineral licks
- Conserve silage for the dry season to keep production steady

## Housing and Hygiene

- Build a well-ventilated zero-grazing unit with a concrete floor
- Separate resting, feeding and milking areas
- Clean the shed daily and disinfect milking equipment before every use

## Health and Reproduction

- Vaccinate against Foot and Mouth, Lumpy Skin Disease and Anthrax
- Deworm every 3 months and control ticks weekly
- Heat-detect twice a day and inseminate 12 hours after standing heat
- Dry the cow off 60 days before calving to protect the next lactation

## Milk Handling and Marketing

- Milk at the same time each day and cool milk within one hour
- Deliver to your cooperative or processor promptly to preserve quality
- Keep records of daily yield, feed use and veterinary costs to track profit

## Common Mistakes to Avoid

- Overstocking before fodder is secured
- Skipping vaccinations to save money
- Poor record keeping â you cannot improve what you don''t measure

Dairy farming rewards consistency. Start small, invest in nutrition and animal health, and grow from there.', '', '10 min read', true, true, 1, '2026-07-25 13:28:02.086588+00', '2026-07-25 13:28:02.086588+00')
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug, title = EXCLUDED.title, description = EXCLUDED.description, category = EXCLUDED.category,
  content = EXCLUDED.content, image_url = EXCLUDED.image_url, read_time = EXCLUDED.read_time,
  is_popular = EXCLUDED.is_popular, is_published = EXCLUDED.is_published, sort_order = EXCLUDED.sort_order,
  updated_at = EXCLUDED.updated_at;

-- PAGE_CONTENT DATA
INSERT INTO public.page_content (id, page_slug, section_key, title, content, metadata, created_at, updated_at) VALUES
  ('4a552956-fc23-4eef-bf33-83aaa4f78506', 'home', 'hero', 'Smart Farming, Better Yields', 'Connect with quality agricultural inputs, expert services, and a thriving community of farmers across Kenya. Transform your farming with Machinery Ring.', '{"cta_primary":{"href":"/marketplace","label":"Explore Marketplace"},"cta_secondary":{"href":"/services","label":"Our Services"},"image":"herobg.jpg"}'::jsonb, '2026-07-07 20:22:54.605394+00', '2026-07-07 20:22:54.605394+00'),
  ('7aedd194-e5a9-47b1-bf98-6f7db551be27', 'home', 'stats', '', '', '{"items":[{"icon":"Users","name":"Active Farmers","value":"5,000+"},{"icon":"ShoppingCart","name":"Products Listed","value":"1,200+"},{"icon":"Award","name":"Expert Services","value":"50+"},{"icon":"TrendingUp","name":"Yield Improvement","value":"35%"}]}'::jsonb, '2026-07-07 20:22:54.605394+00', '2026-07-07 20:22:54.605394+00'),
  ('92cda90c-a314-40a4-9707-29ce4b444858', 'home', 'features', 'Everything You Need for Successful Farming', 'From premium inputs to expert guidance, we provide comprehensive solutions for modern agricultural practices.', '{"items":[{"color":"text-green-600","description":"Premium seeds, fertilizers, and farming tools from trusted suppliers across Kenya.","icon":"Leaf","name":"Quality Agricultural Inputs"},{"color":"text-blue-600","description":"Professional consultancy, soil testing, and irrigation setup by certified agricultural experts.","icon":"Wrench","name":"Expert Farm Services"},{"color":"text-purple-600","description":"Comprehensive guides, seasonal tips, and best practices for sustainable farming.","icon":"BookOpen","name":"Educational Resources"},{"color":"text-orange-600","description":"Connect with fellow farmers, buy and sell produce, and access local agricultural markets.","icon":"Users","name":"Community Marketplace"}]}'::jsonb, '2026-07-07 20:22:54.605394+00', '2026-07-07 20:22:54.605394+00'),
  ('d9ef26c7-1aa2-4f61-a415-7e14c46c82ae', 'home', 'products_showcase', 'Premium Agricultural Products', 'Discover our carefully curated selection of seeds, fertilizers, tools, and fresh produce from verified suppliers across Kenya.', '{"badge":"Featured Products","cta":{"href":"/marketplace","label":"Browse All Products"},"image":"productDisplay.jpg"}'::jsonb, '2026-07-07 20:22:54.605394+00', '2026-07-07 20:22:54.605394+00'),
  ('80e0f379-61be-4983-9090-4ee452593dbe', 'home', 'testimonials', 'Trusted by Farmers Across Kenya', 'See how Machinery Ring is helping farmers achieve better yields and sustainable growth.', '{"items":[{"author":"Paul Wachanga","content":"Through the capacity building workshops, I learned about climate-smart farming and financial management â very practical lessons.","location":"Matura MR","role":"Smallholder Farmer"},{"author":"Martin Macharia","content":"Before I started using lime supplied by Machinery Ring, my soil was too acidic, and my potato yields kept dropping every season. After proper soil testing and lime application guidance from the team, my yields have more than doubled!","location":"Weru MR","role":"Potato Farmer"},{"author":"Faith Wanjiku","content":"Mechanization has made farming easier for me as a woman. The team is professional and the machines are always in good condition. My maize yields have greatly improved.","location":"Rurii MR","role":"Maize Farmer"}]}'::jsonb, '2026-07-07 20:22:54.605394+00', '2026-07-07 20:22:54.605394+00'),
  ('fa47929d-6f58-455a-89c7-a6ae596548b4', 'home', 'cta', 'Ready to Transform Your Farming?', 'Join thousands of farmers who are already using Machinery Ring to improve their yields and grow their agricultural business.', '{"cta_primary":{"href":"/marketplace","label":"Start Shopping"},"cta_secondary":{"href":"/services","label":"Book Consultation"}}'::jsonb, '2026-07-07 20:22:54.605394+00', '2026-07-07 20:22:54.605394+00'),
  ('f6c91e17-0f49-4195-baaf-1535aa744729', 'about', 'hero', 'About Machinery Ring', 'Machinery Ring Ltd is a farmer-based agricultural organization dedicated to empowering smallholder farmers through shared resources, modern technologies, and innovative farming solutions. Founded on the principle of collective strength, the firm enables farmers to pool their challenges and efforts together, creating a strong network that supports mechanization, training, and agribusiness growth. Its core focus areas include Farmers Organization, Mechanisation, Capacity Building, and Farmer-to-Farmer Services, all designed to enhance productivity, sustainability, and profitability across the agricultural value chain.

The organization also engages in complementary services such as Agro-Dealership, Agronomy Services, Soil Sampling and Testing, Aggregation and Marketing, and Feed Formulation. These services ensure farmers have access to quality farm inputs, technical guidance, and reliable markets for their produce. With branches spread across ten regions including Kaimbaga, Rurii, Matura, Weru, Tumaini, Kihoto, Mawingu, Kanjuiri, Ngorika, and Mirangine, Machinery Ring brings agricultural transformation closer to rural communities through hands-on support and professional expertise.

Guided by the slogan "Service to Farmers," Machinery Ring Ltd continues to be a trusted partner in advancing modern agriculture. Through collaboration with farmers, training of trainers (TOTs), and innovative agricultural programs, the firm is bridging the gap between traditional and modern farming. Its commitment to capacity building, mechanization, and market access has made it a driving force in improving livelihoods and promoting sustainable farming practices across Nyandarua County and beyond.', '{"image":"/mrlogo.png"}'::jsonb, '2026-07-07 20:22:54.605394+00', '2026-07-07 20:22:54.605394+00'),
  ('ed332cba-29dd-4426-ab02-21019dcdb6da', 'about', 'stats', '', '', '{"items":[{"icon":"Users","name":"Farmers Served","value":"6,000+"},{"icon":"Award","name":"Years of Experience","value":"4+"},{"icon":"Globe","name":"Sub-Counties Covered","value":"2"},{"icon":"Target","name":"Success Rate","value":"80%"}]}'::jsonb, '2026-07-07 20:22:54.605394+00', '2026-07-07 20:22:54.605394+00'),
  ('58882258-d7bd-4621-9108-4a382a2ed2f4', 'about', 'mission', 'Our Mission', 'To transform East African agriculture by connecting farmers with quality inputs, expert knowledge, and innovative solutions that increase productivity, improve livelihoods, and promote sustainable farming practices.

We believe that every farmer deserves access to the tools and knowledge needed to succeed, regardless of their location or farm size.', '{}'::jsonb, '2026-07-07 20:22:54.605394+00', '2026-07-07 20:22:54.605394+00'),
  ('839e42eb-a9c7-4e90-9390-d689c73b0419', 'about', 'vision', 'Our Vision', 'To be the leading agricultural platform in East Africa, fostering a thriving ecosystem where farmers achieve food security, economic prosperity, and environmental sustainability through innovative agricultural practices.

We envision a future where technology and traditional wisdom work hand in hand to create resilient and productive farming communities.', '{}'::jsonb, '2026-07-07 20:22:54.605394+00', '2026-07-07 20:22:54.605394+00'),
  ('08cc6eda-4192-46a0-805b-a658b72f9bb9', 'about', 'values', 'Our Core Values', 'The principles that guide everything we do at Machinery Ring.', '{"items":[{"description":"We promote environmentally responsible farming practices that preserve our land for future generations.","icon":"Leaf","title":"Farmer Organization"},{"description":"Building strong relationships with farmers and creating networks that support mutual growth and learning.","icon":"Users","title":"Mechanisation"},{"description":"Delivering high-quality products and services that exceed expectations and drive agricultural success.","icon":"Users","title":"Capacity Building"},{"description":"Operating with honesty, transparency, and fairness in all our dealings with farmers and partners.","icon":"Heart","title":"Farmer-to-Farmer Agency"}]}'::jsonb, '2026-07-07 20:22:54.605394+00', '2026-07-07 20:22:54.605394+00'),
  ('26d5b6cf-4690-4d92-9a39-c4398e978e18', 'about', 'team', 'Meet Our Team', 'Agricultural experts and technology professionals dedicated to supporting farmers', '{"items":[{"bio":"PhD in Agricultural Sciences with 15+ years of experience in crop production and sustainable farming.","image":"/placeholder.svg","name":"Jeremiah Mwangi","role":"MR Manager"},{"bio":"Former cooperative leader with extensive knowledge of East African farming practices and market dynamics.","image":"/placeholder.svg","name":"Reuben Murituh","role":"Assistant MR Manager"},{"bio":"Expert in agricultural technology and digital solutions for modern farming challenges.","image":"/placeholder.svg","name":"Pauline Kariuki","role":"Accounting and Monitoring and Evaluation Officer"}]}'::jsonb, '2026-07-07 20:22:54.605394+00', '2026-07-07 20:22:54.605394+00'),
  ('3211122e-e421-41e2-92cb-663743ea6ee5', 'about', 'cta', 'Ready to Join Our Community?', 'Become part of a thriving network of farmers who are transforming agriculture across Kenya with sustainable and profitable farming practices.', '{"cta_primary":{"href":"/marketplace","label":"Get Started Today"},"cta_secondary":{"href":"/contact","label":"Contact Us"}}'::jsonb, '2026-07-07 20:22:54.605394+00', '2026-07-07 20:22:54.605394+00'),
  ('4503d1c7-7f8f-4c5a-b439-7d295e75f5b8', 'services', 'hero', 'Expert Agricultural Services', 'Professional farming services from certified experts to help you maximize yields, optimize resources and grow your agricultural business.', '{}'::jsonb, '2026-07-07 20:22:54.605394+00', '2026-07-07 20:22:54.605394+00'),
  ('9d0ca528-c365-409a-8b22-f38f1265b57b', 'services', 'stats', '', '', '{"items":[{"icon":"Users","name":"Certified Experts","value":"50+"},{"icon":"Award","name":"Services Completed","value":"2,800+"},{"icon":"CheckCircle","name":"Satisfaction Rate","value":"98%"}]}'::jsonb, '2026-07-07 20:22:54.605394+00', '2026-07-07 20:22:54.605394+00'),
  ('f712eaee-e5e4-43bf-a91a-77ed9e444cc9', 'services', 'cta', 'Need Custom Agricultural Support?', 'Our team of agricultural experts is ready to provide personalized solutions for your specific farming needs.', '{"cta_primary":{"href":"/contact","label":"Contact Our Experts"},"cta_secondary":{"href":"/contact","label":"Request Quote"}}'::jsonb, '2026-07-07 20:22:54.605394+00', '2026-07-07 20:22:54.605394+00'),
  ('c09f9632-8960-43c3-be8c-5a197366d536', 'gallery', 'hero', 'Photo Gallery', 'Explore our collection of images showcasing farming activities, products, and community events.', '{}'::jsonb, '2026-07-07 20:22:54.605394+00', '2026-07-07 20:22:54.605394+00'),
  ('4514eefa-b0c3-408b-91f2-2828186db439', 'gallery', 'footer', 'More Photos Coming Soon', 'We''re continuously updating our gallery with new images from the field. Check back regularly for updates!', '{}'::jsonb, '2026-07-07 20:22:54.605394+00', '2026-07-07 20:22:54.605394+00')
ON CONFLICT (page_slug, section_key) DO UPDATE SET
  title = EXCLUDED.title, content = EXCLUDED.content, metadata = EXCLUDED.metadata, updated_at = EXCLUDED.updated_at;

-- SERVICES DATA
INSERT INTO public.services (id, name, description, price, duration, rating, features, category, bookings, sort_order, created_at, updated_at) VALUES
  ('1e95ffe9-dbdd-40c1-8b31-fe64fb2a562e', 'Mechanization Services', 'Professional agricultural advice from certified experts to optimize your farming practices.', 'Price Per Service', 'Based on Workload', 4.8, ARRAY['Disc Harrow', 'Mouldboard Plough', 'Chisel Plough', 'Subsoiler', 'Rotavator', 'Motorised Sprayer', 'Maize Planter', 'Potato Planter', 'Potato Harvester', 'Maize Sheller', 'Feed Mixer', 'Chopper', 'Follow-up support']::text[], 'Paid-Service', '3000+', 1, '2026-03-08 17:58:32.960477+00', '2026-03-08 17:58:32.960477+00'),
  ('4ac6299f-ad10-4e8b-b932-89175b2bc364', 'Feed Formulation Services', 'Professional agricultural advice from certified experts to optimize your farming practices.', 'From KES 5,000', '2-4 hours', 4.8, ARRAY['Custom feed mixing for different livestock.', 'Feed cost analysis and management.', 'Use of organic and locally available materials.', 'Packaging and storage best practices.', 'Feed ratio optimization and cost reduction.', 'Dairy feed formulation for milk yield improvement.', 'Poultry feed formulation (layers, broilers, chicks).', 'Feed quality testing and control.', 'Balancing protein, energy, and minerals.', 'Follow-up support']::text[], 'Paid-Service', '500+', 2, '2026-03-08 17:58:32.960477+00', '2026-03-08 17:58:32.960477+00'),
  ('05f84bb8-256d-4ae8-982a-ce7949277ef2', 'Capacity Building', 'Professional agricultural training from certified experts to optimize your farming practices.', 'Free', '2-4 hours', 4.8, ARRAY['Intergrated soil fertility management (Soil sampling and testing Services)', 'Soil acidity management training and Demonstrations (Liming)', 'Economic Management and Business Service development Traininig', 'Training and demonstrations on Potatoes value Chain (Markies Variety)', 'Post harvest handling training', 'Dairy value chain training (Calf rearing, Dairy cow Feeding and Housing)', 'Climate smart Farming (CSF Training', 'Follow-up support']::text[], 'Training', '500+', 3, '2026-03-08 17:58:32.960477+00', '2026-03-08 17:58:32.960477+00'),
  ('e285be47-d8a7-4ec9-b37f-e05113352d99', 'Agronomy Services', 'We offer professional Farm Consultancy services that guide farmers to improve yields and sustainability', 'From KES 5,000', '2-4 hours', 4.8, ARRAY['Crop selection and Planting guidance', 'Soil fertility management', 'Farming practice optimization', 'Yield improvement strategies', 'Pest and disease management support', 'Field monitoring and advisory visits', 'Training on crop rotation.', 'Yield improvement and sustainability strategies', 'Follow-up support']::text[], 'Consultancy', '500+', 4, '2026-03-08 17:58:32.960477+00', '2026-03-08 17:58:32.960477+00'),
  ('1d6160ef-abc8-4bb1-ba8b-918e60bae94f', 'Soil Testing', 'Comprehensive soil analysis to determine nutrient levels and pH for optimal crop growth.', 'KES 3,500', '5-7 days', 4.8, ARRAY['Soil sampling and analysis', 'pH level and Fertility testing', 'Nutrient profiling and recommendations', 'Organic matter assessment', 'Detailed soil report', 'Fertilizer recommendations and Application', 'Identification of soil deficiencies', 'Follow-up support']::text[], 'Testing', '1,200+', 5, '2026-03-08 17:58:32.960477+00', '2026-03-08 17:58:32.960477+00'),
  ('55ea5c55-a32d-4546-8c49-3ac911844a2f', 'Agro-Dealership', 'We provide Farmers with quality products and expert advice to help them boost productivity and practice sustainable agriculture.', 'Check our Markertplace for amazing products.', '1-2 days on order', 4.7, ARRAY['Supply of Quality & Certified farm inputs', 'Fertilizers and soil enhancers', 'Pesticides and herbicides', 'Animal feeds and supplements', 'Farm tools and equipment', 'Agrochemicals and protective gear', 'Advisory services on input use', 'Follow-up support']::text[], 'Agri-Busness', '300+', 6, '2026-03-08 17:58:32.960477+00', '2026-03-08 17:58:32.960477+00'),
  ('575aeafc-b4b5-4bcd-a438-19677346ba73', 'Aggregation and Marketing', 'We connect farmers to reliable markets', 'As Agreed', 'Flexible', 4.6, ARRAY['Aggregating of produce', 'Ensuring fair prices', 'Improve income for farmers.', 'Improve bargaining power for farmers', 'Market Information and price updates', 'Establishment of market linkages and partnerships', 'Follow-up support']::text[], 'Agri-Business', '800+', 7, '2026-03-08 17:58:32.960477+00', '2026-03-08 17:58:32.960477+00')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price, duration = EXCLUDED.duration,
  rating = EXCLUDED.rating, features = EXCLUDED.features, category = EXCLUDED.category, bookings = EXCLUDED.bookings,
  sort_order = EXCLUDED.sort_order, updated_at = EXCLUDED.updated_at;
