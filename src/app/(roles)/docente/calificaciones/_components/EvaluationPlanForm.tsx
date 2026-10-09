'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveEvaluationPlanAction } from '@/actions/teacher-actions'
import { Plus, Trash2, Calendar, BookOpen, AlertCircle, Save, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface EvaluationPlanFormProps {
  subjectId: string
  termId: string
  subjectName: string
  termName: string
}

type EvaluationItem = {
  name: string
  weight: number
  evaluation_date: string
}

export function EvaluationPlanForm({
  subjectId,
  termId,
  subjectName,
  termName,
}: EvaluationPlanFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  // Lista inicial de evaluaciones vacía con un ítem por defecto
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([
    { name: 'Examen 1', weight: 40, evaluation_date: '' },
    { name: 'Taller 1', weight: 30, evaluation_date: '' },
    { name: 'Prueba Final', weight: 30, evaluation_date: '' },
  ])

  // Calcular la suma de ponderaciones actual
  const totalWeight = evaluations.reduce((sum, item) => sum + Number(item.weight || 0), 0)

  const handleAddItem = () => {
    setEvaluations([...evaluations, { name: '', weight: 10, evaluation_date: '' }])
  }

  const handleRemoveItem = (index: number) => {
    setEvaluations(evaluations.filter((_, i) => i !== index))
  }

  const handleChange = (index: number, field: keyof EvaluationItem, value: any) => {
    const updated = [...evaluations]
    if (field === 'weight') {
      // Permitir números o dejar vacío provisionalmente
      const numValue = value === '' ? 0 : Math.max(0, Math.min(100, parseInt(value) || 0))
      updated[index][field] = numValue
    } else {
      updated[index][field] = value
    }
    setEvaluations(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validar sumatoria
    if (totalWeight !== 100) {
      setError(`La sumatoria de ponderaciones debe ser exactamente 100%. Actualmente es ${totalWeight}%.`)
      return
    }

    // Validar nombres
    for (let i = 0; i < evaluations.length; i++) {
      if (!evaluations[i].name.trim() || evaluations[i].name.trim().length < 2) {
        setError(`El nombre de la evaluación #${i + 1} es demasiado corto (mínimo 2 caracteres).`)
        return
      }
      if (evaluations[i].weight <= 0) {
        setError(`La ponderación de "${evaluations[i].name}" debe ser mayor a 0%.`)
        return
      }
      if (!evaluations[i].evaluation_date) {
        setError(`La fecha de la evaluación "${evaluations[i].name}" es obligatoria.`)
        return
      }
    }

    startTransition(async () => {
      const res = await saveEvaluationPlanAction(subjectId, termId, evaluations)
      if (!res.success) {
        setError(res.error || 'Error al guardar el plan de evaluación.')
      } else {
        router.refresh()
      }
    })
  }

  const isFormValid = totalWeight === 100 && evaluations.every(ev => ev.name.trim().length >= 2 && ev.weight > 0 && ev.evaluation_date.trim() !== '')

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
      
      {/* Cabecera del formulario */}
      <div className="flex items-start justify-between border-b border-slate-50 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs font-extrabold uppercase tracking-widest">{subjectName}</span>
          </div>
          <h2 className="text-base font-black text-slate-900">Configurar Plan de Evaluación</h2>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mt-0.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{termName}</span>
          </div>
        </div>
        
        <Link
          href="/docente"
          className="flex items-center gap-1 text-[11px] font-extrabold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver
        </Link>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl text-xs text-indigo-900 font-medium flex gap-3">
        <AlertCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Plan de Evaluación Requerido</p>
          <p className="text-indigo-700/90 leading-relaxed">
            Antes de cargar notas para este lapso, debes definir las actividades evaluativas y sus respectivos porcentajes. La suma de todas las ponderaciones debe totalizar exactamente <strong className="text-indigo-900">100%</strong>.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Lista de Evaluaciones */}
        <div className="space-y-3">
          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block pl-1">
            Actividades Evaluadas
          </label>
          
          {evaluations.map((item, index) => (
            <div key={index} className="flex gap-3 items-center group">
              <div className="flex-grow">
                <input
                  type="text"
                  placeholder="Ej: Examen 1, Exposición, Taller"
                  value={item.name}
                  onChange={(e) => handleChange(index, 'name', e.target.value)}
                  disabled={isPending}
                  className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-2xl text-xs font-bold text-slate-900 placeholder-slate-400 outline-none transition-all"
                  required
                />
              </div>

              {/* Selector de Fecha */}
              <div className="w-36 flex-shrink-0 relative">
                <input
                  type="date"
                  value={item.evaluation_date}
                  onChange={(e) => handleChange(index, 'evaluation_date', e.target.value)}
                  disabled={isPending}
                  className="w-full px-3 py-3 bg-[#F8FAFC] border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-2xl text-xs font-bold text-slate-900 outline-none transition-all text-center"
                  required
                />
              </div>

              <div className="w-24 flex-shrink-0 relative">
                <input
                  type="number"
                  placeholder="Peso"
                  value={item.weight || ''}
                  onChange={(e) => handleChange(index, 'weight', e.target.value)}
                  disabled={isPending}
                  min="1"
                  max="100"
                  className="w-full pl-4 pr-8 py-3 bg-[#F8FAFC] border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-2xl text-xs font-bold text-slate-900 outline-none transition-all text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-slate-400">%</span>
              </div>
              
              {evaluations.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  disabled={isPending}
                  className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-2xl transition-all"
                  title="Eliminar actividad"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Botón de Añadir */}
        <button
          type="button"
          onClick={handleAddItem}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-1.5 py-3 border border-dashed border-slate-300 hover:border-indigo-400 text-slate-500 hover:text-indigo-600 rounded-2xl font-bold text-xs transition-all active:scale-[0.99] bg-slate-50/50 hover:bg-indigo-50/10"
        >
          <Plus className="w-4 h-4" />
          Añadir Actividad
        </button>

        {/* Suma total */}
        <div className="flex items-center justify-between p-4 bg-[#FAFBFD] border border-slate-100 rounded-2xl">
          <span className="text-xs font-bold text-slate-600">Suma Total de Ponderaciones:</span>
          
          <div className="flex items-center gap-2">
            <span className={`text-sm font-black px-3.5 py-1.5 rounded-xl border ${
              totalWeight === 100 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                : totalWeight > 100 
                  ? 'bg-rose-50 border-rose-100 text-rose-700'
                  : 'bg-amber-50 border-amber-100 text-amber-700'
            }`}>
              {totalWeight}%
            </span>
            
            {totalWeight === 100 ? (
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wide">Listo</span>
            ) : totalWeight > 100 ? (
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-wide">Exceso del {totalWeight - 100}%</span>
            ) : (
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-wide">Falta {100 - totalWeight}%</span>
            )}
          </div>
        </div>

        {/* Errores */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-700 font-bold flex gap-2 items-center">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Botón de Enviar */}
        <button
          type="submit"
          disabled={!isFormValid || isPending}
          className={`w-full flex items-center justify-center gap-2 py-3.5 text-white font-bold rounded-2xl shadow-md transition-all text-xs uppercase tracking-wider ${
            isFormValid && !isPending
              ? 'bg-slate-900 hover:bg-slate-800 hover:shadow-lg active:scale-[0.98]'
              : 'bg-slate-300 pointer-events-none shadow-none'
          }`}
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Guardando Plan...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Crear Plan y Habilitar Planilla
            </>
          )}
        </button>

      </form>
    </div>
  )
}
