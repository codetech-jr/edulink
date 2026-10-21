import React from 'react'
import {
  Document,
  Page,
  View,
  Text,
} from '@react-pdf/renderer'
import { styles } from './EstadoCuentaTemplate.styles'

export interface EstadoCuentaPayment {
  date: string
  concept: string
  method: string
  reference: string
  amountUsd: number
  status: 'confirmado' | 'pendiente' | 'rechazado'
}

export interface EstadoCuentaData {
  school: {
    name: string
    rif: string
  }
  student: {
    fullName: string
    cedula: string
    courseName: string
    gradeLevel: number | string
    section: string
    listNumber?: number | null
  }
  representative: {
    fullName: string
    cedula?: string
    phone?: string
  }
  issuedAt: string
  currentMonth: string
  currentStatus: 'al_dia' | 'pendiente' | 'moroso'
  bcvRate: number
  summary: {
    totalPaidUsd: number
    totalPendingUsd: number
    totalDebtUsd: number
    totalDebtVes: number
  }
  paymentHistory: EstadoCuentaPayment[]
}

export function EstadoCuentaTemplate({ data }: { data: EstadoCuentaData }) {
  const statusLabel =
    data.currentStatus === 'al_dia'
      ? 'AL DÍA'
      : data.currentStatus === 'pendiente'
      ? 'EN REVISIÓN'
      : 'MOROSO / PENDIENTE'

  const statusStyle =
    data.currentStatus === 'al_dia'
      ? styles.badgeAlDia
      : data.currentStatus === 'pendiente'
      ? styles.badgePendiente
      : styles.badgeMoroso

  return (
    <Document title={`Estado de Cuenta - ${data.student.fullName}`}>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.container}>
          {/* Cabecera */}
          <View style={styles.headerRow}>
            <View style={styles.schoolInfo}>
              <Text style={styles.countryText}>República Bolivariana de Venezuela</Text>
              <Text style={styles.schoolName}>{data.school.name}</Text>
              <Text style={styles.schoolRif}>R.I.F.: {data.school.rif}</Text>
            </View>
            <View style={styles.docHeader}>
              <Text style={styles.docTitle}>ESTADO DE CUENTA</Text>
              <Text style={styles.docSubtitle}>Emisión: {data.issuedAt}</Text>
              <Text style={[styles.statusBadge, statusStyle]}>{statusLabel}</Text>
            </View>
          </View>

          {/* Ficha del Alumno y Representante */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCol}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Estudiante:</Text>
                <Text style={styles.infoVal}>{data.student.fullName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Cédula / Id:</Text>
                <Text style={styles.infoVal}>{data.student.cedula || 'Sin cédula'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Grado / Curso:</Text>
                <Text style={styles.infoVal}>
                  {data.student.gradeLevel}° &ldquo;{data.student.section}&rdquo; - {data.student.courseName}
                </Text>
              </View>
            </View>

            <View style={styles.infoCol}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Representante:</Text>
                <Text style={styles.infoVal}>{data.representative.fullName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Teléfono:</Text>
                <Text style={styles.infoVal}>{data.representative.phone || 'No registrado'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Mes Vigente:</Text>
                <Text style={styles.infoVal}>{data.currentMonth}</Text>
              </View>
            </View>
          </View>

          {/* Tarjetas de Resumen Financiero */}
          <Text style={styles.sectionTitle}>Balance Financiero Consolidado</Text>
          <View style={styles.summaryCardsRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.cardLabel}>Total Pagado (USD)</Text>
              <Text style={[styles.cardValue, { color: '#059669' }]}>
                ${data.summary.totalPaidUsd.toFixed(2)}
              </Text>
              <Text style={styles.cardSub}>Comprobantes confirmados</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.cardLabel}>Por Verificar (USD)</Text>
              <Text style={[styles.cardValue, { color: '#d97706' }]}>
                ${data.summary.totalPendingUsd.toFixed(2)}
              </Text>
              <Text style={styles.cardSub}>En proceso de conciliación</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.cardLabel}>Deuda Pendiente (USD)</Text>
              <Text style={[styles.cardValue, { color: data.summary.totalDebtUsd > 0 ? '#dc2626' : '#059669' }]}>
                ${data.summary.totalDebtUsd.toFixed(2)}
              </Text>
              <Text style={styles.cardSub}>Saldo adeudado</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.cardLabel}>Deuda en Bolívares (BCV)</Text>
              <Text style={[styles.cardValue, { color: '#1e293b' }]}>
                Bs. {data.summary.totalDebtVes.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              <Text style={styles.cardSub}>Tasa: {data.bcvRate.toFixed(2)} Bs/$</Text>
            </View>
          </View>

          {/* Historial de Pagos */}
          <Text style={styles.sectionTitle}>Historial de Pagos y Comprobantes</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.thText, styles.colDate]}>Fecha</Text>
              <Text style={[styles.thText, styles.colConcept]}>Concepto</Text>
              <Text style={[styles.thText, styles.colMethod]}>Método</Text>
              <Text style={[styles.thText, styles.colRef]}>Referencia</Text>
              <Text style={[styles.thText, styles.colAmount]}>Monto</Text>
              <Text style={[styles.thText, styles.colStatus]}>Estado</Text>
            </View>

            {data.paymentHistory.length === 0 ? (
              <View style={[styles.tableRow, { justifyContent: 'center', paddingVertical: 12 }]}>
                <Text style={[styles.tdText, { color: '#94a3b8' }]}>
                  No se registran transacciones para este estudiante durante el período escolar.
                </Text>
              </View>
            ) : (
              data.paymentHistory.map((item, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={[styles.tdText, styles.colDate]}>{item.date}</Text>
                  <Text style={[styles.tdText, styles.colConcept]}>{item.concept}</Text>
                  <Text style={[styles.tdText, styles.colMethod]}>{item.method}</Text>
                  <Text style={[styles.tdText, styles.colRef]}>{item.reference || 'S/R'}</Text>
                  <Text style={[styles.tdText, styles.colAmount, { fontFamily: 'Helvetica-Bold' }]}>
                    ${item.amountUsd.toFixed(2)}
                  </Text>
                  <Text
                    style={[
                      styles.tdText,
                      styles.colStatus,
                      {
                        fontFamily: 'Helvetica-Bold',
                        color:
                          item.status === 'confirmado'
                            ? '#059669'
                            : item.status === 'pendiente'
                            ? '#d97706'
                            : '#dc2626',
                      },
                    ]}
                  >
                    {item.status === 'confirmado'
                      ? 'Conf.'
                      : item.status === 'pendiente'
                      ? 'Pend.'
                      : 'Rech.'}
                  </Text>
                </View>
              ))
            )}
          </View>

          {/* Firmas y Pie de Página */}
          <View style={styles.footerRow}>
            <View style={styles.noticeBox}>
              <Text style={styles.noticeText}>
                Documento informativo generado electrónicamente a través de la plataforma EduLink.
                Los cálculos expresados en Bolívares están referenciados al tipo de cambio oficial del Banco Central de Venezuela.
              </Text>
            </View>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureText}>Administración y Cobranzas</Text>
              <Text style={[styles.signatureText, { fontSize: 6.5, marginTop: 1 }]}>Sello y Firma Digital</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}
