
-- Extend sites table
ALTER TABLE public.sites
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS description_html text,
  ADD COLUMN IF NOT EXISTS rejection_reason text;

CREATE UNIQUE INDEX IF NOT EXISTS sites_slug_key ON public.sites(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS sites_owner_idx ON public.sites(owner_id);
CREATE INDEX IF NOT EXISTS sites_status_idx ON public.sites(status);

-- Backfill slugs for existing rows
UPDATE public.sites SET slug = lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(id::text,1,6)
WHERE slug IS NULL;

-- Approved status for currently published
UPDATE public.sites SET status = 'approved' WHERE published = true;

-- ============ profiles ============
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  bio text,
  membership_tier text NOT NULL DEFAULT 'free',
  paid_until timestamptz,
  paid_sites_used_this_period integer NOT NULL DEFAULT 0,
  period_started_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles readable by all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage profiles" ON public.profiles FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ categories ============
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories public read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER categories_updated BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ tags ============
CREATE TABLE IF NOT EXISTS public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tags TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.tags TO authenticated;
GRANT ALL ON public.tags TO service_role;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tags public read" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Admins manage tags" ON public.tags FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER tags_updated BEFORE UPDATE ON public.tags FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ site_categories ============
CREATE TABLE IF NOT EXISTS public.site_categories (
  site_id uuid REFERENCES public.sites(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (site_id, category_id)
);
GRANT SELECT ON public.site_categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_categories TO authenticated;
GRANT ALL ON public.site_categories TO service_role;
ALTER TABLE public.site_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_categories public read" ON public.site_categories FOR SELECT USING (true);
CREATE POLICY "site_categories owner or admin write" ON public.site_categories FOR ALL
  USING (public.has_role(auth.uid(),'admin') OR EXISTS(SELECT 1 FROM public.sites s WHERE s.id=site_id AND s.owner_id=auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR EXISTS(SELECT 1 FROM public.sites s WHERE s.id=site_id AND s.owner_id=auth.uid()));

-- ============ site_tags ============
CREATE TABLE IF NOT EXISTS public.site_tags (
  site_id uuid REFERENCES public.sites(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (site_id, tag_id)
);
GRANT SELECT ON public.site_tags TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_tags TO authenticated;
GRANT ALL ON public.site_tags TO service_role;
ALTER TABLE public.site_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_tags public read" ON public.site_tags FOR SELECT USING (true);
CREATE POLICY "site_tags owner or admin write" ON public.site_tags FOR ALL
  USING (public.has_role(auth.uid(),'admin') OR EXISTS(SELECT 1 FROM public.sites s WHERE s.id=site_id AND s.owner_id=auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR EXISTS(SELECT 1 FROM public.sites s WHERE s.id=site_id AND s.owner_id=auth.uid()));

-- ============ payments ============
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  provider text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  external_id text,
  period_months integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users insert own payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage payments" ON public.payments FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER payments_updated BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Replace sites RLS: allow public read of approved only; owner reads own; owner writes own; admin all
DROP POLICY IF EXISTS "Public can view published sites" ON public.sites;
DROP POLICY IF EXISTS "Anyone can submit sites" ON public.sites;
DROP POLICY IF EXISTS "Admins manage sites" ON public.sites;
DROP POLICY IF EXISTS "Admins can manage sites" ON public.sites;

CREATE POLICY "Sites public read approved" ON public.sites FOR SELECT USING (status = 'approved' AND published = true);
CREATE POLICY "Sites owner read own" ON public.sites FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Sites admin read all" ON public.sites FOR SELECT USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Sites owner insert" ON public.sites FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Sites owner update pending" ON public.sites FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Sites admin all" ON public.sites FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Update handle_new_user to also create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)))
  ON CONFLICT DO NOTHING;
  IF NEW.email = 'enils.id@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill profiles for existing users
INSERT INTO public.profiles (user_id, full_name)
SELECT id, COALESCE(raw_user_meta_data->>'full_name', split_part(email,'@',1))
FROM auth.users
ON CONFLICT DO NOTHING;

-- Function: can user register another site?
CREATE OR REPLACE FUNCTION public.can_register_site(_user_id uuid)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE p record; total_free int; paid_used int;
BEGIN
  SELECT * INTO p FROM public.profiles WHERE user_id = _user_id;
  IF NOT FOUND THEN RETURN false; END IF;
  SELECT count(*) INTO total_free FROM public.sites WHERE owner_id = _user_id;
  IF p.membership_tier = 'free' OR p.paid_until IS NULL OR p.paid_until < now() THEN
    RETURN total_free < 5;
  ELSE
    RETURN (total_free < 5) OR (p.paid_sites_used_this_period < 20);
  END IF;
END; $$;
