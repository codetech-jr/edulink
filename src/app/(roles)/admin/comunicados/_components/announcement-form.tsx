'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import {
  Megaphone,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Bell,
  Send,
  Sparkles,
  FileText,
} from 'lucide-react'
import { createAnnouncementAction } from '@/actions/communication-actions'
import { PREDEFINED_TEMPLATES } from '@/lib/constants/communication-templates'
import { AnnouncementAudienceSelector } from './AnnouncementAudienceSelector'
import { AnnouncementVariablesToolbar } from './AnnouncementVariablesToolbar'
import { AnnouncementEditorPreview } from './AnnouncementEditorPreview'

export interface CourseOption {
  id: string
  name: string
  grade_level: string | number
  section: string
}

interface AnnouncementFormProps {
  courses?: CourseOption[]
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm cursor-pointer min-h-[44px]"
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Publicando Comunicado…
        </>
      ) : (
        <>
          <Send className="w-4 h-4" />
          Publicar Comunicado
        </>
      )}
    </button>
  )
}

export function AnnouncementForm({ courses = [] }: AnnouncementFormProps) {
  const [state, formAction] = useFormState(createAnnouncementAction, {
    error: null,
    success: false,
  })
  const formRef = useRef<HTMLFormElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Estado del formulario
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('custom')
  const [title, setTitle] = useState<string>('')
  const [category, setCategory] = useState<'urgente' | 'informativo' | 'recordatorio'>('informativo')
  const [body, setBody] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor')

  // Audiencia seleccionada
  const [audienceType, setAudienceType] = useState<'todos' | 'grado' | 'seccion'>('todos')
  const [selectedGrade, setSelectedGrade] = useState<string>('')
  const [selectedSection, setSelectedSection] = useState<string>('')

  const distinctGrades = Array.from(
    new Set(courses.map((c) => String(c.grade_level)))
  ).sort()

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId)
    if (templateId === 'custom') return
    const template = PREDEFINED_TEMPLATES.find((t) => t.id === templateId)
    if (template) {
      setTitle(template.subject)
      setCategory(template.category)
      setBody(template.body)
    }
  }

  const insertVariableAtCursor = (variableTag: string) => {
    const textarea = textareaRef.current
    if (!textarea) {
      setBody((prev) => (prev ? `${prev} ${variableTag}` : variableTag))
      return
    }

    const start = textarea.selectionStart ?? body.length
    const end = textarea.selectionEnd ?? body.length
    const nextBody = body.substring(0, start) + variableTag + body.substring(end)
    setBody(nextBody)

    setTimeout(() => {
      textarea.focus()
      const newPos = start + variableTag.length
      textarea.setSelectionRange(newPos, newPos)
    }, 10)
  }

  useEffect(() => {
    if (state?.success) {
      setTitle('')
      setBody('')
      setCategory('informativo')
      setSelectedTemplateId('custom')
      setAudienceType('todos')
      setSelectedGrade('')
      setSelectedSection('')
      setActiveTab('editor')
      if (formRef.current) {
        formRef.current.reset()
      }
    }
  }, [state?.success])

  let resolvedAudience = 'todos'
  if (audienceType === 'grado' && selectedGrade) {
    resolvedAudience = `Grado: ${selectedGrade}`
  } else if (audienceType === 'seccion' && selectedSection) {
    resolvedAudience = `Sección: ${selectedSection}`
  } else if (audienceType !== 'todos') {
    resolvedAudience = audienceType
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
      {/* Cabecera del Panel */}
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="bg-emerald-600 w-1.5 h-5 rounded-full inline-block" />
            Nuevo Comunicado Oficial
          </h2>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            Plantillas
          </span>
        </div>
        <p className="text-gray-500 text-xs mt-1 font-medium">
          Redacta o utiliza una plantilla oficial con variables dinámicas para notificar a la comunidad.
        </p>
      </div>

      <form action={formAction} ref={formRef} className="p-6 space-y-5">
        <input type="hidden" name="target_audience" value={resolvedAudience} />

        {/* Notificación de Error */}
        {state?.error && (
          <div
            role="alert"
            aria-live="polite"
            className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 font-semibold animate-in fade-in duration-200"
          >
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{state.error}</span>
          </div>
        )}

        {/* Notificación de Éxito */}
        {state?.success && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-start gap-3 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 font-semibold animate-in fade-in duration-200"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>¡Comunicado publicado con éxito! El feed y los portales se han actualizado.</span>
          </div>
        )}

        {/* 1. Selector de Plantilla Predefinida */}
        <div className="space-y-1.5">
          <label
            htmlFor="template_select"
            className="flex items-center justify-between text-xs font-bold text-gray-700"
          >
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              Cargar Plantilla Oficial
            </span>
            <span className="text-[10px] text-gray-400 font-normal">Opcional</span>
          </label>
          <div className="relative">
            <select
              id="template_select"
              value={selectedTemplateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-indigo-50/30 border border-indigo-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer appearance-none min-h-[44px]"
            >
              <option value="custom">✏️ Redacción Personalizada (En blanco)</option>
              {PREDEFINED_TEMPLATES.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id}>
                  📄 {tmpl.name} ({tmpl.category})
                </option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400 text-xs font-bold">
              ▼
            </div>
          </div>
        </div>

        {/* 2. Título del Comunicado */}
        <div className="space-y-1.5">
          <label htmlFor="title" className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
            <Megaphone className="w-3.5 h-3.5 text-emerald-600" />
            Título del Comunicado
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Recordatorio de Pago de Mensualidad"
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all min-h-[44px]"
          />
        </div>

        {/* 3. Categoría y Audiencia */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="category" className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
              <Bell className="w-3.5 h-3.5 text-emerald-600" />
              Categoría
            </label>
            <div className="relative">
              <select
                id="category"
                name="category"
                required
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as 'urgente' | 'informativo' | 'recordatorio')
                }
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all cursor-pointer appearance-none min-h-[44px]"
              >
                <option value="informativo">ℹ️ Informativo</option>
                <option value="recordatorio">📅 Recordatorio</option>
                <option value="urgente">🚨 Urgente</option>
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs font-bold">
                ▼
              </div>
            </div>
          </div>

          <AnnouncementAudienceSelector
            audienceType={audienceType}
            setAudienceType={setAudienceType}
            selectedGrade={selectedGrade}
            setSelectedGrade={setSelectedGrade}
            selectedSection={selectedSection}
            setSelectedSection={setSelectedSection}
            courses={courses}
            distinctGrades={distinctGrades}
          />
        </div>

        {/* 4. Toolbar de Variables Dinámicas */}
        <AnnouncementVariablesToolbar
          body={body}
          onInsertVariable={insertVariableAtCursor}
        />

        {/* 5. Editor y Vista Previa */}
        <AnnouncementEditorPreview
          body={body}
          setBody={setBody}
          title={title}
          textareaRef={textareaRef}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* 6. Botón de Publicación */}
        <div className="pt-2">
          <SubmitButton />
        </div>
      </form>
    </div>
  )
}
