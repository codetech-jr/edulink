export interface PredefinedTemplate {
  id: string
  name: string
  subject: string
  category: 'urgente' | 'informativo' | 'recordatorio'
  body: string
  variables: string[]
  description: string
}

export const PREDEFINED_TEMPLATES: PredefinedTemplate[] = [
  {
    id: 'recordatorio_pago',
    name: 'Recordatorio de Pago',
    subject: 'Recordatorio de Pago de Mensualidad',
    category: 'recordatorio',
    body: 'Estimado/a {{representante_nombre}}, le informamos que {{alumno_nombre}} de {{grado}} presenta una mensualidad pendiente de ${{monto}}. Por favor regularizar antes del {{fecha_vencimiento}}. Gracias por su atención y puntual compromiso con {{colegio_nombre}}.',
    variables: [
      '{{alumno_nombre}}',
      '{{grado}}',
      '{{monto}}',
      '{{fecha_vencimiento}}',
      '{{representante_nombre}}',
      '{{colegio_nombre}}',
    ],
    description: 'Notificación de aranceles y mensualidades escolares por vencer o adeudadas.',
  },
  {
    id: 'bienvenida_ano',
    name: 'Bienvenida al Año Escolar',
    subject: '¡Bienvenidos al Nuevo Año Escolar!',
    category: 'informativo',
    body: 'Estimada comunidad educativa y estimado/a {{representante_nombre}}, les damos la más cordial bienvenida al nuevo año escolar en {{colegio_nombre}}. Nos entusiasma recibir a {{alumno_nombre}} en {{grado}} para un período de grandes aprendizajes y valores compartidos. ¡Les deseamos el mayor de los éxitos!',
    variables: [
      '{{alumno_nombre}}',
      '{{grado}}',
      '{{representante_nombre}}',
      '{{colegio_nombre}}',
    ],
    description: 'Mensaje de saludo inicial para estudiantes y familias al inicio del período lectivo.',
  },
  {
    id: 'aviso_actividad',
    name: 'Aviso de Actividad/Evento',
    subject: 'Invitación a Actividad Especial Escolar',
    category: 'informativo',
    body: 'Estimado/a {{representante_nombre}}, le invitamos cordialmente a participar en nuestra próxima actividad institucional en las instalaciones de {{colegio_nombre}}. Los estudiantes de {{grado}}, incluyendo a {{alumno_nombre}}, tendrán una participación destacada. Agradecemos su valiosa asistencia y apoyo.',
    variables: [
      '{{alumno_nombre}}',
      '{{grado}}',
      '{{representante_nombre}}',
      '{{colegio_nombre}}',
    ],
    description: 'Convocatorias a festivales, actos cívicos, encuentros deportivos y ferias de ciencias.',
  },
  {
    id: 'suspension_actividades',
    name: 'Suspensión de Actividades',
    subject: 'Aviso Urgente: Suspensión Temporal de Actividades',
    category: 'urgente',
    body: 'Estimado/a {{representante_nombre}}, se le informa con carácter urgente que por motivos de mantenimiento e imprevistos de fuerza mayor en {{colegio_nombre}}, quedan suspendidas las actividades presenciales para {{grado}} y todo el alumnado hasta nuevo aviso. La reanudación será comunicada oportunamente por este medio.',
    variables: [
      '{{alumno_nombre}}',
      '{{grado}}',
      '{{representante_nombre}}',
      '{{colegio_nombre}}',
    ],
    description: 'Comunicados prioritarios de contingencia, mantenimiento o alertas climáticas.',
  },
]

export const AVAILABLE_VARIABLES = [
  { tag: '{{alumno_nombre}}', label: 'Nombre Alumno', sample: 'Sofía Mendoza' },
  { tag: '{{grado}}', label: 'Grado / Año', sample: '4to Grado "A"' },
  { tag: '{{monto}}', label: 'Monto USD', sample: '45.00' },
  { tag: '{{fecha_vencimiento}}', label: 'Vencimiento', sample: '15 de este mes' },
  { tag: '{{representante_nombre}}', label: 'Representante', sample: 'Carlos Mendoza' },
  { tag: '{{colegio_nombre}}', label: 'Colegio', sample: 'Liceo Matalinda' },
]

/**
 * Reemplaza los placeholders {{variable}} con un mapa de valores o datos de ejemplo.
 */
export function substituteVariables(
  text: string,
  values: Record<string, string | number> = {}
): string {
  let result = text
  for (const [key, val] of Object.entries(values)) {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, String(val))
  }
  return result
}

/**
 * Reemplaza variables con datos de ejemplo para preview en vivo.
 */
export function substituteWithSampleData(
  text: string,
  overrides: Partial<Record<string, string>> = {}
): string {
  const sampleMap: Record<string, string> = {
    alumno_nombre: overrides.alumno_nombre || 'Sofía Mendoza',
    grado: overrides.grado || '4to Grado "A"',
    monto: overrides.monto || '45.00',
    fecha_vencimiento: overrides.fecha_vencimiento || '15 de este mes',
    representante_nombre: overrides.representante_nombre || 'Carlos Mendoza',
    colegio_nombre: overrides.colegio_nombre || 'Liceo Matalinda',
  }
  return substituteVariables(text, sampleMap)
}
