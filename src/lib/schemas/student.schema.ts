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
})

export type UpdateStudentInput = z.infer<typeof UpdateStudentSchema>

/**
 * Esquema para eliminar un estudiante
 */
export const DeleteStudentSchema = z.object({
  id: z.string().uuid('ID de estudiante no válido'),
})

export type DeleteStudentInput = z.infer<typeof DeleteStudentSchema>
