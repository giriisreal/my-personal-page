-- Add is_premium flag and premium_since to profiles
ALTER TABLE public.profiles 
ADD COLUMN is_premium boolean NOT NULL DEFAULT false,
ADD COLUMN premium_since timestamp with time zone DEFAULT NULL,
ADD COLUMN razorpay_payment_id text DEFAULT NULL;

-- Create premium_payments table to track payment history
CREATE TABLE public.premium_payments (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    razorpay_order_id text NOT NULL,
    razorpay_payment_id text,
    razorpay_signature text,
    amount integer NOT NULL,
    currency text NOT NULL DEFAULT 'INR',
    status text NOT NULL DEFAULT 'created',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    verified_at timestamp with time zone
);

-- Enable RLS on premium_payments
ALTER TABLE public.premium_payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY "Users can view own payments" 
ON public.premium_payments 
FOR SELECT 
USING (profile_id IN ( SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));

-- Anyone can insert payments (edge function will handle verification)
CREATE POLICY "Anyone can insert payments" 
ON public.premium_payments 
FOR INSERT 
WITH CHECK (true);

-- Users can update their own payments (for verification)
CREATE POLICY "Users can update own payments" 
ON public.premium_payments 
FOR UPDATE 
USING (profile_id IN ( SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));