-- Remove a coluna status obsoleta da tabela appointments
-- Agora usamos apenas status_id como chave estrangeira para appointment_statuses

ALTER TABLE public.appointments DROP COLUMN IF EXISTS status;