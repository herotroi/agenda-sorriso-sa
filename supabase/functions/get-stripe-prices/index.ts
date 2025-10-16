import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GET-STRIPE-PRICES] ${step}${detailsStr}`);
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

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    logStep("Fetching active prices from Stripe");
    
    // Buscar preços dos produtos específicos
    const monthlyPrices = await stripe.prices.list({
      active: true,
      type: 'recurring',
      product: 'prod_TFKKD8Xe5yUOQ5',
      limit: 100,
    });

    const yearlyPrices = await stripe.prices.list({
      active: true,
      type: 'recurring',
      product: 'prod_TFLGsfXeZxyXBs',
      limit: 100,
    });

    logStep("Prices fetched", { 
      monthlyCount: monthlyPrices.data.length,
      yearlyCount: yearlyPrices.data.length 
    });

    // Filtrar e organizar preços
    const monthlyPrice = monthlyPrices.data.find(
      price => price.recurring?.interval === 'month' && price.active
    );
    
    const yearlyPrice = yearlyPrices.data.find(
      price => price.recurring?.interval === 'year' && price.active
    );

    const result = {
      monthly: monthlyPrice ? {
        id: monthlyPrice.id,
        amount: monthlyPrice.unit_amount ? monthlyPrice.unit_amount / 100 : 0,
        currency: monthlyPrice.currency,
      } : null,
      yearly: yearlyPrice ? {
        id: yearlyPrice.id,
        amount: yearlyPrice.unit_amount ? yearlyPrice.unit_amount / 100 : 0,
        currency: yearlyPrice.currency,
      } : null,
    };

    logStep("Returning prices", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in get-stripe-prices", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
