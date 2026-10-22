'use client'

interface EvaluationItem {
  id?: string
  name: string
  weight: number
  evaluation_date?: string | null
}

export interface SubjectEvaluationGroup {
  subjectName: string
  teacherName: string
  evaluations: EvaluationItem[]
}

interface PrintEvaluationsSheetProps {
  schoolName: string
  schoolRif?: string
  termName: string
  studentName: string
  studentCedula?: string
  courseName: string
  groups: SubjectEvaluationGroup[]
}

export function PrintEvaluationsSheet({
  schoolName,
  schoolRif,
  termName,
  studentName,
  studentCedula,
  courseName,
  groups,
}: PrintEvaluationsSheetProps) {
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

      {/* Título de la Planilla */}
      <div className="text-center mb-5">
        <h2 className="text-[14px] font-black uppercase tracking-wider">
          Plan y Cronograma de Actividades Evaluativas
        </h2>
        <p className="font-bold text-slate-700 text-[11px] mt-0.5">
          {termName} — Año Escolar Activo
        </p>
      </div>

      {/* Datos Informativos del Estudiante */}
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

      {/* Tabla Consolidada de Evaluaciones por Asignatura */}
      <div className="mb-10">
        <table className="w-full border-collapse border border-black text-[11px]">
          <thead>
            <tr className="bg-slate-100 font-bold text-center">
              <th scope="col" className="border border-black px-3 py-2 w-44 text-left uppercase">
                Asignatura y Docente
              </th>
              <th scope="col" className="border border-black px-3 py-2 text-left uppercase">
                Actividad / Evaluación
              </th>
              <th scope="col" className="border border-black px-3 py-2 w-24 text-center uppercase">
                Ponderación
              </th>
              <th scope="col" className="border border-black px-3 py-2 w-28 text-center uppercase">
                Fecha Estimada
              </th>
            </tr>
          </thead>
          <tbody>
            {groups.length === 0 ? (
              <tr>
                <td colSpan={4} className="border border-black p-4 text-center text-slate-500 italic">
                  No hay actividades evaluativas registradas para este lapso.
                </td>
              </tr>
            ) : (
              groups.map((group) => {
                if (group.evaluations.length === 0) {
                  return (
                    <tr key={group.subjectName}>
                      <td className="border border-black px-3 py-2 font-bold bg-slate-50/50">
                        <div>{group.subjectName}</div>
                        <div className="text-[9px] font-normal text-slate-500 mt-0.5">
                          {group.teacherName}
                        </div>
                      </td>
                      <td colSpan={3} className="border border-black px-3 py-2 text-slate-400 italic">
                        Sin evaluaciones publicadas por el docente
                      </td>
                    </tr>
                  )
                }

                return group.evaluations.map((ev, evIdx) => (
                  <tr key={`${group.subjectName}-${ev.id || evIdx}`} className="align-middle">
                    {evIdx === 0 ? (
                      <td
                        rowSpan={group.evaluations.length}
                        className="border border-black px-3 py-2 font-bold bg-slate-50/50 align-top"
                      >
                        <div>{group.subjectName}</div>
                        <div className="text-[9px] font-normal text-slate-500 mt-0.5">
                          {group.teacherName}
                        </div>
                      </td>
                    ) : null}
                    <td className="border border-black px-3 py-2 font-medium">
                      {ev.name}
                    </td>
                    <td className="border border-black px-3 py-2 text-center font-bold">
                      {ev.weight}%
                    </td>
                    <td className="border border-black px-3 py-2 text-center">
                      {ev.evaluation_date
                        ? new Date(ev.evaluation_date + 'T00:00:00').toLocaleDateString('es-VE')
                        : 'Por definir'}
                    </td>
                  </tr>
                ))
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Cuadro de Firmas Oficiales */}
      <div className="grid grid-cols-3 gap-8 mt-20 text-center text-[9px]">
        <div className="flex flex-col justify-between items-center h-16">
          <div className="w-28 border-b border-black" />
          <p className="font-bold uppercase tracking-wider">Coordinación de Evaluación</p>
        </div>
        <div className="flex flex-col justify-between items-center h-16">
          <div className="w-28 border-b border-black" />
          <p className="font-bold uppercase tracking-wider">Dirección del Plantel</p>
        </div>
        <div className="flex flex-col justify-between items-center h-16">
          <div className="w-28 border-b border-black" />
          <p className="font-bold uppercase tracking-wider">Representante Legal</p>
        </div>
      </div>
    </div>
  )
}
