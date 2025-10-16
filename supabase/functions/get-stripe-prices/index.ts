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
    
    // Buscar TODOS os preços recorrentes (sem filtrar por produto para evitar IDs incorretos)
    const monthlyPrices = await stripe.prices.list({
      active: true,
      type: 'recurring',
      limit: 100,
      expand: ['data.tiers', 'data.transform_quantity', 'data.recurring']
    });

    const yearlyPrices = monthlyPrices; // reutiliza a mesma listagem; filtraremos por intervalo abaixo

    logStep("Prices fetched", { 
      monthlyCount: monthlyPrices.data.length,
      yearlyCount: yearlyPrices.data.length 
    });

    // Log completo dos preços para debug
    if (monthlyPrices.data.length > 0) {
      const samplePrice = monthlyPrices.data[0];
      logStep("Monthly price structure sample", {
        id: samplePrice.id,
        unit_amount: samplePrice.unit_amount,
        billing_scheme: samplePrice.billing_scheme,
        tiers_mode: samplePrice.tiers_mode,
        tiers: samplePrice.tiers,
        transform_quantity: samplePrice.transform_quantity,
        metadata: samplePrice.metadata,
      });
    }

    // Função para extrair todos os tiers de um preço
    const extractTiersFromPrice = (price: any): Array<{ quantity: number; unitAmount: number; priceId: string }> => {
      const priceId = price.id;
      const results: Array<{ quantity: number; unitAmount: number; priceId: string }> = [];
      
      // Se tem tiers (graduated ou volume pricing)
      if (price.tiers && price.tiers.length > 0) {
        logStep("Found tiers in price", { priceId, tiersCount: price.tiers.length, tiers_mode: price.tiers_mode });
        
        // Para volume pricing, cada tier representa um desconto para aquela quantidade
        price.tiers.forEach((tier: any, index: number) => {
          const quantity = tier.up_to || (index + 1);
          const unitAmount = tier.unit_amount ? tier.unit_amount / 100 : 0;
          
          if (unitAmount > 0) {
            results.push({
              quantity,
              unitAmount,
              priceId,
            });
          }
        });
        
        return results;
      }
      
      // Se tem transform_quantity
      if (price.transform_quantity?.divide_by) {
        const quantity = price.transform_quantity.divide_by;
        const unitAmount = price.unit_amount ? price.unit_amount / 100 : 0;
        if (unitAmount > 0) {
          results.push({ quantity, unitAmount, priceId });
        }
        return results;
      }
      
      // Se tem metadata com quantity
      if (price.metadata?.quantity) {
        const quantity = parseInt(price.metadata.quantity);
        const unitAmount = price.unit_amount ? price.unit_amount / 100 : 0;
        if (unitAmount > 0) {
          results.push({ quantity, unitAmount, priceId });
        }
        return results;
      }
      
      // Preço padrão (sem quantidade específica)
      if (price.unit_amount) {
        results.push({
          quantity: 1,
          unitAmount: price.unit_amount / 100,
          priceId,
        });
        return results;
      }
      
      return results;
    };

    // Helper para obter valores do tier (unitário e tarifa fixa) para uma quantidade
    const getAmountsForQuantity = (tiers: any[] | undefined, q: number, fallbackUnit?: number) => {
      if (!tiers || tiers.length === 0) {
        return { unitAmount: (fallbackUnit ?? 0) / 100, flatAmount: 0 };
      }
      const tier = tiers.find((t: any) => t.up_to === null || t.up_to >= q) || tiers[tiers.length - 1];
      const unitRaw = tier?.unit_amount ?? tier?.unit_amount_decimal ?? (fallbackUnit ?? 0);
      const flatRaw = tier?.flat_amount ?? tier?.flat_amount_decimal ?? 0;
      const unitAmount = Number(unitRaw) / 100;
      const flatAmount = Number(flatRaw) / 100;
      return { unitAmount, flatAmount };
    };

    // Construir mapa de 1..maxQty para cada intervalo
    const MAX_QTY = 30; // limite máximo para UI
    const EXCLUDED_PRODUCT_ID = 'prod_TFLGsfXeZxyXBs'; // Produto desvinculado

    // Mensal
    const monthlyPricesArray: Array<{ quantity: number; unitAmount: number; flatFee: number; priceId: string; total: number; currency: string }> = [];
    monthlyPrices.data
      .filter(price => 
        price.recurring?.interval === 'month' && 
        price.active && 
        price.product !== EXCLUDED_PRODUCT_ID
      )
      .forEach(price => {
        for (let q = 1; q <= MAX_QTY; q++) {
          const { unitAmount, flatAmount } = getAmountsForQuantity((price as any).tiers, q, price.unit_amount ?? undefined);
          if (unitAmount > 0 || flatAmount > 0) {
            monthlyPricesArray.push({
              quantity: q,
              priceId: price.id,
              unitAmount,
              flatFee: flatAmount,
              total: unitAmount * q + flatAmount,
              currency: price.currency,
            });
          }
        }
      });
    
    // Anual
    const yearlyPricesArray: Array<{ quantity: number; unitAmount: number; flatFee: number; priceId: string; total: number; currency: string }> = [];
    yearlyPrices.data
      .filter(price => 
        price.recurring?.interval === 'year' && 
        price.active && 
        price.product !== EXCLUDED_PRODUCT_ID
      )
      .forEach(price => {
        for (let q = 1; q <= MAX_QTY; q++) {
          const { unitAmount, flatAmount } = getAmountsForQuantity((price as any).tiers, q, price.unit_amount ?? undefined);
          if (unitAmount > 0 || flatAmount > 0) {
            yearlyPricesArray.push({
              quantity: q,
              priceId: price.id,
              unitAmount,
              flatFee: flatAmount,
              total: unitAmount * q + flatAmount,
              currency: price.currency,
            });
          }
        }
      });
    
    // Ordenar por quantidade
    monthlyPricesArray.sort((a, b) => a.quantity - b.quantity);
    yearlyPricesArray.sort((a, b) => a.quantity - b.quantity);

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
