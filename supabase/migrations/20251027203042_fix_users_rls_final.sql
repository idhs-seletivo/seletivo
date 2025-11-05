/*
  # Correção definitiva das políticas RLS da tabela users
  
  1. Estratégia
    - Cria função auxiliar para verificar se usuário é admin
    - Usa cache para evitar recursão infinita
    - Políticas simples e diretas
  
  2. Mudanças
    - Remove TODAS as políticas existentes
    - Cria função is_admin() com SECURITY DEFINER
    - Cria novas políticas usando a função
  
  3. Segurança
    - Usuários veem apenas seu próprio perfil
    - Admins veem e gerenciam todos os usuários
    - Sem recursão nas consultas RLS
*/

-- Remove TODAS as políticas antigas
DROP POLICY IF EXISTS "Admin pode atualizar usuários" ON users;
DROP POLICY IF EXISTS "Admin pode criar usuários" ON users;
DROP POLICY IF EXISTS "Admin pode ver todos os usuários" ON users;
DROP POLICY IF EXISTS "Admins can create users" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Authenticated users can view active users" ON users;
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;

-- Cria função auxiliar para verificar se é admin (sem RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
    AND active = true
  );
END;
$$;

-- Políticas simples usando a função auxiliar
CREATE POLICY "allow_own_profile_read"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "allow_admin_read_all"
  ON users FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "allow_admin_insert"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "allow_admin_update"
  ON users FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "allow_admin_delete"
  ON users FOR DELETE
  TO authenticated
  USING (public.is_admin());
