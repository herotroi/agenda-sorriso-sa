import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CANCEL-SUBSCRIPTION] ${step}${detailsStr}`);
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

    // Buscar assinatura do usuário
    const { data: subscription, error: subError } = await supabaseClient
      .from('user_subscriptions')
      .select('stripe_subscription_id, plan_type')
      .eq('user_id', user.id)
      .single();

    if (subError || !subscription) {
      logStep("ERROR: No subscription found", { error: subError });
      throw new Error("Nenhuma assinatura encontrada");
    }

    if (!subscription.stripe_subscription_id) {
      logStep("ERROR: No Stripe subscription ID");
      throw new Error("Esta assinatura não pode ser cancelada (não tem ID do Stripe)");
    }

    if (subscription.plan_type === 'free') {
      logStep("ERROR: Trying to cancel free plan");
      throw new Error("O plano gratuito não precisa ser cancelado");
    }

    logStep("Subscription found", { subscriptionId: subscription.stripe_subscription_id });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Verificar se a assinatura foi criada há menos de 7 dias
    const subscriptionCreatedAt = new Date(subscription.created_at);
    const now = new Date();
    const daysSinceCreation = Math.floor((now.getTime() - subscriptionCreatedAt.getTime()) / (1000 * 60 * 60 * 24));
    
    logStep("Checking cancellation timing", { 
      createdAt: subscription.created_at,
      daysSinceCreation,
      shouldRefund: daysSinceCreation < 7
    });

    // Se foi criada há menos de 7 dias, cancelar imediatamente e reembolsar
    if (daysSinceCreation < 7) {
      logStep("Canceling immediately with refund (< 7 days)");
      
      // Buscar último invoice para reembolso
      const invoices = await stripe.invoices.list({
        customer: subscription.stripe_customer_id,
        subscription: subscription.stripe_subscription_id,
        limit: 1,
      });

      // Cancelar imediatamente
      const canceledSubscription = await stripe.subscriptions.cancel(
        subscription.stripe_subscription_id
      );

      logStep("Subscription canceled immediately", { 
        subscriptionId: canceledSubscription.id,
        status: canceledSubscription.status
      });

      // Processar reembolso se houver invoice pago
      let refundInfo = null;
      if (invoices.data[0] && invoices.data[0].payment_intent) {
        try {
          const refund = await stripe.refunds.create({
            payment_intent: invoices.data[0].payment_intent as string,
            reason: 'requested_by_customer',
          });

          refundInfo = {
            amount: refund.amount / 100,
            currency: refund.currency,
            status: refund.status,
          };

          logStep("Refund created", refundInfo);
        } catch (refundError) {
          logStep("ERROR: Failed to create refund", { error: refundError });
          // Continua mesmo se o reembolso falhar
        }
      }

      // Atualizar no banco - status canceled e volta para free
      const { error: updateError } = await supabaseAdmin
        .from('user_subscriptions')
        .update({ 
          status: 'canceled',
          plan_type: 'free',
          professionals_purchased: 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        logStep("ERROR: Failed to update subscription status", { error: updateError });
        throw new Error("Erro ao atualizar status da assinatura");
      }

      logStep("Subscription status updated to canceled");

      return new Response(JSON.stringify({
        success: true,
        message: 'Assinatura cancelada e reembolsada com sucesso',
        immediate_cancellation: true,
        refund: refundInfo,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Se passou 7 dias, cancelar no final do período (comportamento atual)
    logStep("Canceling at period end (>= 7 days)");
    
    const canceledSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      { cancel_at_period_end: true }
    );

    logStep("Subscription set to cancel at period end", { 
      subscriptionId: canceledSubscription.id,
      cancelAtPeriodEnd: canceledSubscription.cancel_at_period_end,
      currentPeriodEnd: canceledSubscription.current_period_end
    });

    // Atualizar no banco usando service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error: updateError } = await supabaseAdmin
      .from('user_subscriptions')
      .update({ 
        status: 'canceling',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      logStep("ERROR: Failed to update subscription status", { error: updateError });
      throw new Error("Erro ao atualizar status da assinatura");
    }

    logStep("Subscription status updated in database");

    const periodEndDate = new Date(canceledSubscription.current_period_end * 1000);

    return new Response(JSON.stringify({
      success: true,
      message: 'Assinatura cancelada com sucesso',
      cancel_at_period_end: true,
      current_period_end: periodEndDate.toISOString(),
      access_until: periodEndDate.toLocaleDateString('pt-BR')
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in cancel-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});