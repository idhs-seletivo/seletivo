/*
  # Fix RLS Policies for Assignment System

  ## Overview
  Updates RLS policies to use correct column names (active instead of ativo, name instead of nome)

  ## 1. Security Changes
    - Drop and recreate all policies with correct column names
    - Ensure admins can manage all data
    - Ensure analysts only see their assigned candidates

  ## 2. Important Notes
    - Uses 'active' column (not 'ativo') 
    - Uses 'name' column (not 'nome')
    - Maintains proper access control for role-based system
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view active users" ON users;
DROP POLICY IF EXISTS "Admins can create users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;
DROP POLICY IF EXISTS "Users can view candidates based on role" ON candidates;
DROP POLICY IF EXISTS "Admins can insert candidates" ON candidates;
DROP POLICY IF EXISTS "Authorized users can update candidates" ON candidates;
DROP POLICY IF EXISTS "Admins can delete candidates" ON candidates;

-- Users policies: All authenticated users can read active users
CREATE POLICY "Authenticated users can view active users"
  ON users FOR SELECT
  TO authenticated
  USING (active = true);

-- Only admins can insert users
CREATE POLICY "Admins can create users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin' AND active = true
    )
  );

-- Only admins can update users
CREATE POLICY "Admins can update users"
  ON users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin' AND active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin' AND active = true
    )
  );

-- Only admins can delete users
CREATE POLICY "Admins can delete users"
  ON users FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin' AND active = true
    )
  );

-- Candidates policies

-- Admins can view all candidates, analysts only see assigned ones
CREATE POLICY "Users can view candidates based on role"
  ON candidates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() 
      AND active = true
      AND (
        role = 'admin' 
        OR (role = 'analista' AND candidates.assigned_to = auth.uid())
      )
    )
  );

-- Only admins can insert candidates
CREATE POLICY "Admins can insert candidates"
  ON candidates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin' AND active = true
    )
  );

-- Admins or assigned analysts can update candidates
CREATE POLICY "Authorized users can update candidates"
  ON candidates FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() 
      AND active = true
      AND (
        role = 'admin' 
        OR (role = 'analista' AND candidates.assigned_to = auth.uid())
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() 
      AND active = true
      AND (
        role = 'admin' 
        OR (role = 'analista' AND candidates.assigned_to = auth.uid())
      )
    )
  );

-- Only admins can delete candidates
CREATE POLICY "Admins can delete candidates"
  ON candidates FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin' AND active = true
    )
  );
