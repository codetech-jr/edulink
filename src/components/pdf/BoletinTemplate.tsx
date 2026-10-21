import React from 'react'
import {
  Document,
  Page,
  View,
  Text,
} from '@react-pdf/renderer'
import { styles } from './BoletinTemplate.styles'

export interface SubjectGradeRow {
  subjectName: string
  term1Score: number | null
  term2Score: number | null
  term3Score: number | null
  finalScore: number | null
  status: 'Aprobado' | 'Reprobado' | 'Pendiente'
}

export interface BoletinData {
  school: {
    name: string
    rif: string
  }
  student: {
    fullName: string
    cedula: string
    listNumber: number | string
  }
  course: {
    name: string
    gradeLevel: number | string
    section: string
  }
  schoolYear: string
  termTitle?: string
  directorName?: string
  teacherName?: string
  subjects: SubjectGradeRow[]
  overallAverage: number | null
  overallStatus: 'Aprobado' | 'Reprobado' | 'Pendiente'
  issuedAt: string
}

function renderScore(score: number | null) {
  if (score === null || score === undefined) {
    return <Text style={styles.scoreTextNeutral}>-</Text>
  }
  const formatted = score.toFixed(1)
  const isPassing = score >= 10
  return (
    <Text style={isPassing ? styles.scoreTextGreen : styles.scoreTextRed}>
      {formatted}
    </Text>
  )
}

