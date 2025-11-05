/*
  # Adicionar coluna nome social
  
  1. Mudanças
    - Adiciona coluna `nome_social` na tabela `candidates`
    - Campo opcional (sem NOT NULL)
    - Tipo text com valor padrão vazio
  
  2. Notas
    - Permite armazenar o nome social do candidato
*/

-- Adicionar coluna nome_social
ALTER TABLE candidates 
  ADD COLUMN IF NOT EXISTS nome_social text DEFAULT '';
