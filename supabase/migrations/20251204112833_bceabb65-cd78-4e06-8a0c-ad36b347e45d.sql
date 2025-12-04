-- Add color column to custom_links for button color customization
ALTER TABLE public.custom_links ADD COLUMN IF NOT EXISTS color text DEFAULT NULL;