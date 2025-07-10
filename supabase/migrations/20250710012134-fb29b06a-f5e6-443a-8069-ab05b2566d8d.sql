
-- Criar tabela de status
CREATE TABLE public.appointment_statuses (
  id SERIAL PRIMARY KEY,
  key VARCHAR(50) UNIQUE NOT NULL,
  label VARCHAR(100) NOT NULL,
  color VARCHAR(20) DEFAULT '#6b7280',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir os status padrão
INSERT INTO public.appointment_statuses (key, label, color) VALUES
('confirmed', 'Confirmado', '#10b981'),
('cancelled', 'Cancelado', '#ef4444'),
('no_show', 'Não Compareceu', '#6b7280'),
('in_progress', 'Em atendimento', '#3b82f6'),
('completed', 'Finalizado', '#8b5cf6');

-- Remover a constraint antiga
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;

-- Adicionar nova coluna para referência do status por ID
ALTER TABLE appointments ADD COLUMN status_id INTEGER;

-- Atualizar os registros existentes para usar os IDs
UPDATE appointments 
SET status_id = (
  SELECT id FROM appointment_statuses 
  WHERE key = CASE 
    WHEN appointments.status = 'confirmed' OR appointments.status = 'Confirmado' THEN 'confirmed'
    WHEN appointments.status = 'cancelled' OR appointments.status = 'Cancelado' THEN 'cancelled'
    WHEN appointments.status = 'no_show' OR appointments.status = 'Não Compareceu' THEN 'no_show'
    WHEN appointments.status = 'in_progress' OR appointments.status = 'Em atendimento' THEN 'in_progress'
    WHEN appointments.status = 'completed' OR appointments.status = 'Finalizado' THEN 'completed'
    ELSE 'confirmed'
  END
);

-- Adicionar foreign key constraint
ALTER TABLE appointments 
ADD CONSTRAINT fk_appointments_status 
FOREIGN KEY (status_id) REFERENCES appointment_statuses(id);

-- Tornar status_id obrigatório
ALTER TABLE appointments ALTER COLUMN status_id SET NOT NULL;

-- Definir valor padrão para novos registros
ALTER TABLE appointments ALTER COLUMN status_id SET DEFAULT 1;
