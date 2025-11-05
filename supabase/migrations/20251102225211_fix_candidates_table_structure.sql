/*
  # Fix Candidates Table Structure

  1. Consolidate Duplicate Columns
    - Remove old column names with suffixes
    - Keep only the new CSV-compatible column names
    - Preserve any existing data

  2. Ensure Proper Structure
    - All fields ready for CSV import
    - Consistent naming with CSV headers
*/

DO $$
BEGIN
  -- Transfer data from old columns to new ones if they exist
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'full_name'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'nome_completo'
  ) THEN
    UPDATE candidates SET nome_completo = full_name WHERE nome_completo IS NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'social_name'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'nome_social'
  ) THEN
    UPDATE candidates SET nome_social = social_name WHERE nome_social IS NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'cpf'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'cpf_numero'
  ) THEN
    UPDATE candidates SET cpf_numero = cpf WHERE cpf_numero IS NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'registration_number'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'numero_inscricao'
  ) THEN
    UPDATE candidates SET numero_inscricao = registration_number WHERE numero_inscricao IS NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'area_atuacao_pretendida_old'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'area_atuacao_pretendida'
  ) THEN
    UPDATE candidates SET area_atuacao_pretendida = area_atuacao_pretendida_old WHERE area_atuacao_pretendida IS NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'cargo_administrativo_old'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'cargo_administrativo'
  ) THEN
    UPDATE candidates SET cargo_administrativo = cargo_administrativo_old WHERE cargo_administrativo IS NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'cargo_assistencial_old'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'cargo_assistencial'
  ) THEN
    UPDATE candidates SET cargo_assistencial = cargo_assistencial_old WHERE cargo_assistencial IS NULL;
  END IF;

  -- Transfer document data
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'adm_curriculum'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'adm_curriculo'
  ) THEN
    UPDATE candidates SET adm_curriculo = adm_curriculum WHERE adm_curriculo IS NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'adm_education_document'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'adm_diploma_certificado'
  ) THEN
    UPDATE candidates SET adm_diploma_certificado = adm_education_document WHERE adm_diploma_certificado IS NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'adm_personal_documents'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'adm_documentos_pessoais'
  ) THEN
    UPDATE candidates SET adm_documentos_pessoais = adm_personal_documents WHERE adm_documentos_pessoais IS NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'adm_courses_certifications'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'adm_cursos_especializacoes'
  ) THEN
    UPDATE candidates SET adm_cursos_especializacoes = adm_courses_certifications WHERE adm_cursos_especializacoes IS NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'assist_curriculum'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'assist_curriculo_vitae'
  ) THEN
    UPDATE candidates SET assist_curriculo_vitae = assist_curriculum WHERE assist_curriculo_vitae IS NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'assist_education_document'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'assist_diploma_certificado'
  ) THEN
    UPDATE candidates SET assist_diploma_certificado = assist_education_document WHERE assist_diploma_certificado IS NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'assist_council_card'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'assist_carteira_conselho'
  ) THEN
    UPDATE candidates SET assist_carteira_conselho = assist_council_card WHERE assist_carteira_conselho IS NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'assist_courses_certifications'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'assist_cursos_especializacoes'
  ) THEN
    UPDATE candidates SET assist_cursos_especializacoes = assist_courses_certifications WHERE assist_cursos_especializacoes IS NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'assist_personal_documents'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'assist_documentos_pessoais'
  ) THEN
    UPDATE candidates SET assist_documentos_pessoais = assist_personal_documents WHERE assist_documentos_pessoais IS NULL;
  END IF;

END $$;

-- Drop old columns to avoid confusion
ALTER TABLE candidates
  DROP COLUMN IF EXISTS full_name,
  DROP COLUMN IF EXISTS social_name,
  DROP COLUMN IF EXISTS cpf,
  DROP COLUMN IF EXISTS area_atuacao_pretendida_old,
  DROP COLUMN IF EXISTS cargo_administrativo_old,
  DROP COLUMN IF EXISTS cargo_assistencial_old,
  DROP COLUMN IF EXISTS registration_number,
  DROP COLUMN IF EXISTS adm_curriculum,
  DROP COLUMN IF EXISTS adm_education_document,
  DROP COLUMN IF EXISTS adm_personal_documents,
  DROP COLUMN IF EXISTS adm_courses_certifications,
  DROP COLUMN IF EXISTS assist_curriculum,
  DROP COLUMN IF EXISTS assist_education_document,
  DROP COLUMN IF EXISTS assist_council_card,
  DROP COLUMN IF EXISTS assist_courses_certifications,
  DROP COLUMN IF EXISTS assist_personal_documents;

-- Add NOT NULL constraint to required fields
ALTER TABLE candidates
  ALTER COLUMN nome_completo SET NOT NULL,
  ALTER COLUMN cpf_numero SET NOT NULL;

-- Create unique constraints on important fields
ALTER TABLE candidates
  ADD CONSTRAINT unique_cpf_numero UNIQUE (cpf_numero),
  ADD CONSTRAINT unique_numero_inscricao UNIQUE (numero_inscricao);
