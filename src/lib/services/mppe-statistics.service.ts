import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import {
  AgeGenderCount,
  CourseStatisticRow,
  InstitutionalSummary,
  MppeStatisticsReport,
} from '@/lib/types/mppe-statistics'

const SPANISH_MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

const STANDARD_AGES = [11, 12, 13, 14, 15, 16, 17, 18, 19]

/**
 * Calcula con precisión la edad cronológica cumplida a una fecha de corte específica.
 * Utiliza descomposición directa YYYY-MM-DD para evitar desfases de huso horario UTC.
 */
export function calculateAgeAtDate(birthDateStr: string, cutOffDateStr: string): number {
  const [bYear, bMonth, bDay] = birthDateStr.split('-').map(Number)
  const [cYear, cMonth, cDay] = cutOffDateStr.split('-').map(Number)

  let age = cYear - bYear
  if (cMonth < bMonth || (cMonth === bMonth && cDay < bDay)) {
    age--
  }
  return age
}

/**
 * Devuelve el último día del mes para una fecha o mes específico.
 */
export function getLastDayOfMonth(year: number, month1Indexed: number): string {
  // El día 0 del mes siguiente da el último día del mes deseado
  const lastDate = new Date(Date.UTC(year, month1Indexed, 0))
  const day = String(lastDate.getUTCDate()).padStart(2, '0')
  const month = String(month1Indexed).padStart(2, '0')
  return `${year}-${month}-${day}`
}

interface GetMppeStatisticsParams {
  schoolId: string
  month?: number // 1..12 (por defecto mes actual)
  year?: number // e.g. 2026 (por defecto año actual)
  cutOffDate?: string // YYYY-MM-DD (anula month/year si se pasa directamente)
}

