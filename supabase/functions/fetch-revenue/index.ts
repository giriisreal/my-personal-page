import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FetchRevenueRequest {
  linkId: string;
  provider: "stripe" | "lemonsqueezy";
  apiKey: string;
  storeId?: string; // Only for LemonSqueezy
}

async function fetchStripeRevenue(apiKey: string): Promise<number> {
  console.log("Fetching Stripe revenue...");
  
  // Fetch all charges from Stripe (simplified - gets lifetime revenue)
  const response = await fetch("https://api.stripe.com/v1/balance", {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Stripe API error:", error);
    throw new Error("Invalid Stripe API key or API error");
  }

  const balance = await response.json();
  
  // Get available balance (in cents, convert to dollars)
  const availableBalance = balance.available?.reduce((sum: number, b: any) => sum + b.amount, 0) || 0;
  const pendingBalance = balance.pending?.reduce((sum: number, b: any) => sum + b.amount, 0) || 0;
  
  const totalRevenue = (availableBalance + pendingBalance) / 100;
  console.log("Stripe revenue fetched:", totalRevenue);
  
  return totalRevenue;
}

async function fetchLemonSqueezyRevenue(apiKey: string, storeId: string): Promise<number> {
  console.log("Fetching LemonSqueezy revenue for store:", storeId);
  
  const response = await fetch(`https://api.lemonsqueezy.com/v1/stores/${storeId}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/vnd.api+json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("LemonSqueezy API error:", error);
    throw new Error("Invalid LemonSqueezy API key or store ID");
  }

  const data = await response.json();
  
  // LemonSqueezy returns revenue in cents
  const totalRevenue = (data.data?.attributes?.total_revenue || 0) / 100;
  console.log("LemonSqueezy revenue fetched:", totalRevenue);
  
  return totalRevenue;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { linkId, provider, apiKey, storeId }: FetchRevenueRequest = await req.json();

    console.log("Fetch revenue request:", { linkId, provider, hasApiKey: !!apiKey });

    if (!linkId || !provider || !apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let revenue: number;

    if (provider === "stripe") {
      revenue = await fetchStripeRevenue(apiKey);
    } else if (provider === "lemonsqueezy") {
      if (!storeId) {
        return new Response(
          JSON.stringify({ error: "Store ID required for LemonSqueezy" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      revenue = await fetchLemonSqueezyRevenue(apiKey, storeId);
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid provider" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update the link with the fetched revenue
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const updateData: Record<string, any> = {
      live_revenue: revenue,
      revenue_updated_at: new Date().toISOString(),
    };

    // Store API keys for future refresh (encrypted in production)
    if (provider === "stripe") {
      updateData.stripe_api_key = apiKey;
      updateData.lemonsqueezy_api_key = null;
      updateData.lemonsqueezy_store_id = null;
    } else {
      updateData.lemonsqueezy_api_key = apiKey;
      updateData.lemonsqueezy_store_id = storeId;
      updateData.stripe_api_key = null;
    }

    const { error: updateError } = await supabaseClient
      .from("custom_links")
      .update(updateData)
      .eq("id", linkId);

    if (updateError) {
      console.error("Database update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update link with revenue" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Revenue updated successfully:", revenue);

    return new Response(
      JSON.stringify({ success: true, revenue }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in fetch-revenue function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
