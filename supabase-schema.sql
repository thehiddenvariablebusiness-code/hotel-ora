-- ==============================================================================
-- HOTEL ORA — SUPABASE PRODUCTION DATABASE SCHEMA & SECURITY POLICIES
-- ==============================================================================
-- Location: Main Road Hojai, Opp. UCO Bank, Hojai, Assam 782436
-- Google Maps: https://maps.app.goo.gl/bpvy68N4bjsptSCz6?g_st=aw
--
-- INSTRUCTIONS FOR SUPABASE SQL EDITOR:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your project: eluefvwxorhvykxtlvre
-- 3. Click "SQL Editor" in the left sidebar
-- 4. Paste the entire content of this file and click "Run" (green button)
--
-- This script fixes "permission denied for table reviews" by explicitly granting
-- table & schema permissions to Supabase's `anon` and `authenticated` roles,
-- while enforcing strict Row-Level Security (RLS) policies.
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure public schema usage for anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;


-- ==============================================================================
-- 1. AUTHORIZED HOTEL STAFF & ADMINS (RBAC)
-- ==============================================================================
-- Do NOT treat every authenticated Supabase user as an admin.
-- Only accounts registered in public.admin_users are granted staff privileges.

CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'staff', 'owner')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users (LOWER(email));

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Helper security definer function to verify if the requesting user is authorized staff
CREATE OR REPLACE FUNCTION public.is_hotel_staff()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT (
    -- User exists in the authorized admin_users table
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE id = auth.uid()
    )
    -- Or user has an explicit admin/hotel_staff claim in their JWT app_metadata
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'hotel_staff')
  );
$$;

-- RLS for admin_users table
DROP POLICY IF EXISTS "Staff can read admin_users" ON public.admin_users;
CREATE POLICY "Staff can read admin_users"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR public.is_hotel_staff());

DROP POLICY IF EXISTS "Staff can manage admin_users" ON public.admin_users;
CREATE POLICY "Staff can manage admin_users"
  ON public.admin_users
  FOR ALL
  TO authenticated
  USING (public.is_hotel_staff())
  WITH CHECK (public.is_hotel_staff());

-- Automatic trigger to link designated HOTEL ORA admin email addresses upon auth signup
CREATE OR REPLACE FUNCTION public.handle_new_hotel_staff()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Automatically authorize the primary hotel admin emails when registered in Supabase Auth
  IF LOWER(NEW.email) IN ('hotelora8@gmail.com', 'thehiddenvariable.business@gmail.com') THEN
    INSERT INTO public.admin_users (id, email, role)
    VALUES (NEW.id, LOWER(NEW.email), 'admin')
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_assign_hotel_staff ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_hotel_staff
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_hotel_staff();

-- Seed existing auth.users matching the hotel admin emails if already created
INSERT INTO public.admin_users (id, email, role)
SELECT id, LOWER(email), 'admin'
FROM auth.users
WHERE LOWER(email) IN ('hotelora8@gmail.com', 'thehiddenvariable.business@gmail.com')
ON CONFLICT (id) DO NOTHING;


-- ==============================================================================
-- 2. GUEST REVIEWS TABLE
-- ==============================================================================
-- Production security model:
-- - Public visitors can read approved reviews only.
-- - Public visitors can submit pending reviews only (status cannot be pre-approved).
-- - Only authorized staff can view all reviews (pending/approved/rejected),
--   update review status / featured flags, or delete reviews.

CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  guest_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  message TEXT NOT NULL,
  photo_url TEXT,
  stay_date TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning-fast public listing and admin filtering
CREATE INDEX IF NOT EXISTS idx_reviews_status_created ON public.reviews (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_featured ON public.reviews (featured) WHERE featured = TRUE;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Drop legacy/existing policies to ensure clean execution
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public can insert reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public can submit pending reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admin can view all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admin can update reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admin can delete reviews" ON public.reviews;
DROP POLICY IF EXISTS "Authorized staff can view all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Authorized staff can insert reviews" ON public.reviews;
DROP POLICY IF EXISTS "Authorized staff can update reviews" ON public.reviews;
DROP POLICY IF EXISTS "Authorized staff can delete reviews" ON public.reviews;

-- Policy 2.1: Public visitors can view approved reviews ONLY
CREATE POLICY "Public can view approved reviews"
  ON public.reviews
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- Policy 2.2: Authorized staff can view ALL reviews (pending, approved, rejected)
CREATE POLICY "Authorized staff can view all reviews"
  ON public.reviews
  FOR SELECT
  TO authenticated
  USING (public.is_hotel_staff());

-- Policy 2.3: Public visitors may submit reviews ONLY with status='pending' and not featured
CREATE POLICY "Public can submit pending reviews"
  ON public.reviews
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'pending'
    AND (featured IS FALSE OR featured IS NULL)
  );