export async function getMppeAgeStatistics({
  schoolId,
  month,
  year,
  cutOffDate,
}: GetMppeStatisticsParams): Promise<MppeStatisticsReport> {
  let supabase: any
  try {
    supabase = createAdminClient()
  } catch {
    supabase = await createClient()
  }

  const today = new Date()
  const targetYear = year ?? today.getFullYear()
  const targetMonth = month ?? today.getMonth() + 1
  const effectiveCutOffDate = cutOffDate ?? getLastDayOfMonth(targetYear, targetMonth)

  // 1. Obtener datos de la institución educativa
  const { data: school } = await supabase
    .from('schools')
    .select('id, name, rif, state, municipality, address')
    .eq('id', schoolId)
    .maybeSingle()

  const schoolData = school ?? {
    id: schoolId,
    name: 'Institución Educativa',
    rif: '',
    state: null,
    municipality: null,
    address: null,
  }

  // 2. Obtener año escolar activo (o el más reciente)
  const { data: activeYear } = await supabase
    .from('school_years')
    .select('id, name')
    .eq('school_id', schoolId)
    .eq('is_active', true)
    .maybeSingle()
    .maybeSingle()

  const schoolYearData = activeYear ?? {
    id: 'default',
    name: `${targetYear} - ${targetYear + 1}`,
  }

  // 3. Obtener todos los cursos de la institución
  const { data: courses, error: coursesError } = await supabase
    .from('courses')
    .select('id, name, grade_level, section, shift')
    .eq('school_id', schoolId)
    .order('grade_level', { ascending: true })
    .order('section', { ascending: true })

  if (coursesError) {
    console.error('Error obteniendo cursos:', coursesError)
    throw new Error('Error al cargar cursos para las estadísticas')
  }

  // 4. Obtener todos los estudiantes activos
  const { data: students, error: studentsError } = await supabase
    .from('students')
    .select('id, full_name, course_id, birth_date, gender, is_active')
    .eq('school_id', schoolId)
    .eq('is_active', true)

  if (studentsError) {
    console.error('Error obteniendo estudiantes:', studentsError)
    throw new Error('Error al cargar la matrícula estudiantil')
  }

  const studentList = students ?? []
  const courseList = courses ?? []

  // Inicializar detectores de edades fuera del rango estándar (11-19)
  let hasUnder11 = false
  let hasOver19 = false

  // Mapeo de estudiantes por curso
  const studentsByCourse: Record<string, typeof studentList> = {}
  for (const c of courseList) {
    studentsByCourse[c.id] = []
  }

  for (const s of studentList) {
    if (s.course_id && studentsByCourse[s.course_id]) {
      studentsByCourse[s.course_id].push(s)
    }
  }

  // 5. Construir las filas estadísticas para cada curso
  const rows: CourseStatisticRow[] = []

  // Inicializar acumuladores institucionales
  const institutionalByAge: Record<string, AgeGenderCount> = {}
  const allPossibleAges = ['<11', ...STANDARD_AGES.map(String), '>19']
  for (const ageKey of allPossibleAges) {
    institutionalByAge[ageKey] = {
      age: ageKey,
      varones: 0,
      hembras: 0,
      total: 0,
    }
  }

  let totalInstVarones = 0
  let totalInstHembras = 0
  let totalInstStudents = 0
  let totalInstIncomplete = 0

  for (const course of courseList) {
    const courseStudents = studentsByCourse[course.id] || []

    const byAge: Record<string, AgeGenderCount> = {}
    for (const ageKey of allPossibleAges) {
      byAge[ageKey] = {
        age: ageKey,
        varones: 0,
        hembras: 0,
        total: 0,
      }
    }

    let courseVarones = 0
    let courseHembras = 0
    let courseIncomplete = 0

    for (const student of courseStudents) {
      const { birth_date, gender } = student

      if (!birth_date || !gender) {
        courseIncomplete++
        continue
      }

      const age = calculateAgeAtDate(birth_date, effectiveCutOffDate)
      const isMale = gender === 'M' || gender === 'V'
      const isFemale = gender === 'F' || gender === 'H'

      if (isMale) courseVarones++
      if (isFemale) courseHembras++

      let ageKey: string
      if (age < 11) {
        ageKey = '<11'
        hasUnder11 = true
      } else if (age > 19) {
        ageKey = '>19'
        hasOver19 = true
      } else {
        ageKey = String(age)
      }

      if (byAge[ageKey]) {
        if (isMale) byAge[ageKey].varones++
        if (isFemale) byAge[ageKey].hembras++
        byAge[ageKey].total++
      }

      // Sumar al acumulador institucional
      if (institutionalByAge[ageKey]) {
        if (isMale) institutionalByAge[ageKey].varones++
        if (isFemale) institutionalByAge[ageKey].hembras++
        institutionalByAge[ageKey].total++
      }
    }

    const courseTotal = courseVarones + courseHembras

    totalInstVarones += courseVarones
    totalInstHembras += courseHembras
    totalInstStudents += courseTotal
    totalInstIncomplete += courseIncomplete

    // Nombre legible del curso (ej: "1RO A", "2DO B")
    const formattedGrade = course.grade_level
      ? `${course.grade_level}° "${course.section || 'A'}"`
      : `${course.name} "${course.section || ''}"`

    rows.push({
      courseId: course.id,
      courseName: formattedGrade,
      gradeLevel: course.grade_level,
      section: course.section,
      shift: course.shift,
      byAge,
      totalVarones: courseVarones,
      totalHembras: courseHembras,
      totalStudents: courseTotal,
      incompleteDataCount: courseIncomplete,
    })
  }

  // 6. Calcular porcentajes generales
  const pctVarones = totalInstStudents > 0 ? (totalInstVarones / totalInstStudents) * 100 : 0
  const pctHembras = totalInstStudents > 0 ? (totalInstHembras / totalInstStudents) * 100 : 0

  const summary: InstitutionalSummary = {
    byAge: institutionalByAge,
    totalVarones: totalInstVarones,
    totalHembras: totalInstHembras,
    totalStudents: totalInstStudents,
    percentVarones: Number(pctVarones.toFixed(1)),
    percentHembras: Number(pctHembras.toFixed(1)),
    percentTotal: totalInstStudents > 0 ? 100 : 0,
    incompleteDataTotal: totalInstIncomplete,
  }

  const monthIdx = targetMonth - 1
  const monthName = SPANISH_MONTHS[monthIdx] || `Mes ${targetMonth}`

  return {
    school: {
      id: schoolData.id,
      name: schoolData.name,
      rif: schoolData.rif || '',
      state: schoolData.state,
      municipality: schoolData.municipality,
      address: schoolData.address,
    },
    schoolYear: {
      id: schoolYearData.id,
      name: schoolYearData.name,
    },
    cutOffDate: effectiveCutOffDate,
    monthNumber: targetMonth,
    monthName,
    standardAges: STANDARD_AGES,
    hasUnder11,
    hasOver19,
    rows,
    summary,
    generatedAt: new Date().toISOString(),
  }
}
