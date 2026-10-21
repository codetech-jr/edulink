-- ==============================================================================
-- EDULINK: MIGRACIÓN DE PLANTILLAS DE COMUNICADOS Y ARCHIVADO
-- ==============================================================================

-- 1. Modificar tabla communications para soporte de archivado y audiencia
ALTER TABLE public.communications 
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.communications 
  ADD COLUMN IF NOT EXISTS target_audience TEXT NOT NULL DEFAULT 'todos';

CREATE INDEX IF NOT EXISTS idx_communications_school_archived 
  ON public.communications (school_id, is_archived, created_at DESC);


-- 2. Crear tabla communication_templates
CREATE TABLE IF NOT EXISTS public.communication_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'informativo' CHECK (category IN ('urgente', 'informativo', 'recordatorio')),
  is_default BOOLEAN NOT NULL DEFAULT false,
  variables JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_communication_templates_school 
  ON public.communication_templates (school_id, is_default);


-- 3. Políticas RLS para communication_templates
ALTER TABLE public.communication_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios autenticados leen plantillas de su colegio" ON public.communication_templates;
CREATE POLICY "Usuarios autenticados leen plantillas de su colegio"
  ON public.communication_templates
  FOR SELECT
  TO authenticated
  USING (school_id = (SELECT public.get_my_school_id()));

DROP POLICY IF EXISTS "Admins y coordinadores gestionan plantillas de su colegio" ON public.communication_templates;
CREATE POLICY "Admins y coordinadores gestionan plantillas de su colegio"
  ON public.communication_templates
  FOR ALL
  TO authenticated
  USING (
    school_id = (SELECT public.get_my_school_id())
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'coordinador')
    )
  )
  WITH CHECK (
    school_id = (SELECT public.get_my_school_id())
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'coordinador')
    )
  );


-- 4. Seed de las 4 plantillas predefinidas para todas las escuelas registradas
INSERT INTO public.communication_templates (school_id, name, subject, category, body, is_default, variables)
SELECT 
  s.id,
  'Recordatorio de Pago',
  'Recordatorio de Pago de Mensualidad',
  'recordatorio',
  'Estimado/a {{representante_nombre}}, le informamos que {{alumno_nombre}} de {{grado}} presenta una mensualidad pendiente de ${{monto}}. Por favor regularizar antes del {{fecha_vencimiento}}. Gracias por su atención y puntual compromiso con {{colegio_nombre}}.',
  true,
  '["{{alumno_nombre}}", "{{grado}}", "{{monto}}", "{{fecha_vencimiento}}", "{{representante_nombre}}", "{{colegio_nombre}}"]'::jsonb
FROM public.schools s
ON CONFLICT DO NOTHING;

INSERT INTO public.communication_templates (school_id, name, subject, category, body, is_default, variables)
SELECT 
  s.id,
  'Bienvenida al Año Escolar',
  '¡Bienvenidos al Nuevo Año Escolar!',
  'informativo',
  'Estimada comunidad educativa y estimado/a {{representante_nombre}}, les damos la más cordial bienvenida al nuevo año escolar en {{colegio_nombre}}. Nos entusiasma recibir a {{alumno_nombre}} en {{grado}} para un período de grandes aprendizajes y valores compartidos. ¡Les deseamos el mayor de los éxitos!',
  true,
  '["{{alumno_nombre}}", "{{grado}}", "{{representante_nombre}}", "{{colegio_nombre}}"]'::jsonb
FROM public.schools s
ON CONFLICT DO NOTHING;

INSERT INTO public.communication_templates (school_id, name, subject, category, body, is_default, variables)
SELECT 
  s.id,
  'Aviso de Actividad/Evento',
  'Invitación a Actividad Especial Escolar',
  'informativo',
  'Estimado/a {{representante_nombre}}, le invitamos cordialmente a participar en nuestra próxima actividad institucional en las instalaciones de {{colegio_nombre}}. Los estudiantes de {{grado}}, incluyendo a {{alumno_nombre}}, tendrán una participación destacada. Agradecemos su valiosa asistencia y apoyo.',
  true,
  '["{{alumno_nombre}}", "{{grado}}", "{{representante_nombre}}", "{{colegio_nombre}}"]'::jsonb
FROM public.schools s
ON CONFLICT DO NOTHING;

INSERT INTO public.communication_templates (school_id, name, subject, category, body, is_default, variables)
SELECT 
  s.id,
  'Suspensión de Actividades',
  'Aviso Urgente: Suspensión Temporal de Actividades',
  'urgente',
  'Estimado/a {{representante_nombre}}, se le informa con carácter urgente que por motivos de mantenimiento e imprevistos de fuerza mayor en {{colegio_nombre}}, quedan suspendidas las actividades presenciales para {{grado}} y todo el alumnado hasta nuevo aviso. La reanudación será comunicada oportunamente por este medio.',
  true,
  '["{{alumno_nombre}}", "{{grado}}", "{{representante_nombre}}", "{{colegio_nombre}}"]'::jsonb
FROM public.schools s
ON CONFLICT DO NOTHING;
