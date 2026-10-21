import { z } from 'zod'

/**
 * Esquema para registrar un pago manualmente (Admin / Coordinador)
 */
export const CreatePaymentSchema = z.object({
  student_id: z.string().uuid('El estudiante seleccionado no es válido'),
  billing_concept_id: z.string().uuid('El concepto de facturación no es válido'),
  payment_method: z.enum(['pago_movil', 'zelle', 'efectivo', 'transferencia'], {
    message: 'Método de pago no válido',
  }),
  amount_usd: z.coerce
    .number('El monto debe ser un número válido')
    .positive('El monto debe ser mayor a cero')
    .max(999999, 'El monto excede el límite máximo permitido'),
  reference_number: z
    .string()
    .trim()
    .max(100, 'El número de referencia no puede exceder 100 caracteres')
    .nullish(),
  status: z.enum(['pendiente', 'confirmado'], {
    message: 'Estado inicial no válido',
  }),
})

export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>

/**
 * Esquema para aprobar un pago
 */
export const ApprovePaymentSchema = z.object({
  payment_id: z.string().uuid('ID de pago no válido'),
})

export type ApprovePaymentInput = z.infer<typeof ApprovePaymentSchema>

/**
 * Esquema para rechazar un pago
 */
export const RejectPaymentSchema = z.object({
  payment_id: z.string().uuid('ID de pago no válido'),
  reason: z
    .string()
    .trim()
    .min(1, 'El motivo de rechazo es obligatorio')
    .max(500, 'El motivo no puede exceder 500 caracteres'),
})

export type RejectPaymentInput = z.infer<typeof RejectPaymentSchema>

/**
 * Esquema para actualizar la tasa oficial BCV
 */
export const UpdateExchangeRateSchema = z.object({
  rate: z.coerce
    .number('La tasa debe ser un número válido')
    .min(1, 'La tasa de cambio debe ser de al menos 1 Bs/USD')
    .max(9999999, 'La tasa de cambio excede el rango permitido'),
})

export type UpdateExchangeRateInput = z.infer<typeof UpdateExchangeRateSchema>

/**
 * Esquema para reportar pago desde el portal del representante
 */
export const ReportPaymentSchema = z.object({
  student_id: z.string().uuid('El estudiante seleccionado no es válido'),
  billing_concept_id: z.string().uuid('El concepto de facturación no es válido'),
  payment_method: z.enum(['pago_movil', 'zelle', 'efectivo', 'transferencia'], {
    message: 'Método de pago no válido',
  }),
  amount_usd: z.coerce
    .number('El monto debe ser un número válido')
    .positive('El monto debe ser mayor a cero')
    .max(999999, 'El monto excede el límite máximo permitido'),
  reference_number: z
    .string()
    .trim()
    .min(1, 'El número de referencia es obligatorio')
    .max(100, 'El número de referencia no puede exceder 100 caracteres'),
})

export type ReportPaymentInput = z.infer<typeof ReportPaymentSchema>
