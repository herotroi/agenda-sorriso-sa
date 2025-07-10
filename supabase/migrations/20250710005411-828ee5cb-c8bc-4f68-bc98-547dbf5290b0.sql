
-- Remover a restrição atual de status se existir
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;

-- Adicionar nova restrição com os valores corretos em português
ALTER TABLE appointments ADD CONSTRAINT appointments_status_check 
CHECK (status IN ('Confirmado', 'Cancelado', 'Não Compareceu', 'Em atendimento', 'Finalizado'));

-- Atualizar registros existentes que possam ter valores antigos
UPDATE appointments 
SET status = 'Confirmado' 
WHERE status = 'confirmed' OR status IS NULL;
