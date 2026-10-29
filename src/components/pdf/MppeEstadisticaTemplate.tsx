import React from 'react'
import {
  Document,
  Page,
  View,
  Text,
} from '@react-pdf/renderer'
import { styles } from './MppeEstadisticaTemplate.styles'
import { MppeStatisticsReport } from '@/lib/types/mppe-statistics'

interface MppeEstadisticaTemplateProps {
  data: MppeStatisticsReport
}

export function MppeEstadisticaTemplate({ data }: MppeEstadisticaTemplateProps) {
  const {
    school,
    schoolYear,
    cutOffDate,
    monthName,
    standardAges,
    hasUnder11,
    hasOver19,
    rows,
    summary,
  } = data

  const displayAges: string[] = []
  if (hasUnder11) displayAges.push('<11')
  displayAges.push(...standardAges.map(String))
  if (hasOver19) displayAges.push('>19')

  return (
    <Document
      title={`Estadistica_MPPE_${monthName}_${schoolYear.name}`}
      author="EduLink"
    >
      <Page size="LETTER" orientation="landscape" style={styles.page}>
        {/* 1. Encabezado Oficial */}
        <View style={styles.headerContainer}>
          <Text style={styles.countryHeader}>República Bolivariana de Venezuela</Text>
          <Text style={styles.ministryHeader}>Ministerio del Poder Popular para la Educación</Text>
          <Text style={styles.schoolName}>{school.name}</Text>
          <Text style={styles.schoolLocation}>
            {[school.municipality, school.state].filter(Boolean).join(' - ') || 'Venezuela'}
            {school.rif ? ` • RIF: ${school.rif}` : ''}
          </Text>
        </View>

        {/* 2. Barra de Metadatos */}
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            MES: <Text style={styles.metaTextBold}>{monthName.toUpperCase()}</Text>
          </Text>
          <Text style={styles.docTitle}>ESTADÍSTICA POR EDADES Y SEXO</Text>
          <Text style={styles.metaText}>
            Año escolar: <Text style={styles.metaTextBold}>{schoolYear.name}</Text>
            {'   '}FECHA: <Text style={styles.metaTextBold}>{cutOffDate}</Text>
          </Text>
        </View>

        {/* 3. Tabla Matricial */}
        <View style={styles.tableContainer}>
          {/* Encabezado Nivel 1 */}
          <View style={[styles.tableRow, styles.tableRowHeaderL1]}>
            <Text style={styles.cellGrade}>Año / Sección</Text>
            {displayAges.map((age) => (
              <Text key={`h1-${age}`} style={styles.cellAgeGroup}>
                {age === '<11' ? '< 11' : age === '>19' ? '> 19' : `${age} AÑOS`}
              </Text>
            ))}
            <Text style={styles.cellTotalGroup}>TOTAL</Text>
            <Text style={styles.cellPctGroup}>%</Text>
          </View>

          {/* Encabezado Nivel 2 */}
          <View style={[styles.tableRow, styles.tableRowHeaderL2]}>
            <Text style={styles.cellGrade}> </Text>
            {displayAges.map((age) => (
              <React.Fragment key={`h2-${age}`}>
                <Text style={styles.cellSubV}>V</Text>
                <Text style={styles.cellSubH}>H</Text>
                <Text style={styles.cellSubT}>T</Text>
              </React.Fragment>
            ))}
            <Text style={styles.cellSubV}>V</Text>
            <Text style={styles.cellSubH}>H</Text>
            <Text style={styles.cellSubTotalT}>T</Text>
            <Text style={styles.cellSubPct}>%V</Text>
            <Text style={styles.cellSubPct}>%H</Text>
          </View>

          {/* Filas por Curso */}
          {rows.map((row) => {
            const pctV = row.totalStudents > 0 ? ((row.totalVarones / row.totalStudents) * 100).toFixed(0) : '0'
            const pctH = row.totalStudents > 0 ? ((row.totalHembras / row.totalStudents) * 100).toFixed(0) : '0'

            return (
              <View key={`row-${row.courseId}`} style={styles.tableRow}>
                <Text style={styles.cellGrade}>{row.courseName}</Text>
                {displayAges.map((age) => {
                  const count = row.byAge[age] || { varones: 0, hembras: 0, total: 0 }
                  return (
                    <React.Fragment key={`cell-${row.courseId}-${age}`}>
                      <Text style={styles.cellSubV}>{count.varones || '-'}</Text>
                      <Text style={styles.cellSubH}>{count.hembras || '-'}</Text>
                      <Text style={styles.cellSubT}>{count.total || '-'}</Text>
                    </React.Fragment>
                  )
                })}
                <Text style={styles.cellSubV}>{row.totalVarones || '-'}</Text>
                <Text style={styles.cellSubH}>{row.totalHembras || '-'}</Text>
                <Text style={styles.cellSubTotalT}>{row.totalStudents || '-'}</Text>
                <Text style={styles.cellSubPct}>{row.totalStudents > 0 ? `${pctV}%` : '-'}</Text>
                <Text style={styles.cellSubPct}>{row.totalStudents > 0 ? `${pctH}%` : '-'}</Text>
              </View>
            )
          })}

          {/* Fila TOTAL GENERAL */}
          <View style={[styles.tableRow, styles.tableRowFooter]}>
            <Text style={styles.cellGrade}>TOTAL</Text>
            {displayAges.map((age) => {
              const count = summary.byAge[age] || { varones: 0, hembras: 0, total: 0 }
              return (
                <React.Fragment key={`tot-${age}`}>
                  <Text style={styles.cellSubV}>{count.varones || '-'}</Text>
                  <Text style={styles.cellSubH}>{count.hembras || '-'}</Text>
                  <Text style={styles.cellSubT}>{count.total || '-'}</Text>
                </React.Fragment>
              )
            })}
            <Text style={styles.cellSubV}>{summary.totalVarones}</Text>
            <Text style={styles.cellSubH}>{summary.totalHembras}</Text>
            <Text style={styles.cellSubTotalT}>{summary.totalStudents}</Text>
            <Text style={styles.cellSubPct}>{summary.percentVarones}%</Text>
            <Text style={styles.cellSubPct}>{summary.percentHembras}%</Text>
          </View>

          {/* Fila PORCENTAJES (%) */}
          <View style={[styles.tableRow, styles.tableRowPct]}>
            <Text style={styles.cellGrade}>% EDAD</Text>
            {displayAges.map((age) => {
              const count = summary.byAge[age] || { varones: 0, hembras: 0, total: 0 }
              const pct = summary.totalStudents > 0
                ? ((count.total / summary.totalStudents) * 100).toFixed(1)
                : '0.0'
              return (
                <Text key={`pct-row-${age}`} style={styles.cellAgeGroup}>
                  {count.total > 0 ? `${pct}%` : '-'}
                </Text>
              )
            })}
            <Text style={styles.cellTotalGroup}>100%</Text>
            <Text style={styles.cellPctGroup}>—</Text>
          </View>
        </View>

        {/* 4. Bloque Oficial de Firmas y Sello */}
        <View style={styles.signaturesContainer}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureTitle}>Dirección del Plantel</Text>
            <Text style={styles.signatureSubtitle}>Firma y Cédula</Text>
          </View>

          <View style={styles.sealBox}>
            <Text style={styles.sealText}>Sello del Plantel</Text>
          </View>

          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureTitle}>Control de Estudios</Text>
            <Text style={styles.signatureSubtitle}>Firma y Cédula</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
