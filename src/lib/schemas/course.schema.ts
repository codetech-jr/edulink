import { z } from 'zod'

/**
 * Esquema para crear un curso / sección
 */
export const CreateCourseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre del curso es obligatorio')
    .max(100, 'El nombre del curso no puede exceder 100 caracteres'),
  grade_level: z.coerce
    .number('El grado debe ser un número entero')
    .int('El grado debe ser un número entero')
    .min(1, 'El grado debe estar entre 1 y 6')
    .max(6, 'El grado debe estar entre 1 y 6'),
  section: z
    .string()
    .trim()
    .min(1, 'La sección es obligatoria')
    .max(5, 'La sección no puede exceder 5 caracteres')
    .transform((s) => s.toUpperCase()),
})

export type CreateCourseInput = z.infer<typeof CreateCourseSchema>

/**
 * Esquema para actualizar un curso / sección
 */
export const UpdateCourseSchema = z.object({
  id: z.string().uuid('ID de curso no válido'),
  name: z
    .string()
    .trim()
    .min(1, 'El nombre del curso es obligatorio')
    .max(100, 'El nombre del curso no puede exceder 100 caracteres'),
  grade_level: z.coerce
    .number('El grado debe ser un número entero')
    .int('El grado debe ser un número entero')
    .min(1, 'El grado debe estar entre 1 y 6')
    .max(6, 'El grado debe estar entre 1 y 6'),
  section: z
    .string()
    .trim()
    .min(1, 'La sección es obligatoria')
    .max(5, 'La sección no puede exceder 5 caracteres')
    .transform((s) => s.toUpperCase()),
})

export type UpdateCourseInput = z.infer<typeof UpdateCourseSchema>

/**
 * Esquema para eliminar un curso
 */
export const DeleteCourseSchema = z.object({
  id: z.string().uuid('ID de curso no válido'),
})

export type DeleteCourseInput = z.infer<typeof DeleteCourseSchema>
