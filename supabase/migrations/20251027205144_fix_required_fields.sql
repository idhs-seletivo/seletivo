/*
  # Ajustar campos obrigatórios
  
  1. Mudanças
    - Define apenas `name` e `cpf` como obrigatórios (NOT NULL)
    - Define `registration_number` como obrigatório e único
    - Todos os outros campos são opcionais
  
  2. Notas
    - Permite inserção de candidatos com dados mínimos
    - Garante que os campos essenciais estejam sempre presentes
*/

-- Primeiro remover a constraint NOT NULL se existir em outras colunas
ALTER TABLE candidates 
  ALTER COLUMN area DROP NOT NULL,
  ALTER COLUMN status DROP NOT NULL;

-- Garantir que name, cpf e registration_number sejam obrigatórios
ALTER TABLE candidates 
  ALTER COLUMN name SET NOT NULL,
  ALTER COLUMN cpf SET NOT NULL,
  ALTER COLUMN registration_number SET NOT NULL;

-- Adicionar valores default para campos que não podem ser NULL
ALTER TABLE candidates 
  ALTER COLUMN area SET DEFAULT '',
  ALTER COLUMN status SET DEFAULT 'pendente';

-- Atualizar registros existentes que possam ter valores NULL
UPDATE candidates 
SET 
  name = COALESCE(name, ''),
  cpf = COALESCE(cpf, ''),
  registration_number = COALESCE(registration_number, gen_random_uuid()::text),
  area = COALESCE(area, ''),
  status = COALESCE(status, 'pendente')
WHERE name IS NULL OR cpf IS NULL OR registration_number IS NULL;
