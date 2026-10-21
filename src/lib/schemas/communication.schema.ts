import { z } from 'zod'

/**
 * Esquema para crear un comunicado oficial escolar
 */
export const CreateAnnouncementSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'El título del comunicado debe tener al menos 3 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres'),
  category: z.enum(['urgente', 'informativo', 'recordatorio'], {
    message: 'La categoría seleccionada no es válida',
  }),
  body: z
    .string()
    .trim()
    .min(5, 'El cuerpo del comunicado debe tener al menos 5 caracteres')
    .max(5000, 'El cuerpo no puede exceder 5000 caracteres'),
  target_audience: z
    .string()
    .trim()
    .default('todos')
    .optional(),
})

export type CreateAnnouncementInput = z.infer<typeof CreateAnnouncementSchema>

export const ArchiveAnnouncementSchema = z.object({
  id: z.string().uuid('ID de comunicado no válido'),
})

export type ArchiveAnnouncementInput = z.infer<typeof ArchiveAnnouncementSchema>

export const RepublishAnnouncementSchema = z.object({
  id: z.string().uuid('ID de comunicado no válido'),
})

export type RepublishAnnouncementInput = z.infer<typeof RepublishAnnouncementSchema>

export const DeleteAnnouncementSchema = z.object({
  id: z.string().uuid('ID de comunicado no válido'),
})

export type DeleteAnnouncementInput = z.infer<typeof DeleteAnnouncementSchema>
