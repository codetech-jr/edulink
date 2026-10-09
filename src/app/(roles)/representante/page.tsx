import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { logoutAction } from '@/actions/auth-actions'
import { ReportPaymentForm } from './_components/ReportPaymentForm'
import { PaymentInstructions } from './_components/PaymentInstructions'
import { DashboardTabs } from './_components/DashboardTabs'
import { AcademicsTab } from './_components/AcademicsTab'
import { CommunicationsTab } from './_components/CommunicationsTab'
import { cn } from '@/utils/cn'
import {
  LogOut,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  GraduationCap,
  TrendingUp,
} from 'lucide-react'

export const metadata = {
  title: 'Portal de Representante | EduLink',
  description: 'Portal para padres y representantes de EduLink.',
}

// Formateadores y ayudantes de UI
function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

function getPaymentMethodLabel(method: string) {
  const labels: Record<string, string> = {
    pago_movil: 'Pago Móvil',
    transferencia: 'Transferencia Bancaria',
    zelle: 'Zelle',
    efectivo: 'Efectivo',
  }
  return labels[method] || method
}

export default async function RepresentanteDashboardPage() {
  const supabase = await createClient()

  // 1. Obtener la sesión del usuario actual
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Obtener el perfil del representante
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, school_id')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'representante') {
    redirect('/login')
  }

  // 3. Obtener los estudiantes (hijos) del representante, incluyendo los datos del curso
  const { data: studentsData } = await supabase
    .from('students')
    .select(`
      id,
      full_name,
      cedula,
      school_id,
      courses (
        name,
        grade_level,
        section
      )
    `)
    .eq('parent_id', user.id)
    .eq('is_active', true)

  const students = studentsData ?? []

  // 4. Si no hay estudiantes asociados, mostrar Empty State amigable
  if (students.length === 0) {
    return (
      <main className="flex min-h-screen flex-col bg-[#F8FAFC] text-slate-800 p-4 font-sans">
        <div className="mx-auto w-full max-w-md flex flex-col justify-center items-center min-h-[80vh] space-y-6">
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 shadow-inner">
            <User className="w-10 h-10 animate-pulse" />
          </div>
          
          <div className="text-center space-y-2 px-4">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
              Hola, {profile.full_name}
            </h1>
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
              Cuenta sin Vincular
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Actualmente no tienes estudiantes asociados a tu usuario en nuestra base de datos.
            </p>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 font-medium text-left mt-6 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>¿Qué debo hacer?</strong> Acuda a la secretaría del plantel con la cédula escolar de sus representados para enlazarse de inmediato.
              </span>
            </div>
          </div>

          <form action={logoutAction} className="w-full pt-4">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-md transition-all text-sm"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </form>
        </div>
      </main>
    )
  }

  // 5. Obtener los IDs de los estudiantes
  const studentIds = students.map((s) => s.id)

  // 6. Obtener el historial de pagos asociados a estos estudiantes
  const { data: paymentsData } = await supabase
    .from('payments')
    .select(`
      id,
      student_id,
      amount_usd,
      payment_method,
      status,
      reference_number,
      transaction_date,
      rejection_reason,
      billing_concepts (
        name
      )
    `)
    .in('student_id', studentIds)
    .order('created_at', { ascending: false })

  const payments = paymentsData ?? []

  // 7. Obtener los aranceles/conceptos de facturación activos para la institución
  const { data: billingConceptsData } = await supabase
    .from('billing_concepts')
    .select('id, name, amount_usd')
    .eq('school_id', students[0].school_id)
    .eq('is_active', true)
    .order('name', { ascending: true })

  const billingConcepts = billingConceptsData ?? []

  // 8. Obtener la última tasa de cambio oficial (BCV) para el colegio
  const { data: exchangeRates } = await supabase
    .from('exchange_rates')
    .select('rate')
    .eq('school_id', students[0].school_id)
    .order('rate_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)

  const bcvRate = exchangeRates?.[0]?.rate || 36.50

  // 9. Obtener los datos del colegio
  const { data: schoolData } = await supabase
    .from('schools')
    .select('name, rif')
    .eq('id', students[0].school_id)
    .single()

  const school = schoolData || { name: 'U.E. Liceo Matalinda', rif: 'J-12345678-9' }

  // 10. Calcular estadísticas rápidas para la interfaz Fintech
  const totalReported = payments.reduce((acc, curr) => acc + (curr.amount_usd || 0), 0)
  const pendingPayments = payments.filter((p) => p.status === 'pendiente')

  // 11. Obtener la asistencia de la semana en curso (8 al 12 de junio de 2026) para todos los representados
  const { data: attendanceData } = await supabase
    .from('attendance')
    .select(`
      id,
      student_id,
      attendance_date,
      status,
      notes,
      subject_id,
      subjects (
        id,
        name,
        start_time,
        end_time
      )
    `)
    .in('student_id', studentIds)
    .gte('attendance_date', '2026-06-08')
    .lte('attendance_date', '2026-06-12')

  const attendance = attendanceData ?? []

  // 12. Obtener las calificaciones de las evaluaciones publicadas
  const { data: gradesData } = await supabase
    .from('grades')
    .select(`
      id,
      student_id,
      score,
      is_absent,
      notes,
      evaluation_id,
      evaluations (
        id,
        name,
        weight,
        term_id,
        evaluation_date,
        terms (
          id,
          name
        ),
        subjects (
          id,
          name,
          profiles:teacher_id (
            full_name
          )
        )
      )
    `)
    .in('student_id', studentIds)

  const normalizedGrades = (gradesData ?? []).map((g: any) => {
    let evalData = g.evaluations
    if (Array.isArray(evalData)) {
      evalData = evalData[0] || null
    }

    let termData = evalData?.terms
    if (Array.isArray(termData)) {
      termData = termData[0] || null
    }

    let subjectData = evalData?.subjects
    if (Array.isArray(subjectData)) {
      subjectData = subjectData[0] || null
    }

    let teacherProfile = subjectData?.profiles
    if (Array.isArray(teacherProfile)) {
      teacherProfile = teacherProfile[0] || null
    }

    return {
      id: g.id,
      student_id: g.student_id,
      score: g.score !== null ? Number(g.score) : null,
      is_absent: g.is_absent,
      notes: g.notes,
      evaluation_id: g.evaluation_id,
      evaluations: evalData
        ? {
            id: evalData.id,
            name: evalData.name,
            weight: Number(evalData.weight),
            evaluation_date: evalData.evaluation_date,
            term_id: evalData.term_id,
            terms: termData
              ? {
                  id: termData.id,
                  name: termData.name,
                }
              : null,
            subjects: subjectData
              ? {
                  id: subjectData.id,
                  name: subjectData.name,
                  teacherName: teacherProfile?.full_name || 'Docente de la Asignatura',
                }
              : null,
          }
        : null,
    }
  })

  // Vincular la asistencia y las calificaciones a cada estudiante
  const studentsWithData = students.map((student) => ({
    ...student,
    attendance: attendance.filter((a) => a.student_id === student.id),
    grades: normalizedGrades.filter((g) => g.student_id === student.id),
  }))

  // ────────────────────────────────────────────────
  const financesContent = (
    <div className="space-y-6">
      {/* Sección de Acción: Reportar Pago */}
      <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-sm flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-zinc-50 border border-zinc-200/60 rounded-xl flex items-center justify-center text-zinc-500 flex-shrink-0">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-zinc-800">¿Hiciste una transferencia?</h2>
              <p className="text-[11px] text-zinc-400">Repórtala aquí para registrar el pago al instante.</p>
            </div>
          </div>
          {/* Indicador Tasa Oficial BCV del Día */}
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium bg-zinc-50 text-zinc-500 rounded-full border border-zinc-200/80 flex-shrink-0">
            Tasa BCV: {bcvRate.toFixed(2)} Bs/$
          </span>
        </div>
        
        {/* Componente del Formulario */}
        <ReportPaymentForm students={students} billingConcepts={billingConcepts} bcvRate={bcvRate} />
      </div>

      {/* Instrucciones de Pago del Colegio */}
      <PaymentInstructions schoolName={school.name} schoolRif={school.rif} />

      {/* Listado de Representados (Hijos) con Historial de Pagos */}
      <div className="space-y-4">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest pl-1">
          Mis Representados ({students.length})
        </h2>

        {students.map((student) => {
          const studentCourse = student.courses as any
          const studentPayments = payments.filter((p) => p.student_id === student.id)

          return (
            <div
              key={student.id}
              className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden"
            >
              {/* Cabecera Estudiante */}
              <div className="p-5 border-b border-zinc-100 bg-gradient-to-b from-zinc-50/70 to-white flex items-center gap-3.5">
                <div className="w-10 h-10 bg-zinc-100 border border-zinc-200 text-zinc-600 rounded-xl flex items-center justify-center font-semibold text-xs flex-shrink-0 shadow-inner">
                  {student.full_name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-semibold text-zinc-800 truncate">
                    {student.full_name}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] font-normal text-zinc-400 mt-0.5">
                    <GraduationCap className="w-3.5 h-3.5 text-zinc-300 flex-shrink-0" />
                    <span className="truncate">
                      {studentCourse?.name ? `${studentCourse.name} (${studentCourse.grade_level} - ${studentCourse.section})` : 'Curso no asignado'}
                    </span>
                  </div>

                  {/* Píldora de Deuda Simulada (MVP Venezolano) */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-normal bg-zinc-50 border border-zinc-200/60 text-zinc-500 rounded-full">
                      <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse" />
                      Mensualidad Junio pendiente: $45.00
                    </span>
                  </div>

                </div>
              </div>

              {/* Historial de Pagos de este Estudiante */}
              <div className="p-5">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest block mb-3.5">
                  Historial de Pagos
                </span>

                {studentPayments.length === 0 ? (
                  <div className="text-center py-6 px-4 border border-dashed border-zinc-200/60 rounded-xl">
                    <p className="text-xs font-normal text-zinc-400">No hay pagos reportados</p>
                    <p className="text-[10px] text-zinc-400 mt-1">Registra tu primer reporte arriba.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {studentPayments.map((payment) => {
                      const conceptName = (payment.billing_concepts as any)?.name || 'Arancel General'

                      // Configuración visual según status (Sutil: dot + text)
                      let statusDot = 'bg-zinc-300'
                      let statusText = 'Pendiente'

                      if (payment.status === 'confirmado') {
                        statusDot = 'bg-emerald-500'
                        statusText = 'Verificado'
                      } else if (payment.status === 'rechazado') {
                        statusDot = 'bg-red-500'
                        statusText = 'Rechazado'
                      }

                      return (
                        <div
                          key={payment.id}
                          className="p-3.5 bg-zinc-50/30 border border-zinc-200/50 rounded-xl flex flex-col gap-2.5 transition-all hover:bg-zinc-50/60"
                        >
                          <div className="flex items-start justify-between">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-zinc-800 truncate">
                                {conceptName}
                              </p>
                              <p className="text-[10px] font-normal text-zinc-400 mt-0.5">
                                Ref: {payment.reference_number} | {getPaymentMethodLabel(payment.payment_method)}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-xs font-semibold text-zinc-900">
                                {formatCurrency(payment.amount_usd)}
                              </p>
                              <p className="text-[9px] font-normal text-zinc-400 mt-0.5">
                                {payment.transaction_date}
                              </p>
                            </div>
                          </div>

                          {/* Badge de Estado y Feedback */}
                          <div className="flex items-center justify-between pt-1">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-normal text-zinc-500">
                              <span className={cn("w-1.5 h-1.5 rounded-full", statusDot)} />
                              {statusText}
                            </span>

                            {payment.status === 'rechazado' && payment.rejection_reason && (
                              <div className="text-[9px] bg-red-50/50 text-red-600 px-2 py-0.5 rounded-md border border-red-100 max-w-[180px] truncate" title={payment.rejection_reason}>
                                <strong>Nota:</strong> {payment.rejection_reason}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const academicsContent = <AcademicsTab students={studentsWithData} />

  // 13. Obtener comunicados oficiales de la institución
  const { data: communicationsData } = await supabase
    .from('communications')
    .select('*')
    .eq('school_id', students[0].school_id)
    .order('created_at', { ascending: false })

  const communications = communicationsData ?? []

  const communicationsContent = (
    <CommunicationsTab schoolName={school.name} communications={communications} />
  )

  const profileCard = (
    <div className="bg-zinc-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-sm">
      {/* Subtle grid pattern or glass accent */}
      <div className="absolute right-0 top-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="space-y-1">
        <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-400">
          Portal del Representante
        </span>
        <h1 className="text-lg font-semibold tracking-tight text-white truncate">
          {profile.full_name}
        </h1>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-zinc-800">
        <div className="space-y-1">
          <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider block">
            Total Reportado
          </span>
          <span className="text-2xl font-semibold text-white tracking-tight">
            {formatCurrency(totalReported)}
          </span>
        </div>
        
        <div className="space-y-1">
          <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider block">
            En Verificación
          </span>
          <span className="text-lg font-semibold text-amber-400 tracking-tight flex items-center gap-1.5 mt-0.5">
            <Clock className="w-4 h-4" />
            {pendingPayments.length} {pendingPayments.length === 1 ? 'pago' : 'pagos'}
          </span>
        </div>
      </div>
    </div>
  )

  return (
    <main className="flex min-h-screen flex-col bg-zinc-50 pb-12 font-sans selection:bg-indigo-100">
      {/* Navbar Superior Fijo con Blur */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 bg-white/80 backdrop-blur-md px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs tracking-tight shadow-sm shadow-indigo-200">
            E
          </div>
          <span className="font-semibold text-zinc-900 tracking-tight text-sm">EduLink</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-zinc-500">
            {profile.full_name}
          </span>
          <div className="h-4 w-px bg-zinc-200" />
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-1 px-2.5 py-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 rounded-lg transition-all text-[11px] font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar sesión</span>
            </button>
          </form>
        </div>
      </header>

      {/* Contenedor Principal (Responsivo Premium) */}
      <div className="mx-auto w-full max-w-md lg:max-w-7xl lg:px-8 px-4 py-6 space-y-6">
        
        {/* Sistema de Pestañas (Tabs) */}
        <DashboardTabs
          profileCard={profileCard}
          financesContent={financesContent}
          academicsContent={academicsContent}
          communicationsContent={communicationsContent}
        />

      </div>
    </main>
  )
}
