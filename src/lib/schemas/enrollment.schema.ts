import { z } from 'zod'

/**
 * Esquema de validación para la creación de solicitudes de inscripción (formulario público)
 */
export const CreateEnrollmentRequestSchema = z.object({
  school_slug: z
    .string()
    .trim()
    .min(1, 'El identificador del colegio es requerido'),
  student_name: z
    .string()
    .trim()
    .min(3, 'Ingresa el nombre completo del alumno')
    .max(120, 'El nombre no puede exceder 120 caracteres'),
  student_cedula: z
    .string()
    .trim()
    .max(25, 'La cédula no puede exceder 25 caracteres')
    .optional()
    .or(z.literal('')),
  student_birth_date: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
  grade_requested: z
    .string()
    .trim()
    .min(1, 'Selecciona el grado o año solicitado'),
  parent_name: z
    .string()
    .trim()
    .min(3, 'Ingresa el nombre del representante')
    .max(120, 'El nombre del representante no puede exceder 120 caracteres'),
  parent_cedula: z
    .string()
    .trim()
    .min(5, 'Ingresa la cédula del representante')
    .max(25, 'La cédula no puede exceder 25 caracteres'),
  parent_phone: z
    .string()
    .trim()
    .regex(/^04\d{9}$/, 'Formato: 04XXXXXXXXX sin guiones (ej: 04121234567)'),
  parent_email: z
    .string()
    .trim()
    .email('Ingresa un correo electrónico válido')
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .trim()
    .max(1000, 'Las notas no pueden exceder 1000 caracteres')
    .optional()
    .or(z.literal('')),
})

export type CreateEnrollmentRequestInput = z.infer<typeof CreateEnrollmentRequestSchema>

/**
 * Esquema para aprobación administrativa de solicitud
 */
export const ApproveEnrollmentSchema = z.object({
  request_id: z.string().uuid('ID de solicitud no válido'),
  course_id: z.string().uuid('ID de curso no válido').optional().or(z.literal('')),
})

export type ApproveEnrollmentInput = z.infer<typeof ApproveEnrollmentSchema>

/**
 * Esquema para rechazo administrativo de solicitud
 */
export const RejectEnrollmentSchema = z.object({
  request_id: z.string().uuid('ID de solicitud no válido'),
  rejection_reason: z
    .string()
    .trim()
    .min(5, 'El motivo de rechazo debe tener al menos 5 caracteres')
    .max(500, 'El motivo de rechazo no puede exceder 500 caracteres'),
})

export type RejectEnrollmentInput = z.infer<typeof RejectEnrollmentSchema>
