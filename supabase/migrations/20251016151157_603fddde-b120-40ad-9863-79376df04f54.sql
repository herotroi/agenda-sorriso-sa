-- Adicionar campo para quantidade de profissionais comprados
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS professionals_purchased INTEGER DEFAULT 1;

-- Atualizar assinaturas existentes baseado no plano
UPDATE user_subscriptions 
SET professionals_purchased = 1 
WHERE plan_type = 'free' AND professionals_purchased IS NULL;

-- Para planos pagos, manter o valor padrão de 1 se não estiver definido
UPDATE user_subscriptions 
SET professionals_purchased = 1 
WHERE (plan_type = 'monthly' OR plan_type = 'annual') AND professionals_purchased IS NULL;