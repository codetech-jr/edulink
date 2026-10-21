import React from 'react'
import { NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { BoletinTemplate, BoletinData, SubjectGradeRow } from '@/components/pdf/BoletinTemplate'
import { isAdminRole } from '@/lib/permissions'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{
    studentId: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { studentId } = await params
    const searchParams = request.nextUrl.searchParams
    const termIdParam = searchParams.get('termId')

    const supabase = await createClient()

    // 1. Validar autenticación de usuario
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'No autenticado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 2. Obtener perfil del usuario autenticado
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, role, school_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: 'Perfil de usuario no encontrado' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 3. Obtener datos del estudiante solicitado
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select(`
        id,
        full_name,
        cedula,
        list_number,
        course_id,
        school_id,
        parent_id,
        courses (
          id,
          name,
          grade_level,
          section
        )
      `)
      .eq('id', studentId)
      .single()

    if (studentError || !student) {
      return new Response(JSON.stringify({ error: 'Estudiante no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 4. Verificación Estricta de Autorización
    let isAuthorized = false

    // A) Admin o Coordinador del mismo colegio
    if (isAdminRole(profile.role) && profile.school_id === student.school_id) {
      isAuthorized = true
    }
    // B) El propio estudiante
    else if (student.id === user.id) {
      isAuthorized = true
    }
    // C) El representante legal asignado
    else if (student.parent_id === user.id) {
      isAuthorized = true
    }
    // D) Docente de alguna materia del curso del estudiante en el mismo colegio
    else if (profile.role === 'docente' && profile.school_id === student.school_id) {
      const { data: teacherSubjects } = await supabase
        .from('subjects')
        .select('id')
        .eq('course_id', student.course_id)
        .eq('teacher_id', user.id)
        .limit(1)

      if (teacherSubjects && teacherSubjects.length > 0) {
        isAuthorized = true
      }
    }

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ error: 'No está autorizado para consultar este boletín' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 5. Cargar datos institucionales y académicos en paralelo
    const [schoolRes, schoolYearRes, directorRes] = await Promise.all([
      supabase
        .from('schools')
        .select('id, name, rif')
        .eq('id', student.school_id)
        .single(),
      supabase
        .from('school_years')
        .select('id, name, is_active')
        .eq('school_id', student.school_id)
        .eq('is_active', true)
        .single(),
      supabase
        .from('profiles')
        .select('full_name')
        .eq('school_id', student.school_id)
        .eq('role', 'admin')
        .limit(1)
        .single(),
    ])

    const school = schoolRes.data || {
      name: 'Unidad Educativa',
      rif: 'J-00000000-0',
    }
    const schoolYear = schoolYearRes.data || {
      id: '',
      name: '2025–2026',
    }
    const directorName = directorRes.data?.full_name || 'Prof. Dirección General'

    // 6. Cargar Lapsos (Terms) del año escolar y Asignaturas del curso
    const [termsRes, subjectsRes] = await Promise.all([
      supabase
        .from('terms')
        .select('id, name, term_number')
        .eq('school_id', student.school_id)
        .order('term_number', { ascending: true }),
      supabase
        .from('subjects')
        .select(`
          id,
          name,
          teacher_id,
          profiles:teacher_id ( full_name )
        `)
        .eq('course_id', student.course_id)
        .order('name', { ascending: true }),
    ])

    const terms = termsRes.data || []
    const subjects = subjectsRes.data || []
    const subjectIds = subjects.map((s) => s.id)

    // 7. Cargar Evaluaciones y Calificaciones de las asignaturas
    let evaluations: any[] = [] /* TODO: tipado pendiente */
    let grades: any[] = [] /* TODO: tipado pendiente */

    if (subjectIds.length > 0) {
      const { data: evData } = await supabase
        .from('evaluations')
        .select('id, subject_id, term_id, name, weight, is_published')
        .in('subject_id', subjectIds)

      evaluations = evData || []
      const evaluationIds = evaluations.map((e) => e.id)

      if (evaluationIds.length > 0) {
        const { data: gradesData } = await supabase
          .from('grades')
          .select('id, evaluation_id, student_id, score, is_absent')
          .eq('student_id', student.id)
          .in('evaluation_id', evaluationIds)

        grades = gradesData || []
      }
    }

    // 8. Determinar los lapsos correspondientes (1, 2, 3)
    const term1 = terms.find((t) => t.term_number === 1) || terms[0]
    const term2 = terms.find((t) => t.term_number === 2) || terms[1]
    const term3 = terms.find((t) => t.term_number === 3) || terms[2]

    const selectedFilterTerm = termIdParam
      ? terms.find((t) => t.id === termIdParam)
      : null

    // 9. Calcular notas por asignatura y por lapso según normativa MPPE
    // Nota de Lapso = Σ(grade.score * evaluation.weight / 100)
    const subjectRows: SubjectGradeRow[] = subjects.map((sub: any /* TODO: tipado pendiente */) => {
      const calculateTermScore = (termId: string | undefined): number | null => {
        if (!termId) return null
        const termEvaluations = evaluations.filter(
          (e) => e.subject_id === sub.id && e.term_id === termId
        )
        if (termEvaluations.length === 0) return null

        let hasAnyGrade = false
        let weightedSum = 0

        for (const ev of termEvaluations) {
          const g = grades.find((gr) => gr.evaluation_id === ev.id)
          if (g) {
            hasAnyGrade = true
            const score = g.is_absent ? 1.0 : g.score !== null ? Number(g.score) : 1.0
            weightedSum += score * (Number(ev.weight || 0) / 100)
          }
        }

        if (!hasAnyGrade) return null
        // Limitar a escala venezolana 1 - 20 con 1 decimal
        return Math.min(20, Math.max(1, Math.round(weightedSum * 10) / 10))
      }

      const score1 = calculateTermScore(term1?.id)
      const score2 = calculateTermScore(term2?.id)
      const score3 = calculateTermScore(term3?.id)

      // Si se solicitó un lapso específico
      let finalScore: number | null = null
      if (selectedFilterTerm) {
        if (selectedFilterTerm.id === term1?.id) finalScore = score1
        else if (selectedFilterTerm.id === term2?.id) finalScore = score2
        else if (selectedFilterTerm.id === term3?.id) finalScore = score3
        else finalScore = calculateTermScore(selectedFilterTerm.id)
      } else {
        // Boletín anual: promedio de los lapsos con notas registradas
        const availableScores = [score1, score2, score3].filter(
          (s): s is number => s !== null
        )
        if (availableScores.length > 0) {
          const sum = availableScores.reduce((acc, curr) => acc + curr, 0)
          finalScore = Math.round((sum / availableScores.length) * 10) / 10
        }
      }

      let status: 'Aprobado' | 'Reprobado' | 'Pendiente' = 'Pendiente'
      if (finalScore !== null) {
        status = finalScore >= 10 ? 'Aprobado' : 'Reprobado'
      }

      return {
        subjectName: sub.name,
        term1Score: score1,
        term2Score: score2,
        term3Score: score3,
        finalScore,
        status,
      }
    })

    // 10. Calcular Promedio General y Condición Global
    const validFinalScores = subjectRows
      .map((r) => r.finalScore)
      .filter((s): s is number => s !== null)

    let overallAverage: number | null = null
    let overallStatus: 'Aprobado' | 'Reprobado' | 'Pendiente' = 'Pendiente'

    if (validFinalScores.length > 0) {
      const avgSum = validFinalScores.reduce((acc, curr) => acc + curr, 0)
      overallAverage = Math.round((avgSum / validFinalScores.length) * 100) / 100
      overallStatus = overallAverage >= 10 ? 'Aprobado' : 'Reprobado'
    }

    // Normalizar curso
    const courseData = Array.isArray(student.courses)
      ? student.courses[0]
      : student.courses

    const courseInfo = {
      name: courseData?.name || 'Educación Básica',
      gradeLevel: courseData?.grade_level || 1,
      section: courseData?.section || 'U',
    }

    // Título del boletín
    let termTitle = 'Boletín Anual de Calificaciones'
    if (selectedFilterTerm) {
      termTitle = `Boletín de Calificaciones — ${selectedFilterTerm.name}`
    }

    // Fecha de emisión en formato venezolano
    const issuedAt = new Intl.DateTimeFormat('es-VE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date())

    const boletinData: BoletinData = {
      school: {
        name: school.name,
        rif: school.rif,
      },
      student: {
        fullName: student.full_name,
        cedula: student.cedula || 'S/C',
        listNumber: student.list_number || 'S/N',
      },
      course: courseInfo,
      schoolYear: schoolYear.name,
      termTitle,
      directorName,
      teacherName: profile.role === 'docente' ? profile.full_name : undefined,
      subjects: subjectRows,
      overallAverage,
      overallStatus,
      issuedAt,
    }

    // 11. Generar Buffer del documento PDF con @react-pdf/renderer
    const pdfBuffer = await renderToBuffer(
      React.createElement(BoletinTemplate, { data: boletinData }) as any /* TODO: tipado pendiente */
    )

    // Formatear nombre de archivo seguro
    const sanitizedStudentName = student.full_name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toLowerCase()

    const filename = `boletin_${sanitizedStudentName}.pdf`

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error: any /* TODO: tipado pendiente */) {
    console.error('Error generando boletín PDF:', error)
    return new Response(
      JSON.stringify({ error: 'Error interno al generar el boletín escolar en PDF' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
