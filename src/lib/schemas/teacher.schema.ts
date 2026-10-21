import { z } from 'zod'

/**
 * Registro individual de asistencia
 */
export const AttendanceRecordSchema = z.object({
  student_id: z.string().uuid('ID de estudiante no válido'),
  subject_id: z.string().uuid('ID de asignatura no válido'),
  status: z.enum(['presente', 'ausente', 'tarde', 'justificado'], {
    message: 'Estado de asistencia no válido',
  }),
  notes: z
    .string()
    .trim()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .nullish(),
})

export type AttendanceRecordInput = z.infer<typeof AttendanceRecordSchema>

/**
 * Pase de lista diario completo
 */
export const DailyAttendanceSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha no válido (debe ser AAAA-MM-DD)'),
  records: z
    .array(AttendanceRecordSchema)
    .min(1, 'No se recibieron registros de asistencia'),
})

export type DailyAttendanceInput = z.infer<typeof DailyAttendanceSchema>

/**
 * Item individual del plan de evaluación
 */
export const EvaluationPlanItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'El nombre de cada evaluación debe tener al menos 2 caracteres')
    .max(100, 'El nombre de la evaluación no puede exceder 100 caracteres'),
  weight: z.coerce
    .number('La ponderación debe ser un número válido')
    .min(1, 'La ponderación de cada evaluación debe ser de al menos 1%')
    .max(100, 'La ponderación no puede ser mayor a 100%'),
  evaluation_date: z
    .string()
    .trim()
    .nullish(),
})

export type EvaluationPlanItemInput = z.infer<typeof EvaluationPlanItemSchema>

/**
 * Plan de evaluación para una asignatura y lapso escolar
 */
export const EvaluationPlanSchema = z.object({
  subject_id: z.string().uuid('Asignatura no válida'),
  term_id: z.string().uuid('Lapso escolar no válido'),
  evaluations: z
    .array(EvaluationPlanItemSchema)
    .min(1, 'Debe ingresar al menos una evaluación')
    .refine(
      (items) => {
        const sum = items.reduce((acc, ev) => acc + Number(ev.weight), 0)
        return Math.round(sum) === 100
      },
      {
        message: 'La sumatoria de ponderaciones debe ser exactamente 100%',
        path: ['evaluations'],
      }
    ),
})

export type EvaluationPlanInput = z.infer<typeof EvaluationPlanSchema>

/**
 * Registro individual de calificación (escala venezolana 1-20)
 */
export const GradeRecordSchema = z
  .object({
    student_id: z.string().uuid('ID de estudiante no válido'),
    evaluation_id: z.string().uuid('ID de evaluación no válido'),
    is_absent: z.coerce.boolean(),
    score: z.coerce
      .number('La calificación debe ser un número')
      .min(1, 'La calificación mínima es 1 (escala venezolana 1-20)')
      .max(20, 'La calificación máxima es 20 (escala venezolana 1-20)')
      .nullish(),
    notes: z
      .string()
      .trim()
      .max(500, 'Las notas no pueden exceder 500 caracteres')
      .nullish(),
  })
  .refine(
    (item) => {
      if (!item.is_absent && (item.score === null || item.score === undefined)) {
        return false
      }
      return true
    },
    {
      message: 'Debe ingresar una calificación válida o marcar al estudiante como inasistente',
      path: ['score'],
    }
  )

export type GradeRecordInput = z.infer<typeof GradeRecordSchema>

/**
 * Envío masivo de calificaciones
 */
export const SaveGradesSchema = z.object({
  grades: z
    .array(GradeRecordSchema)
    .min(1, 'No se recibieron calificaciones para guardar'),
})

export type SaveGradesInput = z.infer<typeof SaveGradesSchema>

/**
 * Publicación de notas del lapso
 */
export const PublishGradesSchema = z.object({
  subject_id: z.string().uuid('Asignatura no válida'),
  term_id: z.string().uuid('Lapso escolar no válido'),
  publish: z.coerce.boolean(),
})

export type PublishGradesInput = z.infer<typeof PublishGradesSchema>

/**
 * Restablecimiento del plan de evaluación
 */
export const ResetEvaluationPlanSchema = z.object({
  subject_id: z.string().uuid('Asignatura no válida'),
  term_id: z.string().uuid('Lapso escolar no válido'),
})

export type ResetEvaluationPlanInput = z.infer<typeof ResetEvaluationPlanSchema>
