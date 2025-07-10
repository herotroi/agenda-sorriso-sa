
-- Primeiro, vamos verificar e corrigir todos os registros existentes que possam ter valores em inglês
UPDATE appointments 
SET status = CASE 
  WHEN status = 'confirmed' THEN 'Confirmado'
  WHEN status = 'cancelled' THEN 'Cancelado'
  WHEN status = 'no_show' THEN 'Não Compareceu'
  WHEN status = 'in_progress' THEN 'Em atendimento'
  WHEN status = 'completed' THEN 'Finalizado'
  ELSE 'Confirmado'
END
WHERE status IN ('confirmed', 'cancelled', 'no_show', 'in_progress', 'completed') 
   OR status NOT IN ('Confirmado', 'Cancelado', 'Não Compareceu', 'Em atendimento', 'Finalizado');

-- Garantir que a restrição está correta
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;
ALTER TABLE appointments ADD CONSTRAINT appointments_status_check 
CHECK (status IN ('Confirmado', 'Cancelado', 'Não Compareceu', 'Em atendimento', 'Finalizado'));
