import { StyleSheet } from '@react-pdf/renderer'

export const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 36,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },
  // Contenedor principal con borde tipo comprobante
  voucherContainer: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 20,
    position: 'relative',
    minHeight: 520,
  },
  // Cabecera superior
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1.5,
    borderBottomColor: '#059669', // Emerald
    paddingBottom: 14,
    marginBottom: 14,
  },
  schoolInfo: {
    flex: 1.5,
  },
  countryText: {
    fontSize: 7.5,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  schoolName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  schoolRif: {
    fontSize: 8,
    color: '#475569',
    fontWeight: 'bold',
  },
  receiptInfo: {
    flex: 1.2,
    alignItems: 'flex-end',
  },
  receiptBadge: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  receiptTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#047857',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  receiptNumber: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0f172a',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 8,
    color: '#64748b',
  },

  // Ficha informativa de dos columnas
  infoCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 10,
  },
  infoCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    backgroundColor: '#f8fafc',
    padding: 9,
  },
  cardTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#059669',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 4,
    marginBottom: 6,
  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  fieldLabel: {
    width: 80,
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  fieldValue: {
    flex: 1,
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1e293b',
  },

  // Sección de la tabla de montos
  tableContainer: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 6,
    marginBottom: 14,
    position: 'relative',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  thLeft: {
    flex: 3,
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  thRight: {
    flex: 1.2,
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  tdConcept: {
    flex: 3,
  },
  conceptName: {
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 2,
  },
  conceptDesc: {
    fontSize: 7.5,
    color: '#64748b',
  },
  tdAmount: {
    flex: 1.2,
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'right',
  },

  // Fila resumen / totales
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 8,
    color: '#475569',
    fontWeight: 'bold',
  },
  summaryValue: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  totalRow: {
    flexDirection: 'row',
    backgroundColor: '#ecfdf5',
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#047857',
    textTransform: 'uppercase',
  },
  totalValueVes: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#047857',
    textAlign: 'right',
  },
  totalSubUsd: {
    fontSize: 8.5,
    color: '#065f46',
    textAlign: 'right',
    marginTop: 1,
  },

  // Sello diagonal "CANCELADO"
  watermarkStamp: {
    position: 'absolute',
    top: 260,
    left: '32%',
    borderWidth: 3.5,
    borderColor: '#10b981', // Emerald 500
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 18,
    transform: 'rotate(-16deg)',
    opacity: 0.85,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  watermarkText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#059669',
    textTransform: 'uppercase',
    letterSpacing: 2.5,
    textAlign: 'center',
  },
  watermarkSubText: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#047857',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 2,
  },

  // Sección de firma
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingHorizontal: 12,
  },
  signatureBlock: {
    width: '42%',
    alignItems: 'center',
  },
  signatureLine: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#64748b',
    marginBottom: 4,
  },
  signatureName: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
  },
  signatureRole: {
    fontSize: 7,
    color: '#64748b',
    textAlign: 'center',
  },

  // Footer
  footer: {
    marginTop: 20,
    borderTopWidth: 0.5,
    borderTopColor: '#cbd5e1',
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 6.8,
    color: '#94a3b8',
  },
})
