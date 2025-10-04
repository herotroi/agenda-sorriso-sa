import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.4";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  action: "start" | "verify" | "reset";
  email: string;
  code?: string;
  new_password?: string;
}

// Rate limiting cache (in-memory, resets on function restart)
const rateLimitCache = new Map<string, { count: number; lastReset: number }>();

function checkRateLimit(identifier: string, maxAttempts: number, windowMs: number): boolean {
  const now = Date.now();
  const cached = rateLimitCache.get(identifier);
  
  if (!cached || now - cached.lastReset > windowMs) {
    rateLimitCache.set(identifier, { count: 1, lastReset: now });
    return true;
  }
  
  if (cached.count >= maxAttempts) {
    return false;
  }
  
  cached.count++;
  return true;
}

async function generateCode(): Promise<string> {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function handleStart(email: string, ip: string, userAgent: string) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Rate limit: 1 request per minute per email
  if (!checkRateLimit(`email:${email}`, 1, 60000)) {
    return new Response(
      JSON.stringify({ error: "Muitas tentativas. Aguarde 1 minuto." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  // Check if user exists in profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  
  if (!profile) {
    // Don't reveal if email exists or not (security best practice)
    console.log(`Password reset requested for non-existent email: ${email}`);
    return new Response(
      JSON.stringify({ success: true, message: "Se o email existir, você receberá um código." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  // Generate 6-digit code
  const code = await generateCode();
  const codeHash = await hashCode(code);
  
  // Clean up old codes for this email
  await supabase
    .from("password_reset_codes")
    .delete()
    .eq("email", email.toLowerCase())
    .lt("expires_at", new Date().toISOString());
  
  // Save code hash to database (expires in 5 minutes)
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  const { error: insertError } = await supabase
    .from("password_reset_codes")
    .insert({
      user_id: profile.id,
      email: email.toLowerCase(),
      code_hash: codeHash,
      expires_at: expiresAt,
      requested_ip: ip,
      request_user_agent: userAgent,
    });
  
  if (insertError) {
    console.error("Error saving reset code:", insertError);
    return new Response(
      JSON.stringify({ error: "Erro ao processar solicitação" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  // Send email with code
  try {
    const appUrl = Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", "") || "https://seu-app.com";
    
    console.log(`Attempting to send email to: ${email}`);
    
    // Get and normalize the from address
    const fromAddress = (Deno.env.get("RESEND_FROM_EMAIL") || "Sistema <noreply@herotroiautomacoes.site>").trim();
    console.log(`Using from address: ${fromAddress}`);
    
    const emailResult = await resend.emails.send({
      from: fromAddress,
      to: [email],
      subject: "Código de Recuperação de Senha",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; font-size: 24px; margin-bottom: 20px;">Recuperação de Senha</h1>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
            Você solicitou a recuperação de senha. Use o código abaixo para prosseguir:
          </p>
          
          <div style="background: #f5f5f5; border-radius: 8px; padding: 30px; text-align: center; margin-bottom: 20px;">
            <p style="color: #666; font-size: 14px; margin-bottom: 10px;">Seu código de verificação:</p>
            <div style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${code}
            </div>
          </div>
          
          <p style="color: #999; font-size: 14px; line-height: 1.5;">
            Este código expira em <strong>5 minutos</strong>.<br>
            Se você não solicitou esta recuperação, ignore este email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            Este é um email automático, por favor não responda.
          </p>
        </div>
      `,
    });
    
    console.log(`Resend API response:`, JSON.stringify(emailResult, null, 2));
    
    if (emailResult.error) {
      console.error(`Resend error details:`, JSON.stringify(emailResult.error, null, 2));
      return new Response(
        JSON.stringify({ error: `Erro ao enviar email: ${emailResult.error.message || 'Erro desconhecido'}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Password reset code sent successfully to ${email}. Email ID: ${emailResult.data?.id}`);
  } catch (emailError) {
    console.error("Error sending email:", emailError);
    console.error("Error details:", JSON.stringify(emailError, null, 2));
    return new Response(
      JSON.stringify({ error: `Falha ao enviar email: ${emailError.message || 'Erro desconhecido'}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  return new Response(
    JSON.stringify({ success: true, message: "Código enviado para seu email!" }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleVerify(email: string, code: string) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const codeHash = await hashCode(code);
  
  // Find valid code
  const { data: resetCode, error } = await supabase
    .from("password_reset_codes")
    .select("*")
    .eq("email", email.toLowerCase())
    .eq("code_hash", codeHash)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  
  if (error || !resetCode) {
    return new Response(
      JSON.stringify({ error: "Código inválido ou expirado" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  // Update attempts
  await supabase
    .from("password_reset_codes")
    .update({ attempts: resetCode.attempts + 1 })
    .eq("id", resetCode.id);
  
  return new Response(
    JSON.stringify({ success: true, message: "Código válido!" }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleReset(email: string, code: string, newPassword: string) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const codeHash = await hashCode(code);
  
  // Find valid code
  const { data: resetCode, error } = await supabase
    .from("password_reset_codes")
    .select("*")
    .eq("email", email.toLowerCase())
    .eq("code_hash", codeHash)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  
  if (error || !resetCode) {
    return new Response(
      JSON.stringify({ error: "Código inválido ou expirado" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  // Update user password using Admin API
  const { error: updateError } = await supabase.auth.admin.updateUserById(
    resetCode.user_id,
    { password: newPassword }
  );
  
  if (updateError) {
    console.error("Error updating password:", updateError);
    return new Response(
      JSON.stringify({ error: "Erro ao atualizar senha" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  // Mark code as used
  await supabase
    .from("password_reset_codes")
    .update({ used_at: new Date().toISOString() })
    .eq("id", resetCode.id);
  
  console.log(`Password reset successful for user: ${resetCode.user_id}`);
  
  return new Response(
    JSON.stringify({ success: true, message: "Senha alterada com sucesso!" }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { action, email, code, new_password }: RequestBody = await req.json();
    
    // Basic validation
    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Email inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";
    
    switch (action) {
      case "start":
        return await handleStart(email, ip, userAgent);
      
      case "verify":
        if (!code || code.length !== 6) {
          return new Response(
            JSON.stringify({ error: "Código deve ter 6 dígitos" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        return await handleVerify(email, code);
      
      case "reset":
        if (!code || code.length !== 6) {
          return new Response(
            JSON.stringify({ error: "Código deve ter 6 dígitos" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (!new_password || new_password.length < 8) {
          return new Response(
            JSON.stringify({ error: "Senha deve ter no mínimo 8 caracteres" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        return await handleReset(email, code, new_password);
      
      default:
        return new Response(
          JSON.stringify({ error: "Ação inválida" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Error in password-recovery function:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
