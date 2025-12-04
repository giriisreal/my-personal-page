-- Add Razorpay columns to custom_links table
ALTER TABLE public.custom_links 
ADD COLUMN IF NOT EXISTS razorpay_api_key text,
ADD COLUMN IF NOT EXISTS razorpay_key_id text;