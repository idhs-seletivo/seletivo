/*
  # Create Initial Schema for Recruitment System

  1. New Tables
    - `users` - System users (admin/analyst)
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `role` (text, admin or analyst)
      - `created_at` (timestamp)
    
    - `candidates` - Job candidates
      - `id` (uuid, primary key)
      - `full_name` (text)
      - `social_name` (text)
      - `cpf` (text, unique)
      - `desired_area` (text)
      - `desired_position_admin` (boolean)
      - `desired_position_assistant` (boolean)
      - `registration_number` (text, unique)
      - `adm_curriculum` (text, URL/path)
      - `adm_education_document` (text, URL/path)
      - `adm_personal_documents` (text, URL/path)
      - `adm_courses_certifications` (text, URL/path)
      - `assist_curriculum` (text, URL/path)
      - `assist_education_document` (text, URL/path)
      - `assist_council_card` (text, URL/path)
      - `assist_courses_certifications` (text, URL/path)
      - `assist_personal_documents` (text, URL/path)
      - `status` (text, default: pending)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `rejection_reasons` - Predefined rejection reasons
      - `id` (uuid, primary key)
      - `reason` (text, unique)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'analyst' CHECK (role IN ('admin', 'analyst')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admin can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE TABLE IF NOT EXISTS candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  social_name text,
  cpf text UNIQUE NOT NULL,
  desired_area text,
  desired_position_admin boolean DEFAULT false,
  desired_position_assistant boolean DEFAULT false,
  registration_number text UNIQUE,
  adm_curriculum text,
  adm_education_document text,
  adm_personal_documents text,
  adm_courses_certifications text,
  assist_curriculum text,
  assist_education_document text,
  assist_council_card text,
  assist_courses_certifications text,
  assist_personal_documents text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in_review')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view candidates"
  ON candidates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can insert candidates"
  ON candidates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Admin can update candidates"
  ON candidates FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE TABLE IF NOT EXISTS rejection_reasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reason text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE rejection_reasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view rejection reasons"
  ON rejection_reasons FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage rejection reasons"
  ON rejection_reasons FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Admin can update rejection reasons"
  ON rejection_reasons FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE INDEX idx_candidates_cpf ON candidates(cpf);
CREATE INDEX idx_candidates_status ON candidates(status);
CREATE INDEX idx_candidates_created_at ON candidates(created_at);
