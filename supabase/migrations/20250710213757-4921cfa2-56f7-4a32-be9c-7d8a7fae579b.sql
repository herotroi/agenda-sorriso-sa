
-- Add new address fields to patients table
ALTER TABLE public.patients 
ADD COLUMN street TEXT,
ADD COLUMN number TEXT,
ADD COLUMN neighborhood TEXT,
ADD COLUMN city TEXT,
ADD COLUMN state TEXT;

-- Remove the medical_history column
ALTER TABLE public.patients 
DROP COLUMN IF EXISTS medical_history;

-- Remove the whatsapp column as it's not needed
ALTER TABLE public.patients 
DROP COLUMN IF EXISTS whatsapp;

-- Remove the generic address column since we now have specific fields
ALTER TABLE public.patients 
DROP COLUMN IF EXISTS address;
