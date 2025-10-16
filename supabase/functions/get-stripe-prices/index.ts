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

    // Log completo dos preços para debug
    if (monthlyPrices.data.length > 0) {
      logStep("Monthly price structure sample", {
        id: monthlyPrices.data[0].id,
        unit_amount: monthlyPrices.data[0].unit_amount,
        billing_scheme: monthlyPrices.data[0].billing_scheme,
        tiers_mode: monthlyPrices.data[0].tiers_mode,
        tiers: monthlyPrices.data[0].tiers,
        transform_quantity: monthlyPrices.data[0].transform_quantity,
        metadata: monthlyPrices.data[0].metadata,
      });
    }

    // Função para extrair quantidade e valor do preço
    const extractPriceData = (price: any): { quantity: number; unitAmount: number; priceId: string } | null => {
      const priceId = price.id;
      
      // Se tem tiers (graduated ou volume pricing)
      if (price.tiers && price.tiers.length > 0) {
        // Para graduated pricing, cada tier tem um preço diferente
        // Vamos retornar o primeiro tier como exemplo, mas na realidade
        // a Stripe calcula automaticamente baseado na quantidade
        const firstTier = price.tiers[0];
        return {
          quantity: price.metadata?.quantity ? parseInt(price.metadata.quantity) : 1,
          unitAmount: firstTier.unit_amount ? firstTier.unit_amount / 100 : 0,
          priceId,
        };
      }
      
      // Se tem transform_quantity
      if (price.transform_quantity?.divide_by) {
        return {
          quantity: price.transform_quantity.divide_by,
          unitAmount: price.unit_amount ? price.unit_amount / 100 : 0,
          priceId,
        };
      }
      
      // Se tem metadata com quantity
      if (price.metadata?.quantity) {
        return {
          quantity: parseInt(price.metadata.quantity),
          unitAmount: price.unit_amount ? price.unit_amount / 100 : 0,
          priceId,
        };
      }
      
      // Preço padrão (sem quantidade específica)
      if (price.unit_amount) {
        return {
          quantity: 1,
          unitAmount: price.unit_amount / 100,
          priceId,
        };
      }
      
      return null;
    };

    // Organizar preços mensais por quantidade
    const monthlyPricesArray = monthlyPrices.data
      .filter(price => price.recurring?.interval === 'month' && price.active)
      .map(price => {
        const data = extractPriceData(price);
        if (!data) return null;
        
        return {
          quantity: data.quantity,
          priceId: data.priceId,
          unitAmount: data.unitAmount,
          total: data.unitAmount * data.quantity,
          currency: price.currency,
        };
      })
      .filter(p => p !== null)
      .sort((a, b) => a!.quantity - b!.quantity);

    // Organizar preços anuais por quantidade
    const yearlyPricesArray = yearlyPrices.data
      .filter(price => price.recurring?.interval === 'year' && price.active)
      .map(price => {
        const data = extractPriceData(price);
        if (!data) return null;
        
        return {
          quantity: data.quantity,
          priceId: data.priceId,
          unitAmount: data.unitAmount,
          total: data.unitAmount * data.quantity,
          currency: price.currency,
        };
      })
      .filter(p => p !== null)
      .sort((a, b) => a!.quantity - b!.quantity);

    const result = {
      monthly: monthlyPricesArray,
      yearly: yearlyPricesArray,
    };

    logStep("Returning organized prices", { 
      monthlyPrices: monthlyPricesArray.length,
      yearlyPrices: yearlyPricesArray.length,
      monthlyQuantities: monthlyPricesArray.map(p => p!.quantity),
      yearlyQuantities: yearlyPricesArray.map(p => p!.quantity),
      monthlyData: monthlyPricesArray,
      yearlyData: yearlyPricesArray,
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
