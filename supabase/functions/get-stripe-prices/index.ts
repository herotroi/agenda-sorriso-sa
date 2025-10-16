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
    
    // Buscar TODOS os preços dos produtos específicos
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

    // Função para extrair quantidade do preço
    const extractQuantity = (price: any): number => {
      // Tentar obter de transform_quantity
      if (price.transform_quantity?.divide_by) {
        return price.transform_quantity.divide_by;
      }
      // Tentar obter de metadata
      if (price.metadata?.quantity) {
        return parseInt(price.metadata.quantity);
      }
      // Default para 1
      return 1;
    };

    // Organizar preços mensais por quantidade
    const monthlyPricesArray = monthlyPrices.data
      .filter(price => price.recurring?.interval === 'month' && price.active)
      .map(price => ({
        quantity: extractQuantity(price),
        priceId: price.id,
        unitAmount: price.unit_amount ? price.unit_amount / 100 : 0,
        total: price.unit_amount ? (price.unit_amount / 100) * extractQuantity(price) : 0,
        currency: price.currency,
      }))
      .sort((a, b) => a.quantity - b.quantity);

    // Organizar preços anuais por quantidade
    const yearlyPricesArray = yearlyPrices.data
      .filter(price => price.recurring?.interval === 'year' && price.active)
      .map(price => ({
        quantity: extractQuantity(price),
        priceId: price.id,
        unitAmount: price.unit_amount ? price.unit_amount / 100 : 0,
        total: price.unit_amount ? (price.unit_amount / 100) * extractQuantity(price) : 0,
        currency: price.currency,
      }))
      .sort((a, b) => a.quantity - b.quantity);

    const result = {
      monthly: monthlyPricesArray,
      yearly: yearlyPricesArray,
    };

    logStep("Returning organized prices", { 
      monthlyPrices: monthlyPricesArray.length,
      yearlyPrices: yearlyPricesArray.length,
      monthlyQuantities: monthlyPricesArray.map(p => p.quantity),
      yearlyQuantities: yearlyPricesArray.map(p => p.quantity),
    });

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
