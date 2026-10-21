import { useState } from 'react'

interface Student {
  id: string
  full_name: string
  list_number: number | null
}

interface UseBoletinesZipOptions {
  students: Student[]
  termId: string
  termName: string
  courseName: string
  onSuccess: (msg: string) => void
  onError: (msg: string) => void
}

export function useBoletinesZip({
  students,
  termId,
  termName,
  courseName,
  onSuccess,
  onError,
}: UseBoletinesZipOptions) {
  const [isDownloadingZip, setIsDownloadingZip] = useState(false)
  const [zipProgress, setZipProgress] = useState<string | null>(null)

  const downloadBoletinesZip = async () => {
    if (students.length === 0) return
    setIsDownloadingZip(true)
    setZipProgress(`Preparando boletines (0/${students.length})...`)

    try {
      const JSZipModule = await import('jszip')
      const JSZip = JSZipModule.default || JSZipModule
      const zip = new JSZip()

      for (let i = 0; i < students.length; i++) {
        const student = students[i]
        setZipProgress(`Generando ${i + 1}/${students.length}: ${student.full_name}...`)

        const url = `/api/boletin/${student.id}${termId ? `?termId=${encodeURIComponent(termId)}` : ''}`
        const res = await fetch(url)
        if (!res.ok) {
          throw new Error(`Error al generar el boletín del estudiante: ${student.full_name}`)
        }
        const arrayBuffer = await res.arrayBuffer()
        const listNum = student.list_number
          ? `${String(student.list_number).padStart(2, '0')}_`
          : `${String(i + 1).padStart(2, '0')}_`
        const cleanName = student.full_name
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-zA-Z0-9]/g, '_')
          .toLowerCase()

        zip.file(`${listNum}${cleanName}_boletin.pdf`, arrayBuffer)
      }

      setZipProgress('Comprimiendo archivo ZIP...')
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const downloadUrl = URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = downloadUrl
      const cleanCourse = courseName.replace(/[^a-zA-Z0-9]/g, '_')
      const cleanTerm = termName.replace(/[^a-zA-Z0-9]/g, '_')
      a.download = `boletines_${cleanCourse}_${cleanTerm}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(downloadUrl)

      onSuccess(`¡Archivo ZIP con ${students.length} boletines descargado exitosamente!`)
    } catch (err: unknown) { // TODO: tipado pendiente
      const msg = err instanceof Error ? err.message : 'Error al descargar los boletines en ZIP.'
      onError(msg)
    } finally {
      setIsDownloadingZip(false)
      setZipProgress(null)
    }
  }

  return {
    isDownloadingZip,
    zipProgress,
    downloadBoletinesZip,
  }
}
