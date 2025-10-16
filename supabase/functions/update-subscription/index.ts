import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[UPDATE-SUBSCRIPTION] ${step}${detailsStr}`);
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: No authorization header");
      throw new Error("No authorization header provided");
    }

    // Parse request body
    const { quantity } = await req.json();
    logStep("Request parameters", { quantity });

    if (!quantity || quantity < 1) {
      throw new Error("Quantity deve ser no mínimo 1");
    }

    // Create Supabase client for authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData?.user) {
      logStep("ERROR: Authentication failed", { error: userError?.message });
      throw new Error(`Authentication error: ${userError?.message}`);
    }
    const user = userData.user;
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get current subscription using service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: subscription, error: subError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (subError || !subscription) {
      logStep("ERROR: No subscription found", { error: subError });
      throw new Error("Nenhuma assinatura encontrada");
    }

    if (!subscription.stripe_subscription_id) {
      logStep("ERROR: No Stripe subscription ID");
      throw new Error("Esta assinatura não possui ID do Stripe");
    }

    if (subscription.plan_type === 'free') {
      logStep("ERROR: Cannot update free plan");
      throw new Error("Não é possível atualizar plano gratuito. Use a opção de contratar um plano pago.");
    }

    logStep("Current subscription", { 
      subscriptionId: subscription.stripe_subscription_id,
      currentQuantity: subscription.professionals_purchased,
      newQuantity: quantity
    });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Get Stripe subscription details
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripe_subscription_id
    );

    if (!stripeSubscription.items.data[0]) {
      throw new Error("Nenhum item encontrado na assinatura");
    }

    const currentQuantity = subscription.professionals_purchased || 1;
    const isUpgrade = quantity > currentQuantity;
    
    logStep("Update type determined", { isUpgrade, currentQuantity, newQuantity: quantity });

    // Update subscription with appropriate proration behavior
    // Upgrade: always_invoice (cobra diferença imediatamente)
    // Downgrade: create_prorations (gera crédito para próximo período)
    const updatedSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        items: [{
          id: stripeSubscription.items.data[0].id,
          quantity: quantity,
        }],
        proration_behavior: isUpgrade ? 'always_invoice' : 'create_prorations',
        billing_cycle_anchor: 'unchanged',
      }
    );

    logStep("Subscription updated in Stripe", { 
      subscriptionId: updatedSubscription.id,
      newQuantity: quantity,
      prorationBehavior: isUpgrade ? 'always_invoice' : 'create_prorations'
    });

    // Update database
    const { error: updateError } = await supabaseAdmin
      .from('user_subscriptions')
      .update({ 
        professionals_purchased: quantity,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      logStep("ERROR: Failed to update database", { error: updateError });
      throw new Error("Erro ao atualizar banco de dados");
    }

    logStep("Database updated successfully");

    // If upgrade, get the latest invoice for immediate charge info
    let immediateCharge = null;
    if (isUpgrade) {
      const invoices = await stripe.invoices.list({
        subscription: subscription.stripe_subscription_id,
        limit: 1,
      });
      
      if (invoices.data[0]) {
        immediateCharge = {
          amount: invoices.data[0].amount_due / 100,
          currency: invoices.data[0].currency,
        };
        logStep("Immediate charge calculated", immediateCharge);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: isUpgrade 
        ? 'Upgrade realizado com sucesso! A diferença será cobrada imediatamente.'
        : 'Downgrade agendado! O crédito será aplicado na próxima fatura.',
      professionals_purchased: quantity,
      is_upgrade: isUpgrade,
      immediate_charge: immediateCharge,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in update-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
