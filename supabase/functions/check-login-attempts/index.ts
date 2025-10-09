import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { email, action, ip_address } = await req.json();

    console.log(`[Login Attempts] Action: ${action} for email: ${email}`);

    if (action === 'check') {
      // Verificar se há bloqueio ativo
      const { data: attempt } = await supabase
        .from('login_attempts')
        .select('*')
        .eq('email', email)
        .single();

      if (attempt) {
        // Reset por inatividade (24h sem tentativas)
        if (attempt.last_attempt_at) {
          const last = new Date(attempt.last_attempt_at);
          const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          if (last < twentyFourHoursAgo) {
            console.log(`[Login Attempts] Last attempt >24h ago. Resetting for ${email}`);
            await supabase
              .from('login_attempts')
              .delete()
              .eq('email', email);

            return new Response(
              JSON.stringify({ allowed: true, attempts: 0, remaining: 20 }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }

        // Verificar se está bloqueado
        if (attempt.locked_until && new Date(attempt.locked_until) > new Date()) {
          const remainingTime = Math.ceil((new Date(attempt.locked_until).getTime() - Date.now()) / 1000 / 60);
          console.log(`[Login Attempts] Account locked for ${remainingTime} minutes`);
          
          return new Response(
            JSON.stringify({
              allowed: false,
              locked: true,
              attempts: attempt.attempt_count,
              locked_until: attempt.locked_until,
              message: `Conta bloqueada por ${remainingTime} minutos devido a múltiplas tentativas de login incorretas. Por favor, tente novamente mais tarde ou recupere sua senha.`
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Se o bloqueio expirou, resetar as tentativas
        if (attempt.locked_until && new Date(attempt.locked_until) <= new Date()) {
          console.log(`[Login Attempts] Lock expired, resetting attempts for ${email}`);
          await supabase
            .from('login_attempts')
            .delete()
            .eq('email', email);

          return new Response(
            JSON.stringify({ allowed: true, attempts: 0, remaining: 20 }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Verificar número de tentativas
        if (attempt.attempt_count >= 20) {
          // Bloquear por 30 minutos
          const lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
          
          await supabase
            .from('login_attempts')
            .update({ locked_until: lockedUntil.toISOString() })
            .eq('email', email);

          console.log(`[Login Attempts] Account locked until: ${lockedUntil}`);

          return new Response(
            JSON.stringify({
              allowed: false,
              locked: true,
              attempts: attempt.attempt_count,
              locked_until: lockedUntil,
              message: 'Limite de tentativas excedido. Conta bloqueada por 30 minutos. Por favor, recupere sua senha.'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`[Login Attempts] Attempts: ${attempt.attempt_count}/20`);
        return new Response(
          JSON.stringify({ 
            allowed: true,
            attempts: attempt.attempt_count,
            remaining: 20 - attempt.attempt_count
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Primeira tentativa
      return new Response(
        JSON.stringify({ allowed: true, attempts: 0, remaining: 20 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'increment') {
      // Incrementar contador de tentativas
      const { data: attempt } = await supabase
        .from('login_attempts')
        .select('*')
        .eq('email', email)
        .single();

      if (attempt) {
        const resetDueToInactivity = attempt.last_attempt_at
          ? new Date(attempt.last_attempt_at) < new Date(Date.now() - 24 * 60 * 60 * 1000)
          : false;

        const newCount = (resetDueToInactivity ? 0 : attempt.attempt_count) + 1;
        await supabase
          .from('login_attempts')
          .update({ 
            attempt_count: newCount,
            last_attempt_at: new Date().toISOString(),
            ip_address: ip_address || attempt.ip_address,
            locked_until: resetDueToInactivity ? null : attempt.locked_until
          })
          .eq('email', email);

        console.log(`[Login Attempts] Incremented to ${newCount}/20`);

        return new Response(
          JSON.stringify({ 
            success: true, 
            attempts: newCount,
            remaining: 20 - newCount,
            warning: newCount >= 15 ? `Atenção: ${20 - newCount} tentativas restantes` : null
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Criar nova entrada
        await supabase
          .from('login_attempts')
          .insert({
            email,
            ip_address,
            attempt_count: 1,
            last_attempt_at: new Date().toISOString()
          });

        console.log(`[Login Attempts] Created new entry for ${email}`);

        return new Response(
          JSON.stringify({ success: true, attempts: 1, remaining: 19 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (action === 'reset') {
      // Resetar tentativas após login bem-sucedido
      await supabase
        .from('login_attempts')
        .delete()
        .eq('email', email);

      console.log(`[Login Attempts] Reset for ${email}`);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Login Attempts] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});