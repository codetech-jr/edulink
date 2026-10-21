import React from 'react'
import {
  Document,
  Page,
  View,
  Text,
} from '@react-pdf/renderer'
import { styles } from './ReciboTemplate.styles'

export interface ReciboData {
  school: {
    name: string
    rif: string
  }
  receiptNumber: string
  issuedAt: string
  transactionDate: string
  student: {
    fullName: string
    cedula: string
    courseName: string
    gradeLevel: number | string
    section: string
  }
  representative: {
    fullName: string
    cedula?: string
  }
  concept: {
    name: string
    description?: string
  }
  paymentMethod: string
  referenceNumber: string
  amountUsd: number
  amountVes: number
  exchangeRate: number
  processedBy?: string
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function ReciboTemplate({ data }: { data: ReciboData }) {
  const {
    school,
    receiptNumber,
    issuedAt,
    transactionDate,
    student,
    representative,
    concept,
    paymentMethod,
    referenceNumber,
    amountUsd,
    amountVes,
    exchangeRate,
  } = data

  return (
    <Document title={`Recibo - ${receiptNumber}`} author="EduLink">
      <Page size="LETTER" style={styles.page}>
        <View style={styles.voucherContainer}>
          {/* Sello de agua diagonal CANCELADO */}
          <View style={styles.watermarkStamp}>
            <Text style={styles.watermarkText}>CANCELADO</Text>
            <Text style={styles.watermarkSubText}>Verificado por Administración</Text>
          </View>

          {/* 1. Header con datos del plantel y número de recibo */}
          <View style={styles.headerRow}>
            <View style={styles.schoolInfo}>
              <Text style={styles.countryText}>República Bolivariana de Venezuela</Text>
              <Text style={styles.schoolName}>{school.name}</Text>
              <Text style={styles.schoolRif}>{school.rif ? `RIF: ${school.rif}` : 'Institución Educativa'}</Text>
            </View>

            <View style={styles.receiptInfo}>
              <View style={styles.receiptBadge}>
                <Text style={styles.receiptTitle}>Recibo de Pago Oficial</Text>
              </View>
              <Text style={styles.receiptNumber}>{receiptNumber}</Text>
              <Text style={styles.dateText}>Emisión: {issuedAt}</Text>
            </View>
          </View>

          {/* 2. Tarjetas de Información: Representante/Alumno y Detalle Transaccional */}
          <View style={styles.infoCardsRow}>
            {/* Columna Izquierda: Datos Estudiantiles */}
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Datos del Estudiante y Representante</Text>
              
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Representante:</Text>
                <Text style={styles.fieldValue}>{representative.fullName}</Text>
              </View>
              {representative.cedula && (
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>C.I. Repr.:</Text>
                  <Text style={styles.fieldValue}>{representative.cedula}</Text>
                </View>
              )}

              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Estudiante:</Text>
                <Text style={styles.fieldValue}>{student.fullName}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Cédula / ID:</Text>
                <Text style={styles.fieldValue}>{student.cedula || 'Sin Cédula'}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Grado / Curso:</Text>
                <Text style={styles.fieldValue}>
                  {student.courseName} ({student.gradeLevel}° &ldquo;{student.section}&rdquo;)
                </Text>
              </View>
            </View>

            {/* Columna Derecha: Datos de la Transacción */}
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Datos de la Transacción Bancaria</Text>
              
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Método de Pago:</Text>
                <Text style={styles.fieldValue}>{paymentMethod}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Nº Referencia:</Text>
                <Text style={styles.fieldValue}>{referenceNumber || 'N/A'}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Fecha de Pago:</Text>
                <Text style={styles.fieldValue}>{transactionDate}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Estado:</Text>
                <Text style={[styles.fieldValue, { color: '#059669' }]}>CONFIRMADO / CONCILIADO</Text>
              </View>
            </View>
          </View>

          {/* 3. Desglose del Concepto y Montos */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={styles.thLeft}>Concepto de Facturación</Text>
              <Text style={styles.thRight}>Importe (USD)</Text>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.tdConcept}>
                <Text style={styles.conceptName}>{concept.name}</Text>
                {concept.description && (
                  <Text style={styles.conceptDesc}>{concept.description}</Text>
                )}
              </View>
              <Text style={styles.tdAmount}>${formatMoney(amountUsd)}</Text>
            </View>

            {/* Fila de Tasa Oficial BCV */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tasa de Cambio Oficial (BCV al día de pago):</Text>
              <Text style={styles.summaryValue}>{formatMoney(exchangeRate)} Bs./USD</Text>
            </View>

            {/* Fila Total en Bolívares y USD */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Cancelado:</Text>
              <View>
                <Text style={styles.totalValueVes}>Bs. {formatMoney(amountVes)}</Text>
                <Text style={styles.totalSubUsd}>(${formatMoney(amountUsd)} USD)</Text>
              </View>
            </View>
          </View>

          {/* 4. Sección de Firmas y Sello */}
          <View style={styles.signatureSection}>
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureName}>Departamento de Administración</Text>
              <Text style={styles.signatureRole}>Recepción y Conciliación</Text>
            </View>

            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureName}>{representative.fullName}</Text>
              <Text style={styles.signatureRole}>Firma del Representante</Text>
            </View>
          </View>

          {/* 5. Footer Institucional */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Emitido por {school.name} · EduLink
            </Text>
            <Text style={styles.footerText}>
              Comprobante digital válido ante la administración escolar
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
