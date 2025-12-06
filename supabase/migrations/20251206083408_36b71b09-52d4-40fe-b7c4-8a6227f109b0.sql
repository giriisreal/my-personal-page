-- Create gallery_images table for journey photos
CREATE TABLE public.gallery_images (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    image_url text NOT NULL,
    title text,
    description text,
    category text DEFAULT 'milestone',
    position integer DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on gallery_images
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Gallery images are viewable by everyone
CREATE POLICY "Gallery images are viewable by everyone" 
ON public.gallery_images 
FOR SELECT 
USING (true);

-- Users can manage their own gallery images
CREATE POLICY "Users can manage own gallery images" 
ON public.gallery_images 
FOR ALL 
USING (profile_id IN ( SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));

-- Add enhanced analytics columns to page_views
ALTER TABLE public.page_views 
ADD COLUMN device_type text DEFAULT NULL,
ADD COLUMN country text DEFAULT NULL,
ADD COLUMN city text DEFAULT NULL,
ADD COLUMN link_clicked uuid DEFAULT NULL;

-- Create storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for gallery bucket
CREATE POLICY "Gallery images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'gallery');

CREATE POLICY "Users can upload gallery images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'gallery' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own gallery images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'gallery' AND auth.uid() IS NOT NULL);