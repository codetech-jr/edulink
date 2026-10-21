'use client'

import React, { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { MorosidadFilters, type FilterStatus, type CourseOption } from './MorosidadFilters'
import { MorosidadTable } from './MorosidadTable'
import type { StudentMorosidadRecord } from './AccountStatementModal'

const AccountStatementModal = dynamic(
  () => import('./AccountStatementModal').then((mod) => mod.AccountStatementModal),
  { ssr: false }
)

const WhatsAppReminderModal = dynamic(
  () => import('./WhatsAppReminderModal').then((mod) => mod.WhatsAppReminderModal),
  { ssr: false }
)

interface MorosidadDashboardClientProps {
  initialStudents: StudentMorosidadRecord[]
  bcvRate: number
  conceptName: string
  courses: CourseOption[]
}

export function MorosidadDashboardClient({
  initialStudents,
  bcvRate,
  conceptName,
  courses,
}: MorosidadDashboardClientProps) {
  // Estados de filtrado local (Zero network roundtrips)
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('todos')
  const [selectedCourse, setSelectedCourse] = useState<string>('todos')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Estados de modales
  const [statementStudent, setStatementStudent] = useState<StudentMorosidadRecord | null>(null)
  const [isStatementOpen, setIsStatementOpen] = useState(false)

  const [reminderStudent, setReminderStudent] = useState<StudentMorosidadRecord | null>(null)
  const [isReminderOpen, setIsReminderOpen] = useState(false)

  // Conteos globales de estado
  const statusCounts = useMemo(() => {
    return {
      todos: initialStudents.length,
      al_dia: initialStudents.filter((s) => s.status === 'al_dia').length,
      pendiente: initialStudents.filter((s) => s.status === 'pendiente').length,
      moroso: initialStudents.filter((s) => s.status === 'moroso').length,
    }
  }, [initialStudents])

  // Filtrado reactivo de estudiantes
  const filteredStudents = useMemo(() => {
    return initialStudents.filter((student) => {
      // 1. Filtro por estado
      if (selectedStatus !== 'todos' && student.status !== selectedStatus) {
        return false
      }

      // 2. Filtro por curso / grado
      if (selectedCourse !== 'todos' && student.course_id !== selectedCourse) {
        return false
      }

      // 3. Filtro por búsqueda de texto
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = student.full_name.toLowerCase().includes(q)
        const matchCedula = (student.cedula || '').toLowerCase().includes(q)
        const matchRep = (student.representative_name || '').toLowerCase().includes(q)
        if (!matchName && !matchCedula && !matchRep) {
          return false
        }
      }

      return true
    })
  }, [initialStudents, selectedStatus, selectedCourse, searchQuery])

  // Exportador de CSV compatible con Excel (BOM UTF-8)
  const handleExportCSV = () => {
    const todayStr = new Date().toISOString().split('T')[0]
    const filename = `reporte_morosidad_${todayStr}.csv`

    const headers = [
      '# Lista',
      'Cédula',
      'Estudiante',
      'Grado',
      'Sección',
      'Representante',
      'Teléfono',
      'Estado',
      'Deuda USD',
      'Deuda Bs (BCV)',
    ]

    const statusTranslations: Record<string, string> = {
      al_dia: 'Al día',
      pendiente: 'Por verificar',
      moroso: 'Moroso',
    }

    const rows = filteredStudents.map((s, idx) => [
      s.list_number ?? idx + 1,
      `"${s.cedula || 'S/C'}"`,
      `"${s.full_name.replace(/"/g, '""')}"`,
      `"${s.grade_level}°"`,
      `"${s.section}"`,
      `"${s.representative_name.replace(/"/g, '""')}"`,
      `"${s.representative_phone || ''}"`,
      `"${statusTranslations[s.status] || s.status}"`,
      s.debt_usd.toFixed(2),
      s.debt_ves.toFixed(2),
    ])

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Handlers para abrir modales
  const handleOpenStatement = (student: StudentMorosidadRecord) => {
    setStatementStudent(student)
    setIsStatementOpen(true)
  }

  const handleOpenReminder = (student: StudentMorosidadRecord) => {
    setReminderStudent(student)
    setIsReminderOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Controles y Filtros */}
      <MorosidadFilters
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        statusCounts={statusCounts}
        selectedCourse={selectedCourse}
        onCourseChange={setSelectedCourse}
        courses={courses}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onExportCSV={handleExportCSV}
      />

      {/* Tabla Interactiva */}
      <MorosidadTable
        students={filteredStudents}
        bcvRate={bcvRate}
        onViewStatement={handleOpenStatement}
        onSendReminder={handleOpenReminder}
        filterStatus={selectedStatus}
      />

      {/* Modal 1: Estado de Cuenta */}
      <AccountStatementModal
        student={statementStudent}
        isOpen={isStatementOpen}
        onClose={() => {
          setIsStatementOpen(false)
          setStatementStudent(null)
        }}
        bcvRate={bcvRate}
      />

      {/* Modal 2: Recordatorio WhatsApp */}
      <WhatsAppReminderModal
        student={reminderStudent}
        isOpen={isReminderOpen}
        onClose={() => {
          setIsReminderOpen(false)
          setReminderStudent(null)
        }}
        conceptName={conceptName}
        bcvRate={bcvRate}
      />
    </div>
  )
}
