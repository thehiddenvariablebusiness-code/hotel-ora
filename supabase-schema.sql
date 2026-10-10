-- ==============================================================================
-- HOTEL ORA — SUPABASE PRODUCTION DATABASE SCHEMA & POLICIES
-- ==============================================================================
-- Execute this script in your Supabase SQL Editor (Dashboard -> SQL Editor)
-- This creates the tables, storage bucket, indexes, and Row Level Security (RLS) policies.
-- ==============================================================================

-- 1. REVIEWS TABLE
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

-- Index for public listing of approved reviews ordered by recency
CREATE INDEX IF NOT EXISTS idx_reviews_status_created ON public.reviews (status, created_at DESC);

-- Enable RLS on reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone (public) can read approved reviews
CREATE POLICY "Public can view approved reviews"
  ON public.reviews
  FOR SELECT
  USING (status = 'approved');

-- Policy 2: Anyone (public) can submit new reviews (status will default to pending)
CREATE POLICY "Public can insert reviews"
  ON public.reviews
  FOR INSERT
  WITH CHECK (true);

-- Policy 3: Authenticated users (admin) can select all reviews
CREATE POLICY "Admin can view all reviews"
  ON public.reviews
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 4: Authenticated users (admin) can update reviews (approve, reject, feature)
CREATE POLICY "Admin can update reviews"
  ON public.reviews
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy 5: Authenticated users (admin) can delete reviews
CREATE POLICY "Admin can delete reviews"
  ON public.reviews
  FOR DELETE
  TO authenticated
  USING (true);


-- ------------------------------------------------------------------------------
-- 2. CUSTOM PHOTOS TABLE (for future gallery photos added by HOTEL ORA staff)
-- ------------------------------------------------------------------------------
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

-- Index for ordering gallery photos
CREATE INDEX IF NOT EXISTS idx_custom_photos_created ON public.custom_photos (created_at DESC);

-- Enable RLS on custom_photos
ALTER TABLE public.custom_photos ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public can view all custom photos
CREATE POLICY "Public can view custom photos"
  ON public.custom_photos
  FOR SELECT
  USING (true);

-- Policy 2: Authenticated users (admin) can insert photos
CREATE POLICY "Admin can insert custom photos"
  ON public.custom_photos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy 3: Authenticated users (admin) can delete photos
CREATE POLICY "Admin can delete custom photos"
  ON public.custom_photos
  FOR DELETE
  TO authenticated
  USING (true);


-- ------------------------------------------------------------------------------
-- 3. HOTEL SETTINGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hotel_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  google_review_url TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on hotel_settings
ALTER TABLE public.hotel_settings ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public can view settings
CREATE POLICY "Public can view hotel settings"
  ON public.hotel_settings
  FOR SELECT
  USING (true);

-- Policy 2: Authenticated admin can update settings
CREATE POLICY "Admin can update hotel settings"
  ON public.hotel_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Seed default settings row if not present
INSERT INTO public.hotel_settings (id, google_review_url)
VALUES ('default', 'https://maps.app.goo.gl/tWp7vD1k5m8zJ3r48')
ON CONFLICT (id) DO NOTHING;


-- ------------------------------------------------------------------------------
-- 4. SUPABASE STORAGE BUCKET: hotel-ora-uploads
-- ------------------------------------------------------------------------------
-- Create public storage bucket for guest photos & hotel gallery images
INSERT INTO storage.buckets (id, name, public)
VALUES ('hotel-ora-uploads', 'hotel-ora-uploads', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policy 1: Public can view images
CREATE POLICY "Public can view hotel-ora-uploads"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'hotel-ora-uploads');

-- Storage Policy 2: Anyone can upload images to reviews/ or gallery/ folders
CREATE POLICY "Anyone can upload images to hotel-ora-uploads"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'hotel-ora-uploads');

-- Storage Policy 3: Authenticated admin can delete or update storage files
CREATE POLICY "Admin can delete images in hotel-ora-uploads"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'hotel-ora-uploads');
