-- ==============================================================================
-- EDULINK: ÍNDICES Y OPTIMIZACIONES PARA CUADRO ESTADÍSTICO MPPE
-- ==============================================================================
-- Optimiza la consulta y agregación por cohortes de edad, género y curso
-- para instituciones educativas venezolanas según requerimiento del MPPE.
-- ==============================================================================

-- Asegurar que las columnas existen en students antes de crear los índices
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('M', 'F'));

CREATE INDEX IF NOT EXISTS idx_students_mppe_stats 
  ON public.students (school_id, is_active, course_id, gender, birth_date);

CREATE INDEX IF NOT EXISTS idx_students_birth_gender 
  ON public.students (school_id, birth_date, gender) 
  WHERE is_active = true;
