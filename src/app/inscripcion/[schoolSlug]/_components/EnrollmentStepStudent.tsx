'use client'

import React from 'react'
import { User, AlertCircle } from 'lucide-react'

export const GRADES_OPTIONS = [
  'Educación Inicial / Maternal',
  '1er Nivel Preescolar',
  '2do Nivel Preescolar',
  '3er Nivel Preescolar',
  '1er Grado de Primaria',
  '2do Grado de Primaria',
  '3er Grado de Primaria',
  '4to Grado de Primaria',
  '5to Grado de Primaria',
  '6to Grado de Primaria',
  '1er Año de Educación Media',
  '2do Año de Educación Media',
  '3er Año de Educación Media',
  '4to Año de Educación Media',
  '5to Año de Educación Media',
]

interface EnrollmentStepStudentProps {
  formData: {
    student_name: string
    student_cedula: string
    student_birth_date: string
    grade_requested: string
  }
  fieldErrors: Record<string, string>
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void
}

export function EnrollmentStepStudent({
  formData,
  fieldErrors,
  onChange,
}: EnrollmentStepStudentProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <User className="w-5 h-5 text-emerald-600" />
          Información del Alumno o Aspirante
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Ingresa los datos personales del estudiante que solicita el cupo.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Nombre completo */}
        <div className="sm:col-span-2">
          <label
            htmlFor="student_name"
            className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2"
          >
            Nombre Completo del Alumno <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            id="student_name"
            name="student_name"
            value={formData.student_name}
            onChange={onChange}
            placeholder="Ej: Sofía Valentina Mendoza Pérez"
            className={`w-full px-4 py-3 bg-slate-50/70 border rounded-xl text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all min-h-[44px] ${
              fieldErrors.student_name
                ? 'border-rose-300 focus:ring-rose-400'
                : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500/20'
            }`}
          />
          {fieldErrors.student_name && (
            <p className="text-rose-600 text-xs font-semibold mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {fieldErrors.student_name}
            </p>
          )}
        </div>

        {/* Cédula o Identificación Escolar */}
        <div>
          <label
            htmlFor="student_cedula"
            className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2"
          >
            Cédula / Cédula Escolar <span className="text-slate-400 font-normal lowercase">(opcional)</span>
          </label>
          <input
            type="text"
            id="student_cedula"
            name="student_cedula"
            value={formData.student_cedula}
            onChange={onChange}
            placeholder="Ej: V-32145678 o Cédula Escolar"
            className="w-full px-4 py-3 bg-slate-50/70 border border-slate-300 rounded-xl text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all min-h-[44px]"
          />
        </div>

        {/* Fecha de Nacimiento */}
        <div>
          <label
            htmlFor="student_birth_date"
            className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2"
          >
            Fecha de Nacimiento <span className="text-slate-400 font-normal lowercase">(opcional)</span>
          </label>
          <input
            type="date"
            id="student_birth_date"
            name="student_birth_date"
            value={formData.student_birth_date}
            onChange={onChange}
            className="w-full px-4 py-3 bg-slate-50/70 border border-slate-300 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all min-h-[44px]"
          />
        </div>

        {/* Grado Solicitado */}
        <div className="sm:col-span-2">
          <label
            htmlFor="grade_requested"
            className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2"
          >
            Grado o Año Escolar Solicitado <span className="text-rose-500">*</span>
          </label>
          <select
            id="grade_requested"
            name="grade_requested"
            value={formData.grade_requested}
            onChange={onChange}
            className={`w-full px-4 py-3 bg-slate-50/70 border rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 transition-all min-h-[44px] ${
              fieldErrors.grade_requested
                ? 'border-rose-300 focus:ring-rose-400'
                : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500/20'
            }`}
          >
            <option value="">-- Selecciona el nivel educativo --</option>
            {GRADES_OPTIONS.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
          {fieldErrors.grade_requested && (
            <p className="text-rose-600 text-xs font-semibold mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {fieldErrors.grade_requested}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
