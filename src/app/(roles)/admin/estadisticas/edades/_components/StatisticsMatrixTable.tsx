import React from 'react'
import {
  MppeStatisticsReport,
  CourseStatisticRow,
} from '@/lib/types/mppe-statistics'

interface StatisticsMatrixTableProps {
  report: MppeStatisticsReport
}

export function StatisticsMatrixTable({ report }: StatisticsMatrixTableProps) {
  const {
    standardAges,
    hasUnder11,
    hasOver19,
    rows,
    summary,
    monthName,
    schoolYear,
    school,
  } = report

  // Determinar lista de columnas de edades a mostrar
  const displayAges: string[] = []
  if (hasUnder11) displayAges.push('<11')
  displayAges.push(...standardAges.map(String))
  if (hasOver19) displayAges.push('>19')

  return (
    <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">
      {/* Encabezado Visual del Documento MPPE */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50/40 via-white to-gray-50/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-extrabold text-blue-700 tracking-wider uppercase block">
              República Bolivariana de Venezuela • MPPE
            </span>
            <h2 className="text-xl font-black text-gray-900 mt-0.5">
              Estadística de Matrícula por Edad y Sexo
            </h2>
            <p className="text-xs text-gray-600 mt-1">
              Plantel: <span className="font-semibold text-gray-900">{school.name}</span>
              {school.rif && ` (RIF: ${school.rif})`} • Mes de <span className="font-semibold text-gray-900">{monthName}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="px-3 py-1 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-bold shadow-xs">
              Año Escolar {schoolYear.name}
            </span>
          </div>
        </div>
      </div>

      {/* Contenedor con Scroll Horizontal Responsivo */}
      <div className="overflow-x-auto relative max-h-[70vh]">
        <table className="w-full text-center border-collapse text-xs">
          {/* 1. Definición de Grupos de Columnas para Accesibilidad (WCAG 2.2) */}
          <colgroup>
            <col className="w-36 min-w-[140px]" />
          </colgroup>
          {displayAges.map((age) => (
            <colgroup key={age} span={3} />
          ))}
          <colgroup span={3} />
          <colgroup span={2} />

          {/* 2. Encabezados Multi-Nivel */}
          <thead className="sticky top-0 z-30 bg-gray-50 border-b border-gray-200 shadow-xs">
            {/* Fila Superior: Nombres de Grupo (Edad 11, 12..., TOTAL) */}
            <tr className="border-b border-gray-200 text-gray-700">
              <th
                scope="col"
                rowSpan={2}
                className="sticky left-0 z-40 bg-gray-100/95 backdrop-blur-xs px-4 py-3 text-left font-extrabold text-gray-900 uppercase tracking-wider border-r border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]"
              >
                Año / Grado
              </th>
              {displayAges.map((age) => (
                <th
                  key={age}
                  colSpan={3}
                  scope="colgroup"
                  className="px-2 py-2 font-black text-gray-900 border-r border-gray-200 bg-gray-100/60"
                >
                  {age === '<11' ? '< 11' : age === '>19' ? '> 19' : `${age} AÑOS`}
                </th>
              ))}
              <th
                colSpan={3}
                scope="colgroup"
                className="px-3 py-2 font-black text-blue-950 border-r border-gray-200 bg-blue-100/40 uppercase tracking-wider"
              >
                TOTAL
              </th>
              <th
                colSpan={2}
                scope="colgroup"
                className="px-3 py-2 font-black text-gray-800 bg-gray-100/80 uppercase tracking-wider"
              >
                % MATRÍCULA
              </th>
            </tr>

            {/* Fila Inferior: Subcolumnas V (Varones), H (Hembras), T (Total) */}
            <tr className="border-b border-gray-200 text-[11px] text-gray-600 bg-gray-50/90 font-bold">
              {displayAges.map((age) => (
                <React.Fragment key={`sub-${age}`}>
                  <th scope="col" aria-label={`Varones de ${age} años`} className="w-8 py-2 text-blue-700 bg-blue-50/40 border-r border-gray-100">
                    V
                  </th>
                  <th scope="col" aria-label={`Hembras de ${age} años`} className="w-8 py-2 text-purple-700 bg-purple-50/40 border-r border-gray-100">
                    H
                  </th>
                  <th scope="col" aria-label={`Total de ${age} años`} className="w-9 py-2 text-gray-900 font-extrabold bg-gray-100/50 border-r border-gray-200">
                    T
                  </th>
                </React.Fragment>
              ))}
              {/* Subcolumnas TOTAL */}
              <th scope="col" aria-label="Total Varones del Curso" className="w-10 py-2 text-blue-800 bg-blue-100/50 border-r border-gray-200">
                V
              </th>
              <th scope="col" aria-label="Total Hembras del Curso" className="w-10 py-2 text-purple-800 bg-purple-100/50 border-r border-gray-200">
                H
              </th>
              <th scope="col" aria-label="Total General del Curso" className="w-11 py-2 text-gray-950 font-black bg-blue-200/40 border-r border-gray-300">
                T
              </th>
              {/* Subcolumnas Porcentajes */}
              <th scope="col" aria-label="Porcentaje Varones" className="w-12 py-2 text-blue-800 bg-blue-50/70 border-r border-gray-100">
                % V
              </th>
              <th scope="col" aria-label="Porcentaje Hembras" className="w-12 py-2 text-purple-800 bg-purple-50/70">
                % H
              </th>
            </tr>
          </thead>

          {/* 3. Filas por Curso (1RO A, 2DO A, etc.) */}
          <tbody className="divide-y divide-gray-100 font-medium">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={displayAges.length * 3 + 6} className="py-12 text-center text-gray-400">
                  No hay cursos registrados en este año escolar.
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => {
                const pctV = row.totalStudents > 0 ? ((row.totalVarones / row.totalStudents) * 100).toFixed(0) : '0'
                const pctH = row.totalStudents > 0 ? ((row.totalHembras / row.totalStudents) * 100).toFixed(0) : '0'

                return (
                  <tr
                    key={row.courseId}
                    className="hover:bg-blue-50/20 transition-colors group"
                  >
                    {/* Columna Fija: Nombre del Curso */}
                    <th
                      scope="row"
                      className="sticky left-0 z-20 bg-white group-hover:bg-blue-50/30 px-4 py-3 text-left font-black text-gray-900 border-r border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] whitespace-nowrap"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span>{row.courseName}</span>
                        {row.incompleteDataCount > 0 && (
                          <span
                            title={`${row.incompleteDataCount} alumno(s) sin fecha de nacimiento o sexo`}
                            className="w-2 h-2 rounded-full bg-amber-500 shrink-0"
                          />
                        )}
                      </div>
                    </th>

                    {/* Celdas por Edad */}
                    {displayAges.map((age) => {
                      const count = row.byAge[age] || { varones: 0, hembras: 0, total: 0 }
                      return (
                        <React.Fragment key={`${row.courseId}-${age}`}>
                          <td className="py-2.5 text-blue-700 bg-blue-50/20 border-r border-gray-100">
                            {count.varones > 0 ? count.varones : <span className="text-gray-300">-</span>}
                          </td>
                          <td className="py-2.5 text-purple-700 bg-purple-50/20 border-r border-gray-100">
                            {count.hembras > 0 ? count.hembras : <span className="text-gray-300">-</span>}
                          </td>
                          <td className="py-2.5 font-bold text-gray-900 bg-gray-50/40 border-r border-gray-200">
                            {count.total > 0 ? count.total : <span className="text-gray-300 font-normal">-</span>}
                          </td>
                        </React.Fragment>
                      )
                    })}

                    {/* Totales del Curso */}
                    <td className="py-2.5 font-bold text-blue-800 bg-blue-50/60 border-r border-gray-200">
                      {row.totalVarones > 0 ? row.totalVarones : '-'}
                    </td>
                    <td className="py-2.5 font-bold text-purple-800 bg-purple-50/60 border-r border-gray-200">
                      {row.totalHembras > 0 ? row.totalHembras : '-'}
                    </td>
                    <td className="py-2.5 font-black text-gray-900 bg-blue-100/50 border-r border-gray-300">
                      {row.totalStudents > 0 ? row.totalStudents : '-'}
                    </td>

                    {/* Porcentajes del Curso */}
                    <td className="py-2.5 text-blue-700 font-semibold bg-blue-50/30 border-r border-gray-100">
                      {row.totalStudents > 0 ? `${pctV}%` : '-'}
                    </td>
                    <td className="py-2.5 text-purple-700 font-semibold bg-purple-50/30">
                      {row.totalStudents > 0 ? `${pctH}%` : '-'}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>

          {/* 4. Pie de Tabla: TOTALES INSTITUCIONALES Y PORCENTAJES */}
          <tfoot className="sticky bottom-0 z-30 font-black border-t-2 border-gray-300 bg-gray-100/95 backdrop-blur-xs">
            {/* Fila: TOTAL INSTITUCIONAL */}
            <tr className="border-b border-gray-200 text-gray-900">
              <th
                scope="row"
                className="sticky left-0 z-40 bg-gray-200/95 px-4 py-3 text-left font-black uppercase tracking-wider border-r border-gray-300 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]"
              >
                TOTAL GENERAL
              </th>
              {displayAges.map((age) => {
                const count = summary.byAge[age] || { varones: 0, hembras: 0, total: 0 }
                return (
                  <React.Fragment key={`tot-${age}`}>
                    <td className="py-3 text-blue-800 bg-blue-100/40 border-r border-gray-200">
                      {count.varones > 0 ? count.varones : '-'}
                    </td>
                    <td className="py-3 text-purple-800 bg-purple-100/40 border-r border-gray-200">
                      {count.hembras > 0 ? count.hembras : '-'}
                    </td>
                    <td className="py-3 font-extrabold text-gray-950 bg-gray-200/60 border-r border-gray-300">
                      {count.total > 0 ? count.total : '-'}
                    </td>
                  </React.Fragment>
                )
              })}
              {/* Gran Total */}
              <td className="py-3 font-black text-blue-900 bg-blue-200/70 border-r border-gray-300">
                {summary.totalVarones}
              </td>
              <td className="py-3 font-black text-purple-900 bg-purple-200/70 border-r border-gray-300">
                {summary.totalHembras}
              </td>
              <td className="py-3 font-black text-black bg-blue-300/80 text-sm border-r border-gray-300">
                {summary.totalStudents}
              </td>
              {/* % Gran Total */}
              <td className="py-3 font-black text-blue-900 bg-blue-100/70 border-r border-gray-200">
                {summary.percentVarones}%
              </td>
              <td className="py-3 font-black text-purple-900 bg-purple-100/70">
                {summary.percentHembras}%
              </td>
            </tr>

            {/* Fila: DISTRIBUCIÓN PORCENTUAL (%) */}
            <tr className="bg-gray-50 text-[11px] text-gray-700">
              <th
                scope="row"
                className="sticky left-0 z-40 bg-gray-100 px-4 py-2 text-left font-bold border-r border-gray-300 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]"
              >
                % POR EDAD
              </th>
              {displayAges.map((age) => {
                const count = summary.byAge[age] || { varones: 0, hembras: 0, total: 0 }
                const pctOfTotal = summary.totalStudents > 0
                  ? ((count.total / summary.totalStudents) * 100).toFixed(1)
                  : '0.0'
                return (
                  <td
                    key={`pct-${age}`}
                    colSpan={3}
                    className="py-2 font-bold text-gray-800 border-r border-gray-200 bg-gray-50"
                  >
                    {count.total > 0 ? `${pctOfTotal}%` : '-'}
                  </td>
                )
              })}
              <td colSpan={3} className="py-2 font-black text-gray-900 border-r border-gray-300 bg-blue-100/50">
                100%
              </td>
              <td colSpan={2} className="py-2 font-bold text-gray-500">
                —
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Nota al Pie Informativa */}
      <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500/20 border border-blue-500 inline-block" />
            <strong className="text-gray-700">V:</strong> Varones (Masculino)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-purple-500/20 border border-purple-500 inline-block" />
            <strong className="text-gray-700">H:</strong> Hembras (Femenino)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-gray-400/20 border border-gray-600 inline-block" />
            <strong className="text-gray-700">T:</strong> Total Grupo
          </span>
        </div>
        <div>
          Corte calculado al: <span className="font-semibold text-gray-700">{report.cutOffDate}</span>
        </div>
      </div>
    </div>
  )
}
