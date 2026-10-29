-- ==============================================================================
-- EDULINK: ÍNDICES Y OPTIMIZACIONES PARA CUADRO ESTADÍSTICO MPPE
-- ==============================================================================
-- Optimiza la consulta y agregación por cohortes de edad, género y curso
-- para instituciones educativas venezolanas según requerimiento del MPPE.
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_students_mppe_stats 
  ON public.students (school_id, is_active, course_id, gender, birth_date);

CREATE INDEX IF NOT EXISTS idx_students_birth_gender 
  ON public.students (school_id, birth_date, gender) 
  WHERE is_active = true;
