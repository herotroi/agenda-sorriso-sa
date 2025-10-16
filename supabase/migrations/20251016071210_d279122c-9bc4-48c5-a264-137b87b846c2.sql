-- Clean existing duplicates for created/deleted notifications
WITH ranked AS (
  SELECT id, user_id, appointment_id, type, created_at,
         ROW_NUMBER() OVER (PARTITION BY user_id, COALESCE(appointment_id, '00000000-0000-0000-0000-000000000000'), type ORDER BY created_at ASC) AS rn
  FROM public.notifications
  WHERE type IN ('appointment_created','appointment_deleted')
)
DELETE FROM public.notifications n
USING ranked r
WHERE n.id = r.id AND r.rn > 1;

-- Try creating the partial unique index again
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_unique_notifications_created_deleted'
  ) THEN
    CREATE UNIQUE INDEX idx_unique_notifications_created_deleted
    ON public.notifications (user_id, COALESCE(appointment_id, '00000000-0000-0000-0000-000000000000'), type)
    WHERE type IN ('appointment_created', 'appointment_deleted');
  END IF;
END $$;