/*
  # Adicionar colunas específicas para candidatos
  
  1. Novas colunas
    - `submission_date` - Data de submissão
    - `cpf` - CPF do candidato
    - `cargo_administrativo` - Cargo pretendido administrativo
    - `cargo_assistencial` - Cargo pretendido assistencial
    - `adm_curriculo` - Link do currículo (área administrativa)
    - `adm_diploma` - Link do diploma (área administrativa)
    - `adm_documentos` - Link dos documentos pessoais (área administrativa)
    - `adm_cursos` - Link dos cursos (área administrativa)
    - `assist_curriculo` - Link do currículo (área assistencial)
    - `assist_diploma` - Link do diploma (área assistencial)
    - `assist_carteira` - Link da carteira do conselho (área assistencial)
    - `assist_cursos` - Link dos cursos (área assistencial)
    - `assist_documentos` - Link dos documentos pessoais (área assistencial)
    - `status_triagem` - Status da triagem
    - `data_hora_triagem` - Data e hora da triagem
    - `analista_triagem` - Analista responsável pela triagem
  
  2. Segurança
    - Mantém RLS existente
    - Todas as colunas permitem NULL para compatibilidade
*/

-- Adicionar colunas de dados do candidato
ALTER TABLE candidates 
  ADD COLUMN IF NOT EXISTS submission_date text,
  ADD COLUMN IF NOT EXISTS cpf text,
  ADD COLUMN IF NOT EXISTS cargo_administrativo text,
  ADD COLUMN IF NOT EXISTS cargo_assistencial text,
  ADD COLUMN IF NOT EXISTS adm_curriculo text,
  ADD COLUMN IF NOT EXISTS adm_diploma text,
  ADD COLUMN IF NOT EXISTS adm_documentos text,
  ADD COLUMN IF NOT EXISTS adm_cursos text,
  ADD COLUMN IF NOT EXISTS assist_curriculo text,
  ADD COLUMN IF NOT EXISTS assist_diploma text,
  ADD COLUMN IF NOT EXISTS assist_carteira text,
  ADD COLUMN IF NOT EXISTS assist_cursos text,
  ADD COLUMN IF NOT EXISTS assist_documentos text,
  ADD COLUMN IF NOT EXISTS status_triagem text,
  ADD COLUMN IF NOT EXISTS data_hora_triagem text,
  ADD COLUMN IF NOT EXISTS analista_triagem text;

-- Criar índice para CPF
CREATE INDEX IF NOT EXISTS idx_candidates_cpf ON candidates(cpf);

-- Criar índice para status de triagem
CREATE INDEX IF NOT EXISTS idx_candidates_status_triagem ON candidates(status_triagem);

-- Comentários para documentação
COMMENT ON COLUMN candidates.submission_date IS 'Data de submissão do formulário';
COMMENT ON COLUMN candidates.cpf IS 'CPF do candidato';
COMMENT ON COLUMN candidates.cargo_administrativo IS 'Cargo pretendido na área administrativa';
COMMENT ON COLUMN candidates.cargo_assistencial IS 'Cargo pretendido na área assistencial';
COMMENT ON COLUMN candidates.status_triagem IS 'Status da triagem: Classificado, Desclassificado ou Revisar';
COMMENT ON COLUMN candidates.data_hora_triagem IS 'Data e hora em que a triagem foi realizada';
COMMENT ON COLUMN candidates.analista_triagem IS 'Email do analista que realizou a triagem';
