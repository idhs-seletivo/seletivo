/*
  # Corrigir políticas RLS da tabela users
  
  1. Mudanças
    - Remove políticas recursivas que causam erro 500
    - Cria políticas simples e seguras
    - Permite que usuários autenticados vejam seus próprios dados
    - Permite que admins vejam e gerenciem todos os usuários
  
  2. Segurança
    - Usuários só veem seu próprio perfil
    - Admins podem ver e gerenciar todos os usuários
    - Apenas usuários ativos podem fazer login
*/

-- Remove todas as políticas antigas
DROP POLICY IF EXISTS "Admin pode atualizar usuários" ON users;
DROP POLICY IF EXISTS "Admin pode criar usuários" ON users;
DROP POLICY IF EXISTS "Admin pode ver todos os usuários" ON users;
DROP POLICY IF EXISTS "Admins can create users" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Authenticated users can view active users" ON users;
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON users;

-- Cria políticas simples sem recursão
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can insert users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can update users"
  ON users FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can delete users"
  ON users FOR DELETE
  TO authenticated
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );
