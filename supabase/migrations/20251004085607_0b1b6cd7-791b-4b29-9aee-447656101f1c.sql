-- Add new column for multiple ICD codes as JSON array
ALTER TABLE patient_records 
ADD COLUMN IF NOT EXISTS icd_codes jsonb DEFAULT '[]'::jsonb;

-- Create index for better query performance on icd_codes
CREATE INDEX IF NOT EXISTS idx_patient_records_icd_codes ON patient_records USING gin(icd_codes);

-- Migrate existing data: convert old single icd_code to new array format
UPDATE patient_records
SET icd_codes = jsonb_build_array(
  jsonb_build_object(
    'code', icd_code,
    'version', icd_version,
    'title', icd_code || ' - ' || icd_version
  )
)
WHERE icd_code IS NOT NULL 
  AND icd_code != '' 
  AND (icd_codes IS NULL OR icd_codes = '[]'::jsonb);

COMMENT ON COLUMN patient_records.icd_codes IS 'Array of ICD codes in format: [{code: "6A05.0", version: "CID-11", title: "Description"}]';