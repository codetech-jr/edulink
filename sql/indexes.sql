-- ==============================================================================
-- EDULINK: MIGRACIÓN DE ÍNDICES COMPUESTOS Y DE RENDIMIENTO (Postgres Best Practices)
-- ==============================================================================
-- Diseñado para optimizar consultas de alta concurrencia, filtros multitenant
-- y predicados de evaluación de Row Level Security (RLS).
-- ==============================================================================

-- 1. CALIFICACIONES Y EVALUACIONES (Grades & Evaluations)
-- Optimiza la carga del cuaderno de calificaciones y upsert masivo
CREATE INDEX IF NOT EXISTS idx_grades_evaluation_student 
  ON public.grades (evaluation_id, student_id);

CREATE INDEX IF NOT EXISTS idx_evaluations_subject_term 
  ON public.evaluations (subject_id, term_id);

CREATE INDEX IF NOT EXISTS idx_evaluations_school_subject 
  ON public.evaluations (school_id, subject_id);

-- 2. CONTROL FINANCIERO Y PAGOS (Payments & Billing)
-- Optimiza el dashboard administrativo (/admin/payments) y la conciliación bancaria
CREATE INDEX IF NOT EXISTS idx_payments_school_date_status 
  ON public.payments (school_id, transaction_date DESC, status);

CREATE INDEX IF NOT EXISTS idx_payments_school_created 
  ON public.payments (school_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payments_student 
  ON public.payments (student_id);

CREATE INDEX IF NOT EXISTS idx_payments_payer 
  ON public.payments (payer_id);

CREATE INDEX IF NOT EXISTS idx_billing_concepts_school_active 
  ON public.billing_concepts (school_id, is_active);

CREATE INDEX IF NOT EXISTS idx_exchange_rates_school_date 
  ON public.exchange_rates (school_id, rate_date DESC, created_at DESC);

-- 3. ALUMNADO Y RELACIÓN FAMILIAR (Students)
-- Optimiza las consultas del portal de representante y listados por curso
CREATE INDEX IF NOT EXISTS idx_students_school_course 
  ON public.students (school_id, course_id);

CREATE INDEX IF NOT EXISTS idx_students_parent_school 
  ON public.students (parent_id, school_id) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_students_course_active 
  ON public.students (course_id, is_active);

CREATE INDEX IF NOT EXISTS idx_students_school 
  ON public.students (school_id);

-- 4. CONTROL DE ASISTENCIA (Attendance)
-- Acelera el pase de lista y verificación de duplicados por fecha y asignatura
CREATE INDEX IF NOT EXISTS idx_attendance_student_date 
  ON public.attendance (student_id, attendance_date);

CREATE INDEX IF NOT EXISTS idx_attendance_subject_date 
  ON public.attendance (subject_id, attendance_date);

CREATE INDEX IF NOT EXISTS idx_attendance_school_date 
  ON public.attendance (school_id, attendance_date);

-- 5. ASIGNATURAS Y CURSOS (Subjects & Courses)
-- Optimiza filtros de asignación docente y navegación curricular
CREATE INDEX IF NOT EXISTS idx_subjects_school_teacher 
  ON public.subjects (school_id, teacher_id);

CREATE INDEX IF NOT EXISTS idx_subjects_teacher_school 
  ON public.subjects (teacher_id, school_id);

CREATE INDEX IF NOT EXISTS idx_subjects_course 
  ON public.subjects (course_id);

CREATE INDEX IF NOT EXISTS idx_courses_school_year 
  ON public.courses (school_id, school_year_id);

-- 6. COMUNICACIONES Y PERFILES (Communications & Profiles)
-- Optimiza el feed de avisos escolares y la resolución de roles en RLS
CREATE INDEX IF NOT EXISTS idx_communications_school_created 
  ON public.communications (school_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_school_role 
  ON public.profiles (school_id, role);
