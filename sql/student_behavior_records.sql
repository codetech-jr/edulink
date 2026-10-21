-- ==============================================================================
-- EDULINK: MÓDULO DE CONDUCTA, NOVEDADES Y SEGUIMIENTO DISCIPLINARIO
-- ==============================================================================
-- Tabla: student_behavior_records
-- Soporta:
--   - Méritos / Felicitaciones (merito)
--   - Observaciones pedagógicas (observacion)
--   - Faltas leves (falta_leve)
--   - Faltas graves (falta_grave)
--   - Confirmación / Firma digital de enterado por el representante
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.student_behavior_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  type TEXT NOT NULL CHECK (type IN ('merito', 'observacion', 'falta_leve', 'falta_grave')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  incident_date DATE NOT NULL DEFAULT CURRENT_DATE,
  requires_parent_signature BOOLEAN NOT NULL DEFAULT false,
  parent_acknowledged_at TIMESTAMPTZ,
  parent_acknowledged_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices de consulta y rendimiento
CREATE INDEX IF NOT EXISTS idx_behavior_records_student_date 
  ON public.student_behavior_records (student_id, incident_date DESC);

CREATE INDEX IF NOT EXISTS idx_behavior_records_school_created 
  ON public.student_behavior_records (school_id, created_at DESC);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION public.handle_behavior_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_behavior_updated_at ON public.student_behavior_records;
CREATE TRIGGER tr_behavior_updated_at
  BEFORE UPDATE ON public.student_behavior_records
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_behavior_updated_at();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.student_behavior_records ENABLE ROW LEVEL SECURITY;

-- 1. Políticas para Administradores y Coordinadores (Lectura y Escritura total en su colegio)
DROP POLICY IF EXISTS "Admins y coordinadores gestionan conducta de su colegio" ON public.student_behavior_records;
CREATE POLICY "Admins y coordinadores gestionan conducta de su colegio"
  ON public.student_behavior_records
  FOR ALL
  TO authenticated
  USING (
    school_id = (SELECT public.get_my_school_id())
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'coordinador')
    )
  )
  WITH CHECK (
    school_id = (SELECT public.get_my_school_id())
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'coordinador')
    )
  );

-- 2. Políticas para Docentes (Lectura y creación en su colegio)
DROP POLICY IF EXISTS "Docentes leen registros de conducta de su colegio" ON public.student_behavior_records;
CREATE POLICY "Docentes leen registros de conducta de su colegio"
  ON public.student_behavior_records
  FOR SELECT
  TO authenticated
  USING (
    school_id = (SELECT public.get_my_school_id())
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'docente'
    )
  );

DROP POLICY IF EXISTS "Docentes crean registros de conducta" ON public.student_behavior_records;
CREATE POLICY "Docentes crean registros de conducta"
  ON public.student_behavior_records
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND school_id = (SELECT public.get_my_school_id())
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'docente'
    )
  );

-- 3. Políticas para Representantes (Lectura de sus hijos y firma de enterado)
DROP POLICY IF EXISTS "Representantes leen novedades de sus representados" ON public.student_behavior_records;
CREATE POLICY "Representantes leen novedades de sus representados"
  ON public.student_behavior_records
  FOR SELECT
  TO authenticated
  USING (
    student_id IN (
      SELECT id FROM public.students
      WHERE parent_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Representantes firman enterado de novedades" ON public.student_behavior_records;
CREATE POLICY "Representantes firman enterado de novedades"
  ON public.student_behavior_records
  FOR UPDATE
  TO authenticated
  USING (
    student_id IN (
      SELECT id FROM public.students
      WHERE parent_id = auth.uid()
    )
  )
  WITH CHECK (
    parent_acknowledged_by = auth.uid()
    AND student_id IN (
      SELECT id FROM public.students
      WHERE parent_id = auth.uid()
    )
  );

-- 4. Políticas para Estudiantes (Lectura de sus propios registros)
DROP POLICY IF EXISTS "Estudiantes leen su propio seguimiento conductual" ON public.student_behavior_records;
CREATE POLICY "Estudiantes leen su propio seguimiento conductual"
  ON public.student_behavior_records
  FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid()
    OR student_id IN (
      SELECT id FROM public.students
      WHERE profile_id = auth.uid()
    )
  );

-- ==============================================================================
-- SEED DE DEMOSTRACIÓN (Para el estudiante Juan Alexander Peréz)
-- ==============================================================================
DO $$
DECLARE
  v_student RECORD;
  v_teacher_id UUID;
BEGIN
  -- Buscar estudiante activo
  SELECT id, school_id INTO v_student
  FROM public.students
  WHERE is_active = true
  LIMIT 1;

  -- Buscar un docente o admin para autoría
  SELECT id INTO v_teacher_id
  FROM public.profiles
  WHERE role IN ('docente', 'admin')
    AND (v_student.school_id IS NULL OR school_id = v_student.school_id)
  LIMIT 1;

  IF v_student.id IS NOT NULL AND v_teacher_id IS NOT NULL THEN
    -- 1. Mérito / Reconocimiento
    INSERT INTO public.student_behavior_records (
      school_id, student_id, created_by, type, title, description, incident_date, requires_parent_signature, parent_acknowledged_at, parent_acknowledged_by
    ) VALUES (
      v_student.school_id,
      v_student.id,
      v_teacher_id,
      'merito',
      'Reconocimiento por Liderazgo y Colaboración',
      'Demostró un compromiso ejemplar durante el trabajo en equipo de Ciencias, apoyando a sus compañeros y fomentando un clima de respeto y aprendizaje.',
      CURRENT_DATE - INTERVAL '2 days',
      false,
      NULL,
      NULL
    ) ON CONFLICT DO NOTHING;

    -- 2. Observación pedagógica
    INSERT INTO public.student_behavior_records (
      school_id, student_id, created_by, type, title, description, incident_date, requires_parent_signature, parent_acknowledged_at, parent_acknowledged_by
    ) VALUES (
      v_student.school_id,
      v_student.id,
      v_teacher_id,
      'observacion',
      'Seguimiento en entrega de actividades',
      'Se le recuerda reforzar la entrega puntual de la guía práctica asignada para el cierre del período evaluativo.',
      CURRENT_DATE - INTERVAL '5 days',
      true,
      NOW() - INTERVAL '4 days',
      v_teacher_id
    ) ON CONFLICT DO NOTHING;
  END IF;
END $$;
