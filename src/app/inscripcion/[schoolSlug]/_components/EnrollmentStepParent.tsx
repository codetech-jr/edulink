'use client'

import React from 'react'
import { Users, AlertCircle } from 'lucide-react'

interface EnrollmentStepParentProps {
  formData: {
    parent_name: string
    parent_cedula: string
    parent_phone: string
    parent_email: string
    parent_relationship?: string
  }
  fieldErrors: Record<string, string>
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void
}

export function EnrollmentStepParent({
  formData,
  fieldErrors,
  onChange,
}: EnrollmentStepParentProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-600" />
          Información del Representante Legal o Tutor
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Datos de la madre, padre, abuelo(a), tío(a) o tutor(a) legal responsable del estudiante ante la institución.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Nombre representante */}
        <div>
          <label
            htmlFor="parent_name"
            className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2"
          >
            Nombre y Apellido del Tutor <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            id="parent_name"
            name="parent_name"
            value={formData.parent_name}
            onChange={onChange}
            placeholder="Ej: Carmen Elena González"
            className={`w-full px-4 py-3 bg-slate-50/70 border rounded-xl text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all min-h-[44px] ${
              fieldErrors.parent_name
                ? 'border-rose-300 focus:ring-rose-400'
                : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500/20'
            }`}
          />
          {fieldErrors.parent_name && (
            <p className="text-rose-600 text-xs font-semibold mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {fieldErrors.parent_name}
            </p>
          )}
        </div>

        {/* Parentesco / Vínculo */}
        <div>
          <label
            htmlFor="parent_relationship"
            className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2"
          >
            Parentesco / Vínculo <span className="text-rose-500">*</span>
          </label>
          <select
            id="parent_relationship"
            name="parent_relationship"
            value={formData.parent_relationship || 'madre'}
            onChange={onChange}
            className="w-full px-4 py-3 bg-slate-50/70 border border-slate-300 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all min-h-[44px]"
          >
            <option value="madre">Madre</option>
            <option value="padre">Padre</option>
            <option value="abuela">Abuela</option>
            <option value="abuelo">Abuelo</option>
            <option value="tia">Tía</option>
            <option value="tio">Tío</option>
            <option value="hermana">Hermana mayor de edad</option>
            <option value="hermano">Hermano mayor de edad</option>
            <option value="tutor_legal">Tutor(a) Legal (LOPNNA / Poder)</option>
            <option value="otro">Otro familiar responsable</option>
          </select>
        </div>

        {/* Cédula representante */}
        <div>
          <label
            htmlFor="parent_cedula"
            className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2"
          >
            Cédula de Identidad <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            id="parent_cedula"
            name="parent_cedula"
            value={formData.parent_cedula}
            onChange={onChange}
            placeholder="Ej: V-15482394"
            className={`w-full px-4 py-3 bg-slate-50/70 border rounded-xl text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all min-h-[44px] ${
              fieldErrors.parent_cedula
                ? 'border-rose-300 focus:ring-rose-400'
                : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500/20'
            }`}
          />
          {fieldErrors.parent_cedula && (
            <p className="text-rose-600 text-xs font-semibold mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {fieldErrors.parent_cedula}
            </p>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <label
            htmlFor="parent_phone"
            className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2"
          >
            Teléfono de Contacto (WhatsApp) <span className="text-rose-500">*</span>
          </label>
          <input
            type="tel"
            inputMode="tel"
            id="parent_phone"
            name="parent_phone"
            value={formData.parent_phone}
            onChange={onChange}
            placeholder="04121234567 o 04141234567"
            className={`w-full px-4 py-3 bg-slate-50/70 border rounded-xl text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all min-h-[44px] ${
              fieldErrors.parent_phone
                ? 'border-rose-300 focus:ring-rose-400'
                : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500/20'
            }`}
          />
          <p className="text-[11px] text-slate-500 mt-1">
            11 dígitos sin guiones ni espacios (ej: 04129876543)
          </p>
          {fieldErrors.parent_phone && (
            <p className="text-rose-600 text-xs font-semibold mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {fieldErrors.parent_phone}
            </p>
          )}
        </div>

        {/* Correo Electrónico */}
        <div>
          <label
            htmlFor="parent_email"
            className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2"
          >
            Correo Electrónico <span className="text-slate-400 font-normal lowercase">(opcional)</span>
          </label>
          <input
            type="email"
            inputMode="email"
            id="parent_email"
            name="parent_email"
            value={formData.parent_email}
            onChange={onChange}
            placeholder="representante@ejemplo.com"
            className={`w-full px-4 py-3 bg-slate-50/70 border rounded-xl text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all min-h-[44px] ${
              fieldErrors.parent_email
                ? 'border-rose-300 focus:ring-rose-400'
                : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500/20'
            }`}
          />
          {fieldErrors.parent_email && (
            <p className="text-rose-600 text-xs font-semibold mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {fieldErrors.parent_email}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
