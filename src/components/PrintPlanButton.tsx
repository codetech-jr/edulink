'use client'

import { Printer } from 'lucide-react'

interface Evaluation {
  id?: string
  name: string
  weight: number
  evaluation_date?: string | null
}

interface PrintPlanButtonProps {
  schoolName?: string
  schoolRif?: string
  termName: string
  teacherName: string
  studentName?: string
  subjectName: string
  courseName: string
  evaluations: Evaluation[]
  onClick?: (e: React.MouseEvent) => void
  allowPrintContainer?: boolean
}

export function PrintPlanButton({
  schoolName = 'U.E. Liceo Matalinda',
  schoolRif = 'J-12345678-9',
  termName,
  teacherName,
  studentName,
  subjectName,
  courseName,
  evaluations,
  onClick,
  allowPrintContainer = true,
}: PrintPlanButtonProps) {
  const handlePrint = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onClick) {
      onClick(e)
    } else {
      window.print()
    }
  }

  return (
    <>
      {/* Botón de Impresión Web */}
      <button
        type="button"
        onClick={handlePrint}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all active:scale-[0.98] print:hidden cursor-pointer"
        title="Imprimir plan de evaluación oficial"
      >
        <Printer className="w-3.5 h-3.5 flex-shrink-0" />
        Imprimir Plan
      </button>

      {/* Contenedor Imprimible Oficial (Solo visible al imprimir) */}
      {allowPrintContainer && (
        <div className="hidden print:block text-black p-8 font-serif bg-white min-h-screen text-[12px] leading-relaxed">
        {/* Membrete Oficial del Colegio */}
        <div className="text-center border-b border-black pb-3 mb-5">
          <p className="font-extrabold uppercase text-[11px] tracking-tight">República Bolivariana de Venezuela</p>
          <p className="font-black uppercase text-[13px] tracking-wide mt-0.5">{schoolName}</p>
          <p className="text-[9px] font-semibold text-slate-600 mt-0.5">Control de Evaluación y Planificación Académica</p>
          {schoolRif && <p className="text-[9px] text-slate-500 font-semibold mt-0.5">RIF: {schoolRif}</p>}
        </div>

        {/* Título de la Planilla */}
        <div className="text-center mb-5">
          <h2 className="text-[12px] font-black uppercase tracking-wider">Plan Oficial de Evaluación y Planificación</h2>
          <p className="font-bold text-slate-700 mt-0.5">{termName} — Año Escolar Activo</p>
        </div>

        {/* Datos Informativos */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 border border-black p-3 rounded-md mb-5 bg-slate-50/50">
          <div>
            <p><strong className="uppercase">Docente:</strong> {teacherName}</p>
            <p className="mt-1"><strong className="uppercase">Asignatura:</strong> {subjectName}</p>
          </div>
          <div>
            <p><strong className="uppercase">Curso y Sección:</strong> {courseName}</p>
            {studentName && <p className="mt-1"><strong className="uppercase">Estudiante:</strong> {studentName}</p>}
            <p className="mt-1"><strong className="uppercase">Fecha de Impresión:</strong> {new Date().toLocaleDateString('es-VE')}</p>
          </div>
        </div>

        {/* Tabla de Evaluaciones */}
        <div className="mb-10">
          <p className="font-black uppercase text-[9px] tracking-wider mb-2 text-slate-400">Actividades Planificadas</p>
          <table className="w-full border-collapse border border-black text-[11px]">
            <thead>
              <tr className="bg-slate-100 font-bold text-center">
                <th className="border border-black px-3 py-2 text-left w-12">Nº</th>
                <th className="border border-black px-3 py-2 text-left">Descripción de la Actividad / Evaluación</th>
                <th className="border border-black px-3 py-2 w-24">Ponderación</th>
                <th className="border border-black px-3 py-2 w-32">Fecha Estimada</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((ev, idx) => (
                <tr key={ev.id || idx} className="align-middle">
                  <td className="border border-black px-3 py-2 text-center font-bold">{idx + 1}</td>
                  <td className="border border-black px-3 py-2 font-medium">{ev.name}</td>
                  <td className="border border-black px-3 py-2 text-center font-bold">{ev.weight}%</td>
                  <td className="border border-black px-3 py-2 text-center">
                    {ev.evaluation_date
                      ? new Date(ev.evaluation_date + 'T00:00:00').toLocaleDateString('es-VE')
                      : 'Por definir'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cuadro de Firmas de Coordinación */}
        <div className="grid grid-cols-3 gap-8 mt-20 text-center text-[9px]">
          <div className="flex flex-col justify-between items-center h-16">
            <div className="w-28 border-b border-black" />
            <p className="font-bold uppercase tracking-wider">Firma del Docente</p>
          </div>
          <div className="flex flex-col justify-between items-center h-16">
            <div className="w-28 border-b border-black" />
            <p className="font-bold uppercase tracking-wider">Coordinación de Evaluación</p>
          </div>
          <div className="flex flex-col justify-between items-center h-16">
            <div className="w-28 border-b border-black" />
            <p className="font-bold uppercase tracking-wider">Dirección del Plantel</p>
          </div>
        </div>
      </div>
      )}
    </>
  )
}
