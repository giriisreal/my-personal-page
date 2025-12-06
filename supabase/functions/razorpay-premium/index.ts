import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')!;
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Premium lifetime price in paise (₹499 = 49900 paise)
const PREMIUM_PRICE = 49900;
const CURRENCY = 'INR';

interface CreateOrderRequest {
  action: 'create_order';
  profileId: string;
}

interface VerifyPaymentRequest {
  action: 'verify_payment';
  profileId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

type RequestBody = CreateOrderRequest | VerifyPaymentRequest;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    console.log('Received request:', body.action);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    if (body.action === 'create_order') {
      const { profileId } = body as CreateOrderRequest;

      // Create Razorpay order
      const orderData = {
        amount: PREMIUM_PRICE,
        currency: CURRENCY,
        receipt: `premium_${profileId}_${Date.now()}`,
        notes: {
          profile_id: profileId,
          type: 'lifetime_premium'
        }
      };

      const credentials = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
      const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!razorpayResponse.ok) {
        const errorText = await razorpayResponse.text();
        console.error('Razorpay order creation failed:', errorText);
        throw new Error(`Failed to create Razorpay order: ${errorText}`);
      }

      const order = await razorpayResponse.json();
      console.log('Razorpay order created:', order.id);

      // Store order in database
      const { error: insertError } = await supabase
        .from('premium_payments')
        .insert({
          profile_id: profileId,
          razorpay_order_id: order.id,
          amount: PREMIUM_PRICE,
          currency: CURRENCY,
          status: 'created',
        });

      if (insertError) {
        console.error('Failed to store order:', insertError);
        throw new Error('Failed to store order in database');
      }

      return new Response(
        JSON.stringify({
          success: true,
          order_id: order.id,
          amount: PREMIUM_PRICE,
          currency: CURRENCY,
          key_id: RAZORPAY_KEY_ID,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (body.action === 'verify_payment') {
      const { profileId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body as VerifyPaymentRequest;

      console.log('Verifying payment:', { razorpay_order_id, razorpay_payment_id });

      // Verify signature using Web Crypto API (order_id|payment_id format per Razorpay docs)
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(RAZORPAY_KEY_SECRET),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const signatureData = encoder.encode(`${razorpay_order_id}|${razorpay_payment_id}`);
      const signatureBuffer = await crypto.subtle.sign("HMAC", key, signatureData);
      const hashArray = Array.from(new Uint8Array(signatureBuffer));
      const expectedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const isValid = expectedSignature === razorpay_signature;
      console.log('Signature verification:', isValid ? 'passed' : 'failed', { expectedSignature, razorpay_signature });

      if (!isValid) {
        // Update payment status as failed
        await supabase
          .from('premium_payments')
          .update({ status: 'failed' })
          .eq('razorpay_order_id', razorpay_order_id);

        return new Response(
          JSON.stringify({ success: false, error: 'Invalid payment signature' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update payment as verified
      const { error: paymentError } = await supabase
        .from('premium_payments')
        .update({
          razorpay_payment_id,
          razorpay_signature,
          status: 'verified',
          verified_at: new Date().toISOString(),
        })
        .eq('razorpay_order_id', razorpay_order_id);

      if (paymentError) {
        console.error('Failed to update payment:', paymentError);
        throw new Error('Failed to update payment record');
      }

      // Upgrade user to premium
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          is_premium: true,
          premium_since: new Date().toISOString(),
          razorpay_payment_id,
        })
        .eq('id', profileId);

      if (profileError) {
        console.error('Failed to upgrade profile:', profileError);
        throw new Error('Failed to upgrade to premium');
      }

      console.log('User upgraded to premium:', profileId);

      return new Response(
        JSON.stringify({ success: true, message: 'Premium upgrade successful!' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in razorpay-premium function:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
