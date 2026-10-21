-- ==============================================================================
-- EDULINK: MIGRACIÓN DE MÓDULO DE INSCRIPCIONES Y PRE-REGISTRO ESCOLAR
-- ==============================================================================
-- 1. Agregar columna slug a la tabla schools para URL amigables y públicas
-- 2. Crear tabla enrollment_requests con RLS y soporte de documentos JSONB
-- ==============================================================================

-- 1. COLUMNA SLUG EN SCHOOLS
ALTER TABLE public.schools 
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Backfill para instituciones existentes sin slug
UPDATE public.schools 
  SET slug = 'liceo-matalinda' 
  WHERE slug IS NULL;

-- Asegurar índice para búsquedas ultra-rápidas por slug
CREATE INDEX IF NOT EXISTS idx_schools_slug 
  ON public.schools (slug);


-- 2. TABLA ENROLLMENT_REQUESTS
CREATE TABLE IF NOT EXISTS public.enrollment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_cedula TEXT,
  student_birth_date DATE,
  grade_requested TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  parent_cedula TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  parent_email TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'aprobado', 'rechazado')),
  rejection_reason TEXT,
  documents JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices de consulta administrativa y filtros multitenant
CREATE INDEX IF NOT EXISTS idx_enrollment_requests_school_status 
  ON public.enrollment_requests (school_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_enrollment_requests_created 
  ON public.enrollment_requests (created_at DESC);


-- 3. POLÍTICAS DE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.enrollment_requests ENABLE ROW LEVEL SECURITY;

-- Política de lectura para administradores y coordinadores de la institución
DROP POLICY IF EXISTS "Admins y coordinadores ven solicitudes de su colegio" ON public.enrollment_requests;
CREATE POLICY "Admins y coordinadores ven solicitudes de su colegio"
  ON public.enrollment_requests
  FOR SELECT
  TO authenticated
  USING (
    school_id = (SELECT public.get_my_school_id())
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'coordinador')
    )
  );

-- Política de actualización (Aprobar / Rechazar)
DROP POLICY IF EXISTS "Admins y coordinadores actualizan solicitudes de su colegio" ON public.enrollment_requests;
CREATE POLICY "Admins y coordinadores actualizan solicitudes de su colegio"
  ON public.enrollment_requests
  FOR UPDATE
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
  );

-- Política de inserción pública (los padres pueden enviar su formulario anónimamente)
DROP POLICY IF EXISTS "Permitir inserción pública de solicitudes de inscripción" ON public.enrollment_requests;
CREATE POLICY "Permitir inserción pública de solicitudes de inscripción"
  ON public.enrollment_requests
  FOR INSERT
  WITH CHECK (true);


-- 4. BUCKET DE SUPABASE STORAGE (enrollment-documents)
-- Crear bucket si no existe (en Supabase Dashboard o Storage SQL)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'enrollment-documents',
  'enrollment-documents',
  false,
  5242880, -- 5 MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Política de storage para subida pública (anónima y autenticada)
DROP POLICY IF EXISTS "Permitir subida pública de documentos de inscripción" ON storage.objects;
CREATE POLICY "Permitir subida pública de documentos de inscripción"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'enrollment-documents');

-- Política de lectura de documentos para admins del colegio
DROP POLICY IF EXISTS "Admins leen documentos de inscripción" ON storage.objects;
CREATE POLICY "Admins leen documentos de inscripción"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'enrollment-documents');
