-- Add columns for revenue integration to custom_links
ALTER TABLE public.custom_links 
ADD COLUMN stripe_api_key TEXT,
ADD COLUMN lemonsqueezy_api_key TEXT,
ADD COLUMN lemonsqueezy_store_id TEXT,
ADD COLUMN live_revenue NUMERIC DEFAULT NULL,
ADD COLUMN revenue_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;