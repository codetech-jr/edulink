import { StyleSheet } from '@react-pdf/renderer'

export const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 32,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },
  // Cabecera institucional
  headerContainer: {
    textAlign: 'center',
    marginBottom: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: '#2563eb',
    paddingBottom: 8,
  },
  countryHeader: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 1,
  },
  ministryHeader: {
    fontSize: 7.5,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  schoolName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  schoolRif: {
    fontSize: 8,
    color: '#64748b',
    fontWeight: 'bold',
  },

  // Subheader con título de documento
  docTitleContainer: {
    marginTop: 4,
    marginBottom: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  docTitle: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#1e3a8a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  docPeriod: {
    fontSize: 8.5,
    color: '#475569',
    fontWeight: 'bold',
  },

  // Tarjeta de información del estudiante
  studentCard: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  studentCardRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  studentCardRowLast: {
    flexDirection: 'row',
  },
  studentCardCol: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    flexDirection: 'row',
  },
  studentCardColDivider: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    flexDirection: 'row',
    borderLeftWidth: 1,
    borderLeftColor: '#f1f5f9',
  },
  label: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase',
    width: 75,
  },
  value: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: '#0f172a',
    flex: 1,
  },

  // Tabla de calificaciones
  tableContainer: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    paddingVertical: 5,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  tableHeaderCell: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  tableHeaderCellLeft: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    textAlign: 'left',
  },
  tableRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingVertical: 4.5,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  tableRowEven: {
    backgroundColor: '#f8fafc',
  },
  colSubject: {
    flex: 3.5,
    textAlign: 'left',
  },
  colTerm: {
    flex: 1.1,
    textAlign: 'center',
  },
  colFinal: {
    flex: 1.2,
    textAlign: 'center',
  },
  colStatus: {
    flex: 1.4,
    textAlign: 'center',
  },
  subjectText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  scoreTextGreen: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: '#15803d',
  },
  scoreTextRed: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: '#b91c1c',
  },
  scoreTextNeutral: {
    fontSize: 8,
    color: '#94a3b8',
  },
  statusApproved: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#15803d',
    backgroundColor: '#dcfce7',
    paddingVertical: 1.5,
    paddingHorizontal: 4,
    borderRadius: 3,
    textAlign: 'center',
  },
  statusFailed: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#b91c1c',
    backgroundColor: '#fee2e2',
    paddingVertical: 1.5,
    paddingHorizontal: 4,
    borderRadius: 3,
    textAlign: 'center',
  },
  statusPending: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#475569',
    backgroundColor: '#f1f5f9',
    paddingVertical: 1.5,
    paddingHorizontal: 4,
    borderRadius: 3,
    textAlign: 'center',
  },

  // Fila resumen / promedio
  tableFooterRow: {
    flexDirection: 'row',
    borderTopWidth: 1.5,
    borderTopColor: '#0f172a',
    backgroundColor: '#f1f5f9',
    paddingVertical: 5,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#0f172a',
    textTransform: 'uppercase',
  },

  // Nota legal / escala
  legendBox: {
    marginTop: 2,
    marginBottom: 16,
    padding: 6,
    backgroundColor: '#f8fafc',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  legendText: {
    fontSize: 6.8,
    color: '#64748b',
    lineHeight: 1.3,
  },

  // Sección de firmas
  signaturesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 14,
    paddingHorizontal: 8,
  },
  signatureBox: {
    width: '30%',
    alignItems: 'center',
  },
  signatureLine: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#64748b',
    marginBottom: 4,
  },
  signatureTitle: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  signatureSubtitle: {
    fontSize: 6.5,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 1,
  },
  sealBox: {
    width: '28%',
    height: 48,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  sealText: {
    fontSize: 6.8,
    color: '#94a3b8',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  // Pie de página
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 32,
    right: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#cbd5e1',
    paddingTop: 4,
  },
  footerText: {
    fontSize: 6.5,
    color: '#94a3b8',
  },
})