-- Policy 2.4: Authorized staff can insert reviews directly
CREATE POLICY "Authorized staff can insert reviews"
  ON public.reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_hotel_staff());

-- Policy 2.5: Only authorized staff can update reviews (approve, reject, feature/unfeature)
CREATE POLICY "Authorized staff can update reviews"
  ON public.reviews
  FOR UPDATE
  TO authenticated
  USING (public.is_hotel_staff())
  WITH CHECK (public.is_hotel_staff());

-- Policy 2.6: Only authorized staff can delete reviews
CREATE POLICY "Authorized staff can delete reviews"
  ON public.reviews
  FOR DELETE
  TO authenticated
  USING (public.is_hotel_staff());


-- ==============================================================================
-- 3. CUSTOM GALLERY PHOTOS TABLE
-- ==============================================================================
-- Official 7 hotel photos remain stored locally in /public/images/hotel/.
-- This table stores additional/future photos added by HOTEL ORA staff.
-- Public visitors have read-only access to view photos.
-- Only authorized staff can add, modify, or delete photos.

CREATE TABLE IF NOT EXISTS public.custom_photos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT 'HOTEL ORA',
  category TEXT NOT NULL CHECK (category IN ('EXTERIOR', 'RECEPTION', 'ROOMS', 'INTERIOR')),
  image_url TEXT NOT NULL,
  image_alt TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_custom BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_custom_photos_created ON public.custom_photos (created_at DESC);

ALTER TABLE public.custom_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view custom photos" ON public.custom_photos;
DROP POLICY IF EXISTS "Admin can insert custom photos" ON public.custom_photos;
DROP POLICY IF EXISTS "Admin can delete custom photos" ON public.custom_photos;
DROP POLICY IF EXISTS "Authorized staff can insert custom photos" ON public.custom_photos;
DROP POLICY IF EXISTS "Authorized staff can update custom photos" ON public.custom_photos;
DROP POLICY IF EXISTS "Authorized staff can delete custom photos" ON public.custom_photos;

-- Policy 3.1: Public can view all custom gallery photos
CREATE POLICY "Public can view custom photos"
  ON public.custom_photos
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy 3.2: Only authorized staff can insert custom gallery photos
CREATE POLICY "Authorized staff can insert custom photos"
  ON public.custom_photos
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_hotel_staff());

-- Policy 3.3: Only authorized staff can update custom gallery photos
CREATE POLICY "Authorized staff can update custom photos"
  ON public.custom_photos
  FOR UPDATE
  TO authenticated
  USING (public.is_hotel_staff())
  WITH CHECK (public.is_hotel_staff());

-- Policy 3.4: Only authorized staff can delete custom gallery photos
CREATE POLICY "Authorized staff can delete custom photos"
  ON public.custom_photos
  FOR DELETE
  TO authenticated
  USING (public.is_hotel_staff());


-- ==============================================================================
-- 4. HOTEL SETTINGS TABLE
-- ==============================================================================
-- Stores live hotel settings such as the official Google Maps Review URL.
-- Public visitors can read settings.
-- Only authorized staff can update settings.

CREATE TABLE IF NOT EXISTS public.hotel_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  google_review_url TEXT NOT NULL DEFAULT 'https://maps.app.goo.gl/bpvy68N4bjsptSCz6?g_st=aw',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.hotel_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view hotel settings" ON public.hotel_settings;
DROP POLICY IF EXISTS "Admin can manage hotel settings" ON public.hotel_settings;
DROP POLICY IF EXISTS "Authorized staff can modify hotel settings" ON public.hotel_settings;

-- Policy 4.1: Public can read hotel settings
CREATE POLICY "Public can view hotel settings"
  ON public.hotel_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy 4.2: Only authorized staff can modify hotel settings
CREATE POLICY "Authorized staff can modify hotel settings"
  ON public.hotel_settings
  FOR ALL
  TO authenticated
  USING (public.is_hotel_staff())
  WITH CHECK (public.is_hotel_staff());

-- Seed default settings with the real HOTEL ORA Google Maps link already in the project
INSERT INTO public.hotel_settings (id, google_review_url)
VALUES ('default', 'https://maps.app.goo.gl/bpvy68N4bjsptSCz6?g_st=aw')
ON CONFLICT (id) DO UPDATE SET
  google_review_url = EXCLUDED.google_review_url,
  updated_at = NOW();


