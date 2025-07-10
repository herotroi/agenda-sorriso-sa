
-- First, let's check what constraint exists and update it to match the application statuses
-- Drop the existing constraint if it exists
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;

-- Add the correct constraint that matches the application statuses
ALTER TABLE appointments ADD CONSTRAINT appointments_status_check 
CHECK (status IN ('Confirmado', 'Cancelado', 'Não Compareceu', 'Em atendimento', 'Finalizado'));

-- Update any existing records with invalid status to 'Confirmado'
UPDATE appointments SET status = 'Confirmado' WHERE status NOT IN ('Confirmado', 'Cancelado', 'Não Compareceu', 'Em atendimento', 'Finalizado');
