-- Corrigir políticas RLS das tabelas para restringir acesso apenas a usuários autenticados
-- Removendo políticas públicas que foram identificadas como vulnerabilidades de segurança

-- 1. Tabela subscription_limits: Remover acesso público
DROP POLICY IF EXISTS "Authenticated users can view subscription limits" ON public.subscription_limits;

CREATE POLICY "Authenticated users can view subscription limits"
ON public.subscription_limits
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- 2. Tabela settings: Remover acesso público
DROP POLICY IF EXISTS "Authenticated users can view settings" ON public.settings;

CREATE POLICY "Authenticated users can view settings"
ON public.settings
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- 3. Tabela appointment_statuses: Remover acesso público
DROP POLICY IF EXISTS "Authenticated users can view appointment statuses" ON public.appointment_statuses;

CREATE POLICY "Authenticated users can view appointment statuses"
ON public.appointment_statuses
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- 4. Corrigir função get_user_usage_stats para ter search_path imutável
DROP FUNCTION IF EXISTS public.get_user_usage_stats(uuid);

CREATE OR REPLACE FUNCTION public.get_user_usage_stats(p_user_id uuid)
RETURNS TABLE(
  appointments_count integer,
  patients_count integer,
  professionals_count integer,
  procedures_count integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM appointments WHERE user_id = p_user_id),
    (SELECT COUNT(*)::INTEGER FROM patients WHERE user_id = p_user_id AND active = true),
    (SELECT COUNT(*)::INTEGER FROM professionals WHERE user_id = p_user_id AND active = true),
    (SELECT COUNT(*)::INTEGER FROM procedures WHERE user_id = p_user_id AND active = true);
END;
$$;