-- ==============================================================================
-- 5. PERMISSIONS & ROLE GRANTS (CRITICAL FOR SUPABASE POSTGREST & RLS)
-- ==============================================================================
-- PostgreSQL requires explicit table-level grants before Row Level Security (RLS)
-- is evaluated. Without these GRANT statements, PostgreSQL throws:
-- "ERROR: 42501: permission denied for table reviews"
--
-- With RLS enabled, GRANT ALL permits PostgREST to query the table, while the RLS
-- policies above enforce that visitors can ONLY insert pending reviews and read
-- approved reviews.

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT ALL ON TABLE public.reviews TO anon, authenticated;
GRANT ALL ON TABLE public.custom_photos TO anon, authenticated;
GRANT ALL ON TABLE public.hotel_settings TO anon, authenticated;
GRANT ALL ON TABLE public.admin_users TO anon, authenticated;

GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Ensure future tables, sequences and functions in public schema inherit grants
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated;


-- ==============================================================================
-- 6. SUPABASE STORAGE BUCKET: hotel-ora-uploads
-- ==============================================================================
-- Production security model:
-- - Bucket is public so approved review images & gallery photos can be displayed.
-- - Public users may upload ONLY guest review photos into the 'reviews/' folder.
-- - Public users cannot upload arbitrary files, non-images, or gallery files.
-- - Only authorized staff can upload hotel gallery images (into 'gallery/').
-- - Only authorized staff can update or delete files.

-- Create storage bucket if it does not already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hotel-ora-uploads',
  'hotel-ora-uploads',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Ensure storage schema grants
GRANT USAGE ON SCHEMA storage TO anon, authenticated;
GRANT ALL ON TABLE storage.objects TO anon, authenticated;
GRANT ALL ON TABLE storage.buckets TO anon, authenticated;

-- Drop existing storage policies for idempotency
DROP POLICY IF EXISTS "Public can view hotel-ora-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload images to hotel-ora-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete images in hotel-ora-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload review photos only" ON storage.objects;
DROP POLICY IF EXISTS "Authorized staff can upload gallery and media" ON storage.objects;
DROP POLICY IF EXISTS "Authorized staff can update storage objects" ON storage.objects;
DROP POLICY IF EXISTS "Authorized staff can delete storage objects" ON storage.objects;

-- Storage Policy 6.1: Public can view images in the hotel-ora-uploads bucket
CREATE POLICY "Public can view hotel-ora-uploads"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'hotel-ora-uploads');

-- Storage Policy 6.2: Public users can upload ONLY review photos into 'reviews/' folder
CREATE POLICY "Public can upload review photos only"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    bucket_id = 'hotel-ora-uploads'
    AND name LIKE 'reviews/%'
  );

-- Storage Policy 6.3: Authorized staff can upload hotel gallery images & media
CREATE POLICY "Authorized staff can upload gallery and media"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'hotel-ora-uploads'
    AND public.is_hotel_staff()
  );

-- Storage Policy 6.4: Authorized staff can update files in hotel-ora-uploads
CREATE POLICY "Authorized staff can update storage objects"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'hotel-ora-uploads'
    AND public.is_hotel_staff()
  )
  WITH CHECK (
    bucket_id = 'hotel-ora-uploads'
    AND public.is_hotel_staff()
  );

-- Storage Policy 6.5: Authorized staff can delete files from hotel-ora-uploads
CREATE POLICY "Authorized staff can delete storage objects"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'hotel-ora-uploads'
    AND public.is_hotel_staff()
  );


-- ==============================================================================
-- 7. CONVENIENCE FUNCTION: GRANT STAFF ACCESS MANUALLY
-- ==============================================================================
-- You can run this in Supabase SQL Editor anytime to grant staff access to an email:
-- SELECT public.add_admin_by_email('staff-email@example.com');
CREATE OR REPLACE FUNCTION public.add_admin_by_email(target_email TEXT, staff_role TEXT DEFAULT 'admin')
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  SELECT id INTO target_user_id FROM auth.users WHERE LOWER(email) = LOWER(target_email) LIMIT 1;
  IF target_user_id IS NOT NULL THEN
    INSERT INTO public.admin_users (id, email, role)
    VALUES (target_user_id, LOWER(target_email), staff_role)
    ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, email = EXCLUDED.email;
    RETURN 'Successfully granted ' || staff_role || ' access to ' || target_email;
  ELSE
    RETURN 'User ' || target_email || ' not found in auth.users. Please create the user first in Supabase Authentication.';
  END IF;
END;
$$;
