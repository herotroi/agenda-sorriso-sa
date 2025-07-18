
-- Adicionar uma coluna para identificar agendamentos bloqueados
ALTER TABLE appointments ADD COLUMN is_blocked BOOLEAN DEFAULT FALSE;

-- Criar um índice para melhorar performance nas consultas de agendamentos bloqueados
CREATE INDEX idx_appointments_blocked ON appointments(is_blocked, professional_id, start_time) WHERE is_blocked = true;
