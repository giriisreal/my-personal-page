-- Add pitch video columns to custom_links table
ALTER TABLE public.custom_links 
ADD COLUMN IF NOT EXISTS demo_video_url TEXT,
ADD COLUMN IF NOT EXISTS pitch_video_url TEXT;