-- Add ICD code columns to patient_records table
ALTER TABLE patient_records 
ADD COLUMN IF NOT EXISTS icd_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS icd_version VARCHAR(10);

-- Create index for better search performance
CREATE INDEX IF NOT EXISTS idx_patient_records_icd_code ON patient_records(icd_code);

COMMENT ON COLUMN patient_records.icd_code IS 'CID-10 or CID-11 code (e.g., A00.0)';
COMMENT ON COLUMN patient_records.icd_version IS 'CID version: "CID-10" or "CID-11"';