export function BoletinTemplate({ data }: { data: BoletinData }) {
  const {
    school,
    student,
    course,
    schoolYear,
    termTitle = 'Boletín de Calificaciones',
    directorName = 'Dirección del Plantel',
    teacherName,
    subjects,
    overallAverage,
    overallStatus,
    issuedAt,
  } = data

  return (
    <Document title={`Boletin - ${student.fullName}`} author="EduLink">
      <Page size="LETTER" style={styles.page}>
        {/* 1. Header Oficial */}
        <View style={styles.headerContainer}>
          <Text style={styles.countryHeader}>República Bolivariana de Venezuela</Text>
          <Text style={styles.ministryHeader}>Ministerio del Poder Popular para la Educación</Text>
          <Text style={styles.schoolName}>{school.name}</Text>
          <Text style={styles.schoolRif}>{school.rif ? `RIF: ${school.rif}` : 'Institución Educativa'}</Text>
        </View>

        {/* 2. Subheader con título y lapso */}
        <View style={styles.docTitleContainer}>
          <Text style={styles.docTitle}>{termTitle}</Text>
          <Text style={styles.docPeriod}>Año Escolar {schoolYear}</Text>
        </View>

        {/* 3. Ficha descriptiva del estudiante */}
        <View style={styles.studentCard}>
          <View style={styles.studentCardRow}>
            <View style={styles.studentCardCol}>
              <Text style={styles.label}>Estudiante:</Text>
              <Text style={styles.value}>{student.fullName}</Text>
            </View>
            <View style={styles.studentCardColDivider}>
              <Text style={styles.label}>Cédula / ID:</Text>
              <Text style={styles.value}>{student.cedula || 'Sin Cédula'}</Text>
            </View>
          </View>
          <View style={styles.studentCardRowLast}>
            <View style={styles.studentCardCol}>
              <Text style={styles.label}>Curso / Sección:</Text>
              <Text style={styles.value}>
                {course.name} ({course.gradeLevel}° &ldquo;{course.section}&rdquo;)
              </Text>
            </View>
            <View style={styles.studentCardColDivider}>
              <Text style={styles.label}>Nº de Lista:</Text>
              <Text style={styles.value}>{student.listNumber || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* 4. Tabla de Notas MPPE */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <View style={styles.colSubject}>
              <Text style={styles.tableHeaderCellLeft}>Asignatura</Text>
            </View>
            <View style={styles.colTerm}>
              <Text style={styles.tableHeaderCell}>1er Lapso</Text>
            </View>
            <View style={styles.colTerm}>
              <Text style={styles.tableHeaderCell}>2do Lapso</Text>
            </View>
            <View style={styles.colTerm}>
              <Text style={styles.tableHeaderCell}>3er Lapso</Text>
            </View>
            <View style={styles.colFinal}>
              <Text style={styles.tableHeaderCell}>Definitiva</Text>
            </View>
            <View style={styles.colStatus}>
              <Text style={styles.tableHeaderCell}>Condición</Text>
            </View>
          </View>

          {subjects.map((sub, idx) => {
            const isEven = idx % 2 === 1
            return (
              <View
                key={idx}
                style={[styles.tableRow, isEven ? styles.tableRowEven : {}]}
              >
                <View style={styles.colSubject}>
                  <Text style={styles.subjectText}>{sub.subjectName}</Text>
                </View>
                <View style={styles.colTerm}>{renderScore(sub.term1Score)}</View>
                <View style={styles.colTerm}>{renderScore(sub.term2Score)}</View>
                <View style={styles.colTerm}>{renderScore(sub.term3Score)}</View>
                <View style={styles.colFinal}>{renderScore(sub.finalScore)}</View>
                <View style={styles.colStatus}>
                  {sub.status === 'Aprobado' ? (
                    <Text style={styles.statusApproved}>Aprobado</Text>
                  ) : sub.status === 'Reprobado' ? (
                    <Text style={styles.statusFailed}>Reprobado</Text>
                  ) : (
                    <Text style={styles.statusPending}>Pendiente</Text>
                  )}
                </View>
              </View>
            )
          })}

          {/* Fila de Promedio General */}
          <View style={styles.tableFooterRow}>
            <View style={styles.colSubject}>
              <Text style={styles.footerLabel}>Promedio General:</Text>
            </View>
            <View style={styles.colTerm}>
              <Text style={styles.scoreTextNeutral}>-</Text>
            </View>
            <View style={styles.colTerm}>
              <Text style={styles.scoreTextNeutral}>-</Text>
            </View>
            <View style={styles.colTerm}>
              <Text style={styles.scoreTextNeutral}>-</Text>
            </View>
            <View style={styles.colFinal}>
              {overallAverage !== null ? (
                <Text
                  style={
                    overallAverage >= 10
                      ? styles.scoreTextGreen
                      : styles.scoreTextRed
                  }
                >
                  {overallAverage.toFixed(2)}
                </Text>
              ) : (
                <Text style={styles.scoreTextNeutral}>-</Text>
              )}
            </View>
            <View style={styles.colStatus}>
              {overallStatus === 'Aprobado' ? (
                <Text style={styles.statusApproved}>APROBADO</Text>
              ) : overallStatus === 'Reprobado' ? (
                <Text style={styles.statusFailed}>REPROBADO</Text>
              ) : (
                <Text style={styles.statusPending}>EN CURSO</Text>
              )}
            </View>
          </View>
        </View>

        {/* 5. Leyenda informativa reglamentaria */}
        <View style={styles.legendBox}>
          <Text style={styles.legendText}>
            Escala de Evaluación: 01 a 20 puntos vigentes según la Ley Orgánica de Educación y RGLOPE.
            Calificación mínima aprobatoria: 10 puntos. Nota por Lapso = Suma ponderada de evaluaciones.
            Nota Definitiva = Promedio de calificaciones obtenidas en los lapsos cursados.
          </Text>
        </View>

        {/* 6. Sección de Firmas y Sello */}
        <View style={styles.signaturesContainer}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureTitle}>{directorName}</Text>
            <Text style={styles.signatureSubtitle}>Director(a) del Plantel</Text>
          </View>

          <View style={styles.sealBox}>
            <Text style={styles.sealText}>SELLO HÚMEDO</Text>
            <Text style={styles.sealText}>DEL PLANTEL</Text>
          </View>

          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureTitle}>
              {teacherName || 'Docente Guía / Coordinador'}
            </Text>
            <Text style={styles.signatureSubtitle}>Coordinación Pedagógica</Text>
          </View>
        </View>

        {/* 7. Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Documento oficial generado por la plataforma escolar EduLink — {issuedAt}
          </Text>
          <Text style={styles.footerText}>
            Validez institucional sujeta a firma y sello del plantel
          </Text>
        </View>
      </Page>
    </Document>
  )
}
