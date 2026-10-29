import { useState, useTransition } from 'react'
import { createEnrollmentRequestAction } from '@/actions/enrollment-actions'

export const INITIAL_FORM = {
  student_name: '',
  student_cedula: '',
  student_birth_date: '',
  grade_requested: '',
  parent_name: '',
  parent_cedula: '',
  parent_phone: '',
  parent_email: '',
  parent_relationship: 'madre',
  notes: '',
}

export function useEnrollmentForm(schoolSlug: string) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const [submittedData, setSubmittedData] = useState<{
    requestId: string
    studentName: string
  } | null>(null)

  const [formData, setFormData] = useState(INITIAL_FORM)
  const [documents, setDocuments] = useState<File[]>([])
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.student_name.trim() || formData.student_name.trim().length < 3) {
        errors.student_name = 'Ingresa el nombre completo del alumno (mínimo 3 letras)'
      }
      if (!formData.grade_requested) {
        errors.grade_requested = 'Selecciona el grado o año escolar al que aspira'
      }
    }

    if (step === 2) {
      if (!formData.parent_name.trim() || formData.parent_name.trim().length < 3) {
        errors.parent_name = 'Ingresa el nombre y apellido del representante'
      }
      if (!formData.parent_cedula.trim() || formData.parent_cedula.trim().length < 5) {
        errors.parent_cedula = 'Ingresa una cédula válida (mínimo 5 caracteres)'
      }
      const cleanPhone = formData.parent_phone.trim().replace(/\D/g, '')
      if (!/^04\d{9}$/.test(cleanPhone)) {
        errors.parent_phone = 'Formato requerido: 04XXXXXXXXX (11 dígitos, ej: 04121234567)'
      }
      if (formData.parent_email && formData.parent_email.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.parent_email.trim())) {
          errors.parent_email = 'Ingresa un correo electrónico válido'
        }
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setServerError(null)
      setCurrentStep((prev) => Math.min(prev + 1, 4))
      window.scrollTo({ top: 120, behavior: 'smooth' })
    }
  }

  const handlePrev = () => {
    setServerError(null)
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    window.scrollTo({ top: 120, behavior: 'smooth' })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const filesArray = Array.from(e.target.files)
    const newFiles: File[] = []
    let errorMsg = ''

    for (const file of filesArray) {
      if (documents.length + newFiles.length >= 3) {
        errorMsg = 'Solo puedes adjuntar hasta 3 documentos en total.'
        break
      }
      if (file.size > 5 * 1024 * 1024) {
        errorMsg = `El archivo "${file.name}" supera los 5 MB permitidos.`
        continue
      }
      newFiles.push(file)
    }

    if (errorMsg) {
      setFieldErrors((prev) => ({ ...prev, documents: errorMsg }))
    } else {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next.documents
        return next
      })
    }

    setDocuments((prev) => [...prev, ...newFiles])
    e.target.value = ''
  }

  const removeFile = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep(1) || !validateStep(2)) {
      setServerError('Por favor revisa los datos ingresados en los pasos anteriores.')
      return
    }

    setServerError(null)

    startTransition(async () => {
      try {
        const submitFormData = new FormData()
        submitFormData.append('school_slug', schoolSlug)
        submitFormData.append('student_name', formData.student_name.trim())
        submitFormData.append('student_cedula', formData.student_cedula.trim())
        submitFormData.append('student_birth_date', formData.student_birth_date)
        submitFormData.append('grade_requested', formData.grade_requested)
        submitFormData.append('parent_name', formData.parent_name.trim())
        submitFormData.append('parent_cedula', formData.parent_cedula.trim())
        submitFormData.append('parent_phone', formData.parent_phone.trim().replace(/\D/g, ''))
        submitFormData.append('parent_email', formData.parent_email.trim())
        submitFormData.append('parent_relationship', formData.parent_relationship || 'madre')
        submitFormData.append('notes', formData.notes.trim())

        documents.forEach((file) => {
          submitFormData.append('documents', file)
        })

        const result = await createEnrollmentRequestAction(submitFormData)

        if (result.error) {
          setServerError(result.error)
        } else if (result.success && result.requestId) {
          setSubmittedData({
            requestId: result.requestId,
            studentName: result.studentName || formData.student_name,
          })
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      } catch (err: unknown) { // TODO: tipado pendiente
        const msg = err instanceof Error ? err.message : 'Error inesperado al enviar la solicitud.'
        setServerError(msg)
      }
    })
  }

  const handleReset = () => {
    setSubmittedData(null)
    setCurrentStep(1)
    setFormData(INITIAL_FORM)
    setDocuments([])
    setFieldErrors({})
  }

  return {
    currentStep,
    setCurrentStep,
    isPending,
    serverError,
    submittedData,
    formData,
    documents,
    fieldErrors,
    handleChange,
    handleNext,
    handlePrev,
    handleFileChange,
    removeFile,
    handleSubmit,
    handleReset,
  }
}
