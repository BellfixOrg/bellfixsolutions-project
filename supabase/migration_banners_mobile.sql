-- Migration: Add mobile_image_url column to banners table
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS mobile_image_url TEXT;

