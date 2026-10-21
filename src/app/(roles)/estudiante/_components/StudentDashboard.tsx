'use client'

import { useState } from 'react'
import { logoutAction } from '@/actions/auth-actions'
import { PrintPlanButton } from '@/components/PrintPlanButton'
import { LogOut, BookOpen, Megaphone } from 'lucide-react'
import { StudentAttendanceWeek } from './StudentAttendanceWeek'
import { StudentScheduleCard } from './StudentScheduleCard'
import { StudentGradesCard } from './StudentGradesCard'
import { StudentCommunicationsList } from './StudentCommunicationsList'
import { StudentProfileCard } from './StudentProfileCard'

interface StudentDashboardProps {
  // TODO: tipado pendiente
  student: any
  // TODO: tipado pendiente
  school: any
  // TODO: tipado pendiente
  subjects: any[]
  // TODO: tipado pendiente
  evaluations: any[]
  // TODO: tipado pendiente
  grades: any[]
  // TODO: tipado pendiente
  attendance: any[]
  // TODO: tipado pendiente
  terms: any[]
  // TODO: tipado pendiente
  communications?: any[]
}

type TabKey = 'academico' | 'comunicados'

export function StudentDashboard({
  student,
  school,
  subjects,
  evaluations,
  grades,
  attendance,
  terms,
  communications,
}: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('academico')
  const [printSubjectId, setPrintSubjectId] = useState<string | null>(null)

  const course = student.courses

  // Organizar calificaciones por Lapso y Materia
  const gradesByTerm: Record<string, Record<string, { grades: any[]; average: number | null; teacherName: string }>> = {} /* TODO: tipado pendiente */

  terms.forEach((term) => {
    gradesByTerm[term.name] = {}
    subjects.forEach((sub) => {
      gradesByTerm[term.name][sub.name] = {
        grades: [],
        average: null,
        teacherName: sub.profiles?.full_name || 'Docente de la Asignatura',
      }
    })
  })

  evaluations.forEach((ev) => {
    const term = terms.find((t) => t.id === ev.term_id)
    const subject = subjects.find((s) => s.id === ev.subject_id)
    if (!term || !subject) return

    const termName = term.name
    const subjectName = subject.name

    const gradeRecord = grades.find((g) => g.evaluation_id === ev.id)
    const scoreVal =
      gradeRecord?.score !== undefined && gradeRecord?.score !== null
        ? Number(gradeRecord.score)
        : null

    const showGrade = ev.is_published

    gradesByTerm[termName][subjectName].grades.push({
      id: ev.id,
      name: ev.name,
      weight: Number(ev.weight),
      evaluation_date: ev.evaluation_date,
      score: showGrade ? scoreVal : null,
      is_absent: showGrade ? !!gradeRecord?.is_absent : false,
      notes: showGrade ? gradeRecord?.notes : null,
      is_published: ev.is_published,
    })
  })

  // Calcular Promedios
  const activeTermAverages: number[] = []

  Object.keys(gradesByTerm).forEach((termName) => {
    Object.keys(gradesByTerm[termName]).forEach((subjectName) => {
      const subObj = gradesByTerm[termName][subjectName]
      let weightedSum = 0
      let totalWeight = 0

      subObj.grades.forEach((item) => {
        if (!item.is_published) return

        if (item.is_absent) {
          weightedSum += 1.0 * (item.weight / 100)
          totalWeight += item.weight
        } else if (item.score !== null) {
          weightedSum += item.score * (item.weight / 100)
          totalWeight += item.weight
        }
      })

      const average = totalWeight > 0 ? weightedSum / (totalWeight / 100) : null
      subObj.average = average

      if (average !== null) {
        activeTermAverages.push(average)
      }
    })
  })

  const overallAverage =
    activeTermAverages.length > 0
      ? activeTermAverages.reduce((sum, val) => sum + val, 0) / activeTermAverages.length
      : null

  const totalAttendance = attendance.length
  const presentsAttendance = attendance.filter(
    (a) => a.status === 'presente' || a.status === 'tarde' || a.status === 'justificado'
  ).length
  const attendancePercent =
    totalAttendance > 0 ? Math.round((presentsAttendance / totalAttendance) * 100) : 100

  return (
    <main className="flex min-h-screen flex-col bg-zinc-50 pb-12 font-sans selection:bg-indigo-100">
      {/* Navbar Superior Fijo con Blur */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 bg-white/80 backdrop-blur-md px-5 py-3.5 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs tracking-tight shadow-sm shadow-indigo-200">
            E
          </div>
          <span className="font-semibold text-zinc-900 tracking-tight text-sm">EduLink</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-zinc-500">
            {student.full_name.split(' ')[0]}
          </span>
          <div className="h-4 w-px bg-zinc-200" />
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 rounded-lg transition-all text-[11px] font-medium cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          </form>
        </div>
      </header>

      {/* Contenedor Principal */}
      <div className="mx-auto w-full max-w-md lg:max-w-7xl lg:px-8 px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Columna Lateral */}
          <div className="lg:col-span-4 space-y-6 print:hidden">
            <StudentProfileCard
              fullName={student.full_name}
              course={course}
              overallAverage={overallAverage}
              attendancePercent={attendancePercent}
            />

            {/* Tab Navigation */}
            <nav
              className="bg-zinc-100/80 rounded-full lg:rounded-2xl p-1 lg:p-1.5 border border-zinc-200/60 shadow-sm flex lg:flex-col gap-1"
              role="tablist"
            >
              <button
                role="tab"
                aria-selected={activeTab === 'academico'}
                onClick={() => setActiveTab('academico')}
                className={`flex-1 lg:flex-initial flex items-center justify-center lg:justify-start gap-2.5 py-2 lg:py-2.5 px-3 lg:px-4 rounded-full lg:rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                  activeTab === 'academico'
                    ? 'bg-white text-zinc-800 shadow-sm border border-zinc-200/50'
                    : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50/50'
                }`}
              >
                <BookOpen
                  className={`w-4 h-4 ${
                    activeTab === 'academico' ? 'text-indigo-600' : 'text-zinc-400'
                  }`}
                />
                <span>Académico</span>
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'comunicados'}
                onClick={() => setActiveTab('comunicados')}
                className={`flex-1 lg:flex-initial flex items-center justify-center lg:justify-start gap-2.5 py-2 lg:py-2.5 px-3 lg:px-4 rounded-full lg:rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                  activeTab === 'comunicados'
                    ? 'bg-white text-zinc-800 shadow-sm border border-zinc-200/50'
                    : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50/50'
                }`}
              >
                <Megaphone
                  className={`w-4 h-4 ${
                    activeTab === 'comunicados' ? 'text-indigo-600' : 'text-zinc-400'
                  }`}
                />
                <span>Comunicados</span>
              </button>
            </nav>
          </div>

          {/* Columna Principal */}
          <div className="lg:col-span-8 animate-in fade-in duration-200 print:w-full">
            {activeTab === 'academico' ? (
              <div className="space-y-6">
                <StudentAttendanceWeek
                  attendance={attendance}
                  subjects={subjects}
                  attendancePercent={attendancePercent}
                />

                <StudentScheduleCard />

                <StudentGradesCard
                  gradesByTerm={gradesByTerm}
                  studentName={student.full_name}
                  course={course}
                  printSubjectId={printSubjectId}
                  setPrintSubjectId={setPrintSubjectId}
                />
              </div>
            ) : (
              <StudentCommunicationsList
                communications={communications}
                schoolName={school.name}
              />
            )}
          </div>
        </div>
      </div>

      {/* Contenedores de Impresión */}
      {subjects.map((sub) => {
        const termName = terms[0]?.name || 'Lapso Escolar'
        const termId = terms[0]?.id || ''
        const subEvs = evaluations.filter(
          (ev) => ev.subject_id === sub.id && ev.term_id === termId
        )

        return (
          <PrintPlanButton
            key={sub.id}
            termName={termName}
            teacherName={sub.profiles?.full_name || 'Docente de la Asignatura'}
            studentName={student.full_name}
            subjectName={sub.name}
            courseName={
              course
                ? `${course.name} (${course.grade_level}° - "${course.section}")`
                : 'Curso'
            }
            evaluations={subEvs}
            allowPrintContainer={printSubjectId === sub.name}
          />
        )
      })}
    </main>
  )
}
