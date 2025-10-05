-- Tabela para rastrear tentativas de login
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address TEXT,
  attempt_count INTEGER DEFAULT 1,
  last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índice para busca rápida por email
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON public.login_attempts(email);

-- RLS para login_attempts (apenas service role)
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only for login_attempts"
  ON public.login_attempts
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Função para limpar tentativas antigas (mais de 24h)
CREATE OR REPLACE FUNCTION public.cleanup_old_login_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.login_attempts
  WHERE created_at < now() - interval '24 hours';
END;
$$;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_login_attempts_updated_at
  BEFORE UPDATE ON public.login_attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Melhorar segurança do cupons - adicionar RLS mais restritivo
DROP POLICY IF EXISTS "Authenticated users can view active coupons" ON public.cupons;

CREATE POLICY "Users cannot view coupons directly"
  ON public.cupons
  FOR SELECT
  USING (false);

-- Criar tabela para associar cupons a usuários específicos
CREATE TABLE IF NOT EXISTS public.user_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  coupon_id UUID NOT NULL REFERENCES public.cupons(id) ON DELETE CASCADE,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, coupon_id)
);

ALTER TABLE public.user_coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own coupons"
  ON public.user_coupons
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own coupons"
  ON public.user_coupons
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_coupons_user_id ON public.user_coupons(user_id);
CREATE INDEX IF NOT EXISTS idx_user_coupons_coupon_id ON public.user_coupons(coupon_id);

-- Trigger para atualizar updated_at em user_coupons
CREATE TRIGGER update_user_coupons_updated_at
  BEFORE UPDATE ON public.user_coupons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();