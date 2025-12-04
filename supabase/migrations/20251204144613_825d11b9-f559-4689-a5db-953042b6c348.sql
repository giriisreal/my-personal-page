-- Add theme and font columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'light',
ADD COLUMN IF NOT EXISTS font TEXT DEFAULT 'dm-sans';

-- Add text_color column to custom_links for font color customization
ALTER TABLE public.custom_links 
ADD COLUMN IF NOT EXISTS text_color TEXT DEFAULT 'white';