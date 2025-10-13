-- Add timezone column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Sao_Paulo';

-- Update existing profiles to use São Paulo timezone
UPDATE public.profiles 
SET timezone = 'America/Sao_Paulo' 
WHERE timezone IS NULL;