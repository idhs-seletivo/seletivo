/*
  # Remover obrigatoriedade de campos
  
  1. Mudanças
    - Remove NOT NULL de `name` e `cpf`
    - Apenas `registration_number` permanece obrigatório
    - Todos os outros campos são opcionais
  
  2. Notas
    - Permite importação sem validação de campos obrigatórios
*/

-- Remover a constraint NOT NULL dos campos name e cpf
ALTER TABLE candidates 
  ALTER COLUMN name DROP NOT NULL,
  ALTER COLUMN cpf DROP NOT NULL;

-- Definir valores default vazios
ALTER TABLE candidates 
  ALTER COLUMN name SET DEFAULT '',
  ALTER COLUMN cpf SET DEFAULT '';
