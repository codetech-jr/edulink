import { z } from 'zod'

/**
 * Esquema para crear un estudiante
 */
export const CreateStudentSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, 'El nombre completo debe tener al menos 2 caracteres')
    .max(150, 'El nombre completo no puede exceder 150 caracteres'),
  cedula: z
    .string()
    .trim()
    .min(4, 'La cédula debe tener al menos 4 caracteres')
    .max(20, 'La cédula no puede exceder 20 caracteres'),
  course_id: z.string().uuid('Debe seleccionar un curso válido'),
  birth_date: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val))
    .refine(
      (val) => {
        if (!val) return true
        if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false
        const date = new Date(val)
        if (isNaN(date.getTime())) return false
        const today = new Date()
        if (date > today) return false
        const age = today.getFullYear() - date.getFullYear()
        return age >= 2 && age <= 40
      },
      { message: 'La fecha de nacimiento debe ser válida y estar en un rango razonable escolar' }
    ),
  gender: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val))
    .refine((val) => !val || val === 'M' || val === 'F', {
      message: 'El sexo debe ser Masculino (M) o Femenino (F)',
    }),
  // Representante Legal / Tutor
  parent_id: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  relationship: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  // Datos para registrar un nuevo representante al vuelo
  new_parent_name: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  new_parent_cedula: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  new_parent_phone: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  new_parent_email: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  // Contacto secundario / Familiar en el exterior (Diáspora)
  secondary_guardian_name: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  secondary_guardian_phone: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  secondary_guardian_relationship: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
})

export type CreateStudentInput = z.infer<typeof CreateStudentSchema>

/**
 * Esquema para actualizar un estudiante
 */
export const UpdateStudentSchema = z.object({
  id: z.string().uuid('ID de estudiante no válido'),
  full_name: z
    .string()
    .trim()
    .min(2, 'El nombre completo debe tener al menos 2 caracteres')
    .max(150, 'El nombre completo no puede exceder 150 caracteres'),
  cedula: z
    .string()
    .trim()
    .min(4, 'La cédula debe tener al menos 4 caracteres')
    .max(20, 'La cédula no puede exceder 20 caracteres'),
  course_id: z.string().uuid('Debe seleccionar un curso válido'),
  birth_date: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val))
    .refine(
      (val) => {
        if (!val) return true
        if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false
        const date = new Date(val)
        if (isNaN(date.getTime())) return false
        const today = new Date()
        if (date > today) return false
        const age = today.getFullYear() - date.getFullYear()
        return age >= 2 && age <= 40
      },
      { message: 'La fecha de nacimiento debe ser válida y estar en un rango razonable escolar' }
    ),
  gender: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val))
    .refine((val) => !val || val === 'M' || val === 'F', {
      message: 'El sexo debe ser Masculino (M) o Femenino (F)',
    }),
  // Representante Legal / Tutor
  parent_id: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  relationship: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  new_parent_name: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  new_parent_cedula: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  new_parent_phone: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  new_parent_email: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  secondary_guardian_name: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  secondary_guardian_phone: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  secondary_guardian_relationship: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
})

export type UpdateStudentInput = z.infer<typeof UpdateStudentSchema>

/**
 * Esquema para eliminar un estudiante
 */
export const DeleteStudentSchema = z.object({
  id: z.string().uuid('ID de estudiante no válido'),
})

export type DeleteStudentInput = z.infer<typeof DeleteStudentSchema>
