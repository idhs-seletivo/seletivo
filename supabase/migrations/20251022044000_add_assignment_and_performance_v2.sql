/*
  # Adicionar sistema de atribuição e otimizações de performance

  1. Modificações na tabela candidates
    - Adicionar campo `assigned_to` (email do analista atribuído)
    - Índices para melhorar performance com 15k registros
  
  2. Otimizações
    - Índices compostos para queries mais rápidas
    - Índice para paginação eficiente
  
  3. Security
    - Manter RLS existente
*/

-- Habilitar extensão pg_trgm primeiro
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Adicionar campo de atribuição
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'assigned_to'
  ) THEN
    ALTER TABLE candidates ADD COLUMN assigned_to text DEFAULT NULL;
  END IF;
END $$;

-- Criar índices compostos para performance
CREATE INDEX IF NOT EXISTS idx_candidates_status_assigned 
  ON candidates(status_triagem, assigned_to);

CREATE INDEX IF NOT EXISTS idx_candidates_assigned_pending 
  ON candidates(assigned_to, status_triagem) 
  WHERE status_triagem IS NULL OR status_triagem = '';

CREATE INDEX IF NOT EXISTS idx_candidates_priority_created 
  ON candidates(priority DESC, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_candidates_area_status 
  ON candidates(area, status_triagem);

CREATE INDEX IF NOT EXISTS idx_candidates_unassigned_pending 
  ON candidates(priority DESC, created_at ASC) 
  WHERE (status_triagem IS NULL OR status_triagem = '') AND assigned_to IS NULL;

-- Índices para busca por nome/registro com pg_trgm
CREATE INDEX IF NOT EXISTS idx_candidates_name_trgm 
  ON candidates USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_candidates_registration_trgm 
  ON candidates USING gin (registration_number gin_trgm_ops);

-- Comentários para documentação
COMMENT ON COLUMN candidates.assigned_to IS 'Email do analista atribuído para triagem';
COMMENT ON INDEX idx_candidates_unassigned_pending IS 'Índice otimizado para buscar próximo lote de candidatos não atribuídos';
