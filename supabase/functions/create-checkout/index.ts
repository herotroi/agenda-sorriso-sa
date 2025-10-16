
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not found");
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: No authorization header");
      throw new Error("No authorization header provided");
    }
    logStep("Authorization header found");

    // Create Supabase client for authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      logStep("ERROR: Authentication failed", { error: userError.message });
      throw new Error(`Authentication error: ${userError.message}`);
    }
    const user = userData.user;
    if (!user?.email) {
      logStep("ERROR: User not authenticated");
      throw new Error("User not authenticated or email not available");
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    const requestBody = await req.json();
    const { priceId, quantity = 1 } = requestBody;
    if (!priceId) {
      logStep("ERROR: No priceId provided");
      throw new Error("Price ID is required");
    }
    logStep("Price ID and quantity received", { priceId, quantity });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Validar que o preço não pertence ao produto excluído
    const EXCLUDED_PRODUCT_ID = 'prod_TFLGsfXeZxyXBs';
    try {
      const priceData = await stripe.prices.retrieve(priceId);
      if (priceData.product === EXCLUDED_PRODUCT_ID) {
        logStep("ERROR: Attempting to use excluded product", { priceId, productId: priceData.product });
        throw new Error("Este plano não está mais disponível");
      }
      logStep("Price validated", { priceId, productId: priceData.product });
    } catch (stripeError: any) {
      if (stripeError.message?.includes("não está mais disponível")) {
        throw stripeError;
      }
      logStep("ERROR: Failed to validate price", { error: stripeError });
      throw new Error("Erro ao validar o plano selecionado");
    }
    
    // Verificar se já existe um cliente Stripe
    let customerId;
    try {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Existing customer found", { customerId });
      } else {
        logStep("No existing customer found");
      }
    } catch (stripeError) {
      logStep("ERROR: Failed to check existing customers", { error: stripeError });
      throw new Error("Failed to check existing customers");
    }

    logStep("Using specific price ID from request", { priceId });

    const origin = req.headers.get("origin") || "http://localhost:3000";
    
    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : user.email,
        line_items: [
          {
            price: priceId,
            quantity: quantity,
          },
        ],
        mode: "subscription",
        success_url: `${origin}/assinatura?success=true`,
        cancel_url: `${origin}/assinatura?canceled=true`,
        metadata: {
          user_id: user.id,
          price_id: priceId,
          professionals_count: quantity,
        },
      });

      logStep("Checkout session created", { sessionId: session.id, url: session.url });

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } catch (stripeError) {
      logStep("ERROR: Failed to create checkout session", { error: stripeError });
      throw new Error(`Failed to create checkout session: ${stripeError.message}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
