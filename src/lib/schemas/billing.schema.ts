import { z } from 'zod'

/**
 * Esquema para crear un concepto de facturación / arancel (Admin / Coordinador)
 */
export const CreateBillingConceptSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre del arancel es obligatorio')
    .max(150, 'El nombre no puede exceder 150 caracteres'),
  amount_usd: z.coerce
    .number('El monto debe ser un número válido')
    .positive('El monto debe ser mayor a cero')
    .max(999999, 'El monto excede el límite permitido'),
  due_date: z
    .string()
    .trim()
    .nullish(),
})

export type CreateBillingConceptInput = z.infer<typeof CreateBillingConceptSchema>
