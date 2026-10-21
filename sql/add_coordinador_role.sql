-- ==============================================================================
-- EDULINK: MIGRACIÓN SQL PARA HABILITAR EL ROL 'coordinador' EN SUPABASE
-- ==============================================================================
-- Ejecuta este script completo en el SQL Editor de tu proyecto Supabase.
-- ==============================================================================

-- 1. Si tu base de datos utiliza un TYPE ENUM (user_role):
--    (Si no existe el tipo enum o ya es TEXT, esta sentencia no fallará)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'coordinador';
    END IF;
END $$;

-- 2. Si tu tabla 'profiles' tiene un CHECK constraint para los roles:
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.check_constraints cc
        JOIN information_schema.table_constraints tc 
          ON cc.constraint_name = tc.constraint_name
        WHERE tc.table_name = 'profiles' 
          AND cc.check_clause LIKE '%role%'
    ) THEN
        ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
            CHECK (role::text IN ('admin', 'coordinador', 'docente', 'representante', 'estudiante'));
    END IF;
END $$;

-- 3. Funciones auxiliares de seguridad (si las usas en RLS):
--    get_my_role() y get_my_school_id()
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_my_school_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT school_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Helper booleano para verificar si el usuario tiene rol administrativo
CREATE OR REPLACE FUNCTION public.is_admin_or_coordinator()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND role::text IN ('admin', 'coordinador')
  );
$$;

-- ==============================================================================
-- 4. POLÍTICAS RLS ACTUALIZADAS (ADMIN + COORDINADOR)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- A. TABLA: terms (Lapsos)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "admin_all_terms" ON public.terms;
CREATE POLICY "admin_all_terms" ON public.terms
  FOR ALL
  USING (
    get_my_role() IN ('admin', 'coordinador') 
    AND school_id = get_my_school_id()
  )
  WITH CHECK (
    get_my_role() IN ('admin', 'coordinador') 
    AND school_id = get_my_school_id()
  );

-- ------------------------------------------------------------------------------
-- B. TABLA: evaluations (Evaluaciones)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "admin_all_evaluations" ON public.evaluations;
CREATE POLICY "admin_all_evaluations" ON public.evaluations
  FOR ALL
  USING (
    get_my_role() IN ('admin', 'coordinador') 
    AND school_id = get_my_school_id()
  )
  WITH CHECK (
    get_my_role() IN ('admin', 'coordinador') 
    AND school_id = get_my_school_id()
  );

-- ------------------------------------------------------------------------------
-- C. TABLA: grades (Calificaciones)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "admin_all_grades" ON public.grades;
CREATE POLICY "admin_all_grades" ON public.grades
  FOR ALL
  USING (
    get_my_role() IN ('admin', 'coordinador') 
    AND school_id = get_my_school_id()
  )
  WITH CHECK (
    get_my_role() IN ('admin', 'coordinador') 
    AND school_id = get_my_school_id()
  );

-- ------------------------------------------------------------------------------
-- D. TABLA: students (Alumnado)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "admin_manage_students" ON public.students;
DROP POLICY IF EXISTS "admin_all_students" ON public.students;
CREATE POLICY "admin_manage_students" ON public.students
  FOR ALL
  USING (
    get_my_role() IN ('admin', 'coordinador') 
    AND school_id = get_my_school_id()
  )
  WITH CHECK (
    get_my_role() IN ('admin', 'coordinador') 
    AND school_id = get_my_school_id()
  );

-- ------------------------------------------------------------------------------
-- E. TABLA: courses (Cursos y Secciones)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "admin_manage_courses" ON public.courses;
DROP POLICY IF EXISTS "admin_all_courses" ON public.courses;
CREATE POLICY "admin_manage_courses" ON public.courses
  FOR ALL
  USING (
    get_my_role() IN ('admin', 'coordinador') 
    AND school_id = get_my_school_id()
  )
  WITH CHECK (
    get_my_role() IN ('admin', 'coordinador') 
    AND school_id = get_my_school_id()
  );

-- ------------------------------------------------------------------------------
-- F. TABLA: subjects (Asignaturas)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "admin_manage_subjects" ON public.subjects;
DROP POLICY IF EXISTS "admin_all_subjects" ON public.subjects;
CREATE POLICY "admin_manage_subjects" ON public.subjects
  FOR ALL
  USING (
    get_my_role() IN ('admin', 'coordinador') 
    AND school_id = get_my_school_id()
  )
  WITH CHECK (
    get_my_role() IN ('admin', 'coordinador') 
    AND school_id = get_my_school_id()
  );

-- ------------------------------------------------------------------------------
-- G. TABLA: payments (Control de Pagos)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "admin_manage_payments" ON public.payments;
DROP POLICY IF EXISTS "admin_all_payments" ON public.payments;
CREATE POLICY "admin_manage_payments" ON public.payments
  FOR ALL
  USING (
    get_my_role() IN ('admin', 'coordinador') 
    AND school_id = get_my_school_id()
  )
  WITH CHECK (
    get_my_role() IN ('admin', 'coordinador') 
    AND school_id = get_my_school_id()
  );

-- ------------------------------------------------------------------------------
-- H. TABLA: billing_concepts (Aranceles)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "admin_manage_billing_concepts" ON public.billing_concepts;
DROP POLICY IF EXISTS "admin_all_billing_concepts" ON public.billing_concepts;
CREATE POLICY "admin_manage_billing_concepts" ON public.billing_concepts
  FOR ALL
  USING (
    get_my_role() IN ('admin', 'coordinador') 
    AND school_id = get_my_school_id()
  )
  WITH CHECK (
    get_my_role() IN ('admin', 'coordinador') 
    AND school_id = get_my_school_id()
  );

-- ------------------------------------------------------------------------------
-- I. TABLA: communications (Comunicados)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "admin_manage_communications" ON public.communications;
DROP POLICY IF EXISTS "admin_all_communications" ON public.communications;
CREATE POLICY "admin_manage_communications" ON public.communications
  FOR ALL
  USING (
    get_my_role() IN ('admin', 'coordinador') 
    AND school_id = get_my_school_id()
  )
  WITH CHECK (
    get_my_role() IN ('admin', 'coordinador') 
    AND school_id = get_my_school_id()
  );

-- ------------------------------------------------------------------------------
-- J. TABLA: exchange_rates (Tasas BCV)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "admin_manage_exchange_rates" ON public.exchange_rates;
DROP POLICY IF EXISTS "admin_all_exchange_rates" ON public.exchange_rates;
CREATE POLICY "admin_manage_exchange_rates" ON public.exchange_rates
  FOR ALL
  USING (
    get_my_role() IN ('admin', 'coordinador') 
    AND school_id = get_my_school_id()
  )
  WITH CHECK (
    get_my_role() IN ('admin', 'coordinador') 
    AND school_id = get_my_school_id()
  );

-- ------------------------------------------------------------------------------
-- K. TABLA: attendance (Asistencia)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "admin_manage_attendance" ON public.attendance;
CREATE POLICY "admin_manage_attendance" ON public.attendance
  FOR ALL
  USING (
    get_my_role() IN ('admin', 'coordinador') 
    AND school_id = get_my_school_id()
  )
  WITH CHECK (
    get_my_role() IN ('admin', 'coordinador') 
    AND school_id = get_my_school_id()
  );

-- ==============================================================================
-- NOTA DE SEGURIDAD CRÍTICA:
-- La tabla 'schools' y las operaciones destructivas de perfil se mantienen
-- restringidas EXCLUSIVAMENTE al 'admin' (Director).
-- ==============================================================================
