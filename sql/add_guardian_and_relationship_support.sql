-- ==============================================================================
-- EDULINK: SOPORTE PARA REPRESENTANTES, TUTORES LEGALES Y PARENTESCO
-- ==============================================================================
-- Adaptado a la realidad socioeducativa venezolana (LOPNNA y diáspora familiar).
-- Permite registrar tutores (abuelos, tíos, hermanos) y contactos en el exterior.
-- Seguro e idempotente: no falla si alguna tabla aún no ha sido creada.
-- ==============================================================================

-- 1. Agregar columnas de fecha de nacimiento, género, parentesco y tutor a 'students'
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('M', 'F')),
  ADD COLUMN IF NOT EXISTS relationship TEXT,
  ADD COLUMN IF NOT EXISTS secondary_guardian_name TEXT,
  ADD COLUMN IF NOT EXISTS secondary_guardian_phone TEXT,
  ADD COLUMN IF NOT EXISTS secondary_guardian_relationship TEXT,
  ADD COLUMN IF NOT EXISTS secondary_guardian_role TEXT;

-- 2. Agregar columnas a 'enrollment_requests' SOLO SI la tabla existe
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'enrollment_requests'
  ) THEN
    ALTER TABLE public.enrollment_requests
      ADD COLUMN IF NOT EXISTS parent_relationship TEXT DEFAULT 'madre',
      ADD COLUMN IF NOT EXISTS secondary_guardian_name TEXT,
      ADD COLUMN IF NOT EXISTS secondary_guardian_phone TEXT,
      ADD COLUMN IF NOT EXISTS secondary_guardian_relationship TEXT;
  END IF;
END $$;

-- 3. Índices para optimizar búsquedas de representantes y sus alumnos a cargo
CREATE INDEX IF NOT EXISTS idx_students_parent_id 
  ON public.students (parent_id) 
  WHERE parent_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_students_school_parent 
  ON public.students (school_id, parent_id) 
  WHERE is_active = true;

-- 4. Índice para perfiles con rol 'representante'
CREATE INDEX IF NOT EXISTS idx_profiles_school_representante 
  ON public.profiles (school_id, role) 
  WHERE role = 'representante';
