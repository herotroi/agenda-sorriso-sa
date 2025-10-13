-- Change appointments start_time and end_time to timestamp without time zone
-- Convert existing data from UTC to America/Sao_Paulo local time
ALTER TABLE public.appointments
  ALTER COLUMN start_time TYPE timestamp WITHOUT time zone USING (start_time AT TIME ZONE 'America/Sao_Paulo');

ALTER TABLE public.appointments
  ALTER COLUMN end_time TYPE timestamp WITHOUT time zone USING (end_time AT TIME ZONE 'America/Sao_Paulo');