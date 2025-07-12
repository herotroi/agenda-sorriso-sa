
-- Criar tabela de assinaturas dos usuários
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_type TEXT NOT NULL DEFAULT 'free', -- 'free', 'monthly', 'annual'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'canceled', 'expired'
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Criar tabela de limites por plano
CREATE TABLE public.subscription_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_type TEXT NOT NULL UNIQUE,
  max_appointments INTEGER NOT NULL,
  max_patients INTEGER NOT NULL,
  max_professionals INTEGER NOT NULL,
  max_procedures INTEGER NOT NULL,
  has_ehr_access BOOLEAN NOT NULL DEFAULT false, -- prontuário eletrônico
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inserir os limites para cada plano
INSERT INTO public.subscription_limits (plan_type, max_appointments, max_patients, max_professionals, max_procedures, has_ehr_access) VALUES
('free', 50, 10, 1, 5, false),
('monthly', -1, -1, -1, -1, true), -- -1 significa ilimitado
('annual', -1, -1, -1, -1, true);

-- Criar função para obter contadores de uso atual
CREATE OR REPLACE FUNCTION public.get_user_usage_stats(p_user_id UUID)
RETURNS TABLE (
  appointments_count INTEGER,
  patients_count INTEGER,
  professionals_count INTEGER,
  procedures_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM appointments WHERE user_id = p_user_id),
    (SELECT COUNT(*)::INTEGER FROM patients WHERE user_id = p_user_id AND active = true),
    (SELECT COUNT(*)::INTEGER FROM professionals WHERE user_id = p_user_id AND active = true),
    (SELECT COUNT(*)::INTEGER FROM procedures WHERE user_id = p_user_id AND active = true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_limits ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_subscriptions
CREATE POLICY "Users can view their own subscription" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription" ON public.user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" ON public.user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para subscription_limits (leitura pública)
CREATE POLICY "Anyone can view subscription limits" ON public.subscription_limits
  FOR SELECT USING (true);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir assinatura gratuita para usuários existentes
INSERT INTO public.user_subscriptions (user_id, plan_type, status)
SELECT id, 'free', 'active' 
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM public.user_subscriptions);
