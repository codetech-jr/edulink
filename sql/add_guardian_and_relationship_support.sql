-- ==============================================================================
-- EDULINK: SOPORTE PARA REPRESENTANTES, TUTORES LEGALES Y PARENTESCO
-- ==============================================================================
-- Adaptado a la realidad socioeducativa venezolana (LOPNNA y diáspora familiar).
-- Permite registrar tutores (abuelos, tíos, hermanos) y contactos en el exterior.
-- ==============================================================================

-- 1. Agregar columnas de parentesco y contacto secundario a 'students'
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS relationship TEXT,
  ADD COLUMN IF NOT EXISTS secondary_guardian_name TEXT,
  ADD COLUMN IF NOT EXISTS secondary_guardian_phone TEXT,
  ADD COLUMN IF NOT EXISTS secondary_guardian_relationship TEXT,
  ADD COLUMN IF NOT EXISTS secondary_guardian_role TEXT;

-- 2. Agregar columnas de parentesco a 'enrollment_requests' (Preinscripciones)
ALTER TABLE public.enrollment_requests
  ADD COLUMN IF NOT EXISTS parent_relationship TEXT DEFAULT 'madre',
  ADD COLUMN IF NOT EXISTS secondary_guardian_name TEXT,
  ADD COLUMN IF NOT EXISTS secondary_guardian_phone TEXT,
  ADD COLUMN IF NOT EXISTS secondary_guardian_relationship TEXT;

-- 3. Índice para optimizar búsquedas de representantes y sus alumnos a cargo
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
