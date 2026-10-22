'use client'

import { WEEKDAY_SCHEDULES } from './schedule-utils'

interface PrintScheduleSheetProps {
  schoolName: string
  schoolRif?: string
  studentName: string
  studentCedula?: string
  courseName: string
}

export function PrintScheduleSheet({
  schoolName,
  schoolRif,
  studentName,
  studentCedula,
  courseName,
}: PrintScheduleSheetProps) {
  const dayLabels = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

  return (
    <div className="hidden print:block text-black p-8 font-serif bg-white min-h-screen text-[12px] leading-relaxed">
      {/* Membrete Oficial del Colegio */}
      <div className="text-center border-b border-black pb-3 mb-5">
        <p className="font-extrabold uppercase text-[11px] tracking-tight">
          República Bolivariana de Venezuela
        </p>
        <p className="font-extrabold uppercase text-[9px] text-slate-600 mt-0.5">
          Ministerio del Poder Popular para la Educación
        </p>
        <p className="font-black uppercase text-[13px] tracking-wide mt-1">
          {schoolName}
        </p>
        {schoolRif && (
          <p className="text-[9px] text-slate-500 font-semibold mt-0.5">
            RIF: {schoolRif}
          </p>
        )}
      </div>

      {/* Título Oficial */}
      <div className="text-center mb-5">
        <h2 className="text-[14px] font-black uppercase tracking-wider">
          Horario Oficial de Clases
        </h2>
        <p className="font-bold text-slate-700 text-[11px] mt-0.5">
          Año Escolar Activo
        </p>
      </div>

      {/* Ficha Informativa del Estudiante */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 border border-black p-3.5 rounded-md mb-6 bg-slate-50/50 text-[11px]">
        <div>
          <p>
            <strong className="uppercase">Estudiante:</strong> {studentName}
          </p>
          <p className="mt-1">
            <strong className="uppercase">Cédula / ID:</strong> {studentCedula || 'Sin Cédula'}
          </p>
        </div>
        <div>
          <p>
            <strong className="uppercase">Curso y Sección:</strong> {courseName}
          </p>
          <p className="mt-1">
            <strong className="uppercase">Fecha de Emisión:</strong> {new Date().toLocaleDateString('es-VE')}
          </p>
        </div>
      </div>

      {/* Tabla del Horario */}
      <div className="mb-10">
        <table className="w-full border-collapse border border-black text-[11px]">
          <thead>
            <tr className="bg-slate-100 font-bold text-center">
              <th scope="col" className="border border-black px-3 py-2 w-28 text-left uppercase">
                Día
              </th>
              <th scope="col" className="border border-black px-3 py-2 text-left uppercase">
                Asignatura / Bloque
              </th>
              <th scope="col" className="border border-black px-3 py-2 w-32 text-center uppercase">
                Horario
              </th>
            </tr>
          </thead>
          <tbody>
            {dayLabels.map((dayLabel, dayIndex) => {
              const classes = WEEKDAY_SCHEDULES[dayIndex] || []
              return classes.map((cls, clsIndex) => (
                <tr key={`${dayIndex}-${clsIndex}`} className="align-middle">
                  {clsIndex === 0 ? (
                    <td
                      rowSpan={classes.length}
                      className="border border-black px-3 py-2.5 font-bold uppercase bg-slate-50/70 align-top"
                    >
                      {dayLabel}
                    </td>
                  ) : null}
                  <td className="border border-black px-3 py-2 font-medium">
                    {cls.subject}
                  </td>
                  <td className="border border-black px-3 py-2 text-center font-semibold text-slate-700">
                    {cls.time}
                  </td>
                </tr>
              ))
            })}
          </tbody>
        </table>
      </div>

      {/* Cuadro de Firmas Oficiales */}
      <div className="grid grid-cols-3 gap-8 mt-20 text-center text-[9px]">
        <div className="flex flex-col justify-between items-center h-16">
          <div className="w-28 border-b border-black" />
          <p className="font-bold uppercase tracking-wider">Docente Guía / Tutor</p>
        </div>
        <div className="flex flex-col justify-between items-center h-16">
          <div className="w-28 border-b border-black" />
          <p className="font-bold uppercase tracking-wider">Control de Estudios</p>
        </div>
        <div className="flex flex-col justify-between items-center h-16">
          <div className="w-28 border-b border-black" />
          <p className="font-bold uppercase tracking-wider">Dirección del Plantel</p>
        </div>
      </div>
    </div>
  )
}
