-- Adicionar campos de pagamento à tabela appointments
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT;

-- Comentários para documentação
COMMENT ON COLUMN public.appointments.payment_method IS 'Forma de pagamento: debito, credito, credito_parcelado, dinheiro, pix, boleto, nao_informado, gratis, outros';
COMMENT ON COLUMN public.appointments.payment_status IS 'Status de pagamento: pagamento_realizado, aguardando_pagamento, nao_pagou, pagamento_cancelado, sem_pagamento';