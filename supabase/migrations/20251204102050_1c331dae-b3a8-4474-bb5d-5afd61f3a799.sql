-- Add location and revenue fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS revenue text;

-- Add status, category, icon, and size fields to custom_links
ALTER TABLE public.custom_links
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS icon text DEFAULT '🚀',
ADD COLUMN IF NOT EXISTS size text DEFAULT 'medium';

-- Create subscribers table for email subscriptions
CREATE TABLE public.subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(profile_id, email)
);

-- Enable RLS on subscribers
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (insert)
CREATE POLICY "Anyone can subscribe"
ON public.subscribers
FOR INSERT
WITH CHECK (true);

-- Profile owners can view their subscribers
CREATE POLICY "Profile owners can view subscribers"
ON public.subscribers
FOR SELECT
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));