/*
  # Prepare Candidates Table for CSV Import

  1. Updated Candidates Table
    - Renamed fields to match CSV column names exactly
    - Added missing fields for all document types
    - Ensured all fields accept document paths/URLs
    - Added field for desired_area to capture "Área de atuação pretendida"

  2. Security
    - Maintains existing RLS policies
*/

DO $$
BEGIN
  -- Add missing columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'area_atuacao_pretendida'
  ) THEN
    ALTER TABLE candidates ADD COLUMN area_atuacao_pretendida text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'cargo_administrativo'
  ) THEN
    ALTER TABLE candidates ADD COLUMN cargo_administrativo boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'cargo_assistencial'
  ) THEN
    ALTER TABLE candidates ADD COLUMN cargo_assistencial boolean DEFAULT false;
  END IF;

  -- Rename existing columns to match CSV headers
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'desired_area'
  ) THEN
    ALTER TABLE candidates RENAME COLUMN desired_area TO area_atuacao_pretendida_old;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'desired_position_admin'
  ) THEN
    ALTER TABLE candidates RENAME COLUMN desired_position_admin TO cargo_administrativo_old;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'desired_position_assistant'
  ) THEN
    ALTER TABLE candidates RENAME COLUMN desired_position_assistant TO cargo_assistencial_old;
  END IF;

  -- Ensure all document columns exist with exact CSV names
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'numero_inscricao'
  ) THEN
    ALTER TABLE candidates ADD COLUMN numero_inscricao text UNIQUE;
  END IF;

END $$;

-- Update column order and ensure all CSV columns exist
ALTER TABLE candidates
  ADD COLUMN IF NOT EXISTS nome_completo text,
  ADD COLUMN IF NOT EXISTS nome_social text,
  ADD COLUMN IF NOT EXISTS cpf_numero text,
  ADD COLUMN IF NOT EXISTS adm_curriculo text,
  ADD COLUMN IF NOT EXISTS adm_diploma_certificado text,
  ADD COLUMN IF NOT EXISTS adm_documentos_pessoais text,
  ADD COLUMN IF NOT EXISTS adm_cursos_especializacoes text,
  ADD COLUMN IF NOT EXISTS assist_curriculo_vitae text,
  ADD COLUMN IF NOT EXISTS assist_diploma_certificado text,
  ADD COLUMN IF NOT EXISTS assist_carteira_conselho text,
  ADD COLUMN IF NOT EXISTS assist_cursos_especializacoes text,
  ADD COLUMN IF NOT EXISTS assist_documentos_pessoais text;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_candidates_cpf_numero ON candidates(cpf_numero);
CREATE INDEX IF NOT EXISTS idx_candidates_numero_inscricao ON candidates(numero_inscricao);
