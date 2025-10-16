import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not found");
      throw new Error("STRIPE_SECRET_KEY is not set");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Verificar assinatura do webhook
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      logStep("ERROR: No stripe signature");
      throw new Error("No stripe signature found");
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      if (webhookSecret) {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } else {
        // Em desenvolvimento, sem verificação de assinatura
        event = JSON.parse(body);
      }
    } catch (err) {
      logStep("ERROR: Webhook signature verification failed", { error: err });
      return new Response(JSON.stringify({ error: "Webhook signature verification failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("Event type", { type: event.type });

    // Criar cliente Supabase com service role
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Processar evento de checkout completado
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      logStep("Checkout completed", { sessionId: session.id, customerId: session.customer });

      const userId = session.metadata?.user_id;
      const professionalsPurchased = parseInt(session.metadata?.professionals_count || "1", 10);

      if (!userId) {
        logStep("ERROR: No user_id in metadata");
        throw new Error("No user_id found in session metadata");
      }

      // Determinar tipo de plano baseado no intervalo da assinatura
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      const planType = subscription.items.data[0].price.recurring?.interval === "year" ? "annual" : "monthly";

      logStep("Updating subscription", { userId, planType, professionalsPurchased });

      // Atualizar ou criar assinatura
      const { error: upsertError } = await supabaseClient
        .from("user_subscriptions")
        .upsert({
          user_id: userId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          plan_type: planType,
          status: "active",
          professionals_purchased: professionalsPurchased,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        }, { onConflict: 'user_id' });

      if (upsertError) {
        logStep("ERROR: Failed to update subscription", { error: upsertError });
        throw upsertError;
      }

      logStep("Subscription updated successfully");
    }

    // Processar evento de assinatura atualizada
    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;
      logStep("Subscription updated", { subscriptionId: subscription.id });

      const planType = subscription.items.data[0].price.recurring?.interval === "year" ? "annual" : "monthly";
      const quantity = subscription.items.data[0].quantity || 1;

      const { error: updateError } = await supabaseClient
        .from("user_subscriptions")
        .update({
          plan_type: planType,
          status: subscription.status,
          professionals_purchased: quantity,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id);

      if (updateError) {
        logStep("ERROR: Failed to update subscription", { error: updateError });
        throw updateError;
      }

      logStep("Subscription updated successfully");
    }

    // Processar evento de assinatura cancelada
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      logStep("Subscription deleted", { subscriptionId: subscription.id });

      const { error: updateError } = await supabaseClient
        .from("user_subscriptions")
        .update({
          status: "canceled",
          plan_type: "free",
          professionals_purchased: 1,
        })
        .eq("stripe_subscription_id", subscription.id);

      if (updateError) {
        logStep("ERROR: Failed to cancel subscription", { error: updateError });
        throw updateError;
      }

      logStep("Subscription canceled successfully");
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe-webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
