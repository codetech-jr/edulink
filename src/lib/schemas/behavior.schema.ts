import { z } from 'zod'

export const behaviorTypeEnum = z.enum(['merito', 'observacion', 'falta_leve', 'falta_grave'])
export type BehaviorType = z.infer<typeof behaviorTypeEnum>

export const createBehaviorRecordSchema = z.object({
  student_id: z.string().uuid({ message: 'Identificador de estudiante inválido' }),
  type: behaviorTypeEnum,
  title: z
    .string()
    .min(3, { message: 'El título debe tener al menos 3 caracteres' })
    .max(100, { message: 'El título no puede exceder 100 caracteres' }),
  description: z
    .string()
    .min(5, { message: 'La descripción debe tener al menos 5 caracteres' })
    .max(1000, { message: 'La descripción no puede exceder 1000 caracteres' }),
  incident_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha debe tener formato AAAA-MM-DD' }),
  requires_parent_signature: z.boolean().default(false),
})

export type CreateBehaviorRecordInput = z.infer<typeof createBehaviorRecordSchema>

export const acknowledgeBehaviorRecordSchema = z.object({
  record_id: z.string().uuid({ message: 'Identificador de registro inválido' }),
})

export type AcknowledgeBehaviorRecordInput = z.infer<typeof acknowledgeBehaviorRecordSchema>
