import { StyleSheet } from '@react-pdf/renderer'

export const styles = StyleSheet.create({
  page: {
    paddingTop: 18,
    paddingBottom: 18,
    paddingHorizontal: 22,
    fontSize: 7.5,
    fontFamily: 'Helvetica',
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },

  // 1. Cabecera oficial MPPE
  headerContainer: {
    textAlign: 'center',
    marginBottom: 8,
  },
  countryHeader: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#334155',
    marginBottom: 1,
  },
  ministryHeader: {
    fontSize: 7.5,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 1,
  },
  schoolName: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    color: '#0f172a',
    marginBottom: 1,
  },
  schoolLocation: {
    fontSize: 7,
    color: '#64748b',
    marginBottom: 4,
  },

  // Fila de metadatos (Año Escolar, Fecha, Mes)
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: '#f8fafc',
    borderWidth: 0.5,
    borderColor: '#cbd5e1',
    borderRadius: 3,
    marginBottom: 6,
  },
  metaText: {
    fontSize: 7.5,
    color: '#1e293b',
  },
  metaTextBold: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },
  docTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#0f172a',
  },

  // 2. Tabla matricial
  tableContainer: {
    borderWidth: 0.8,
    borderColor: '#334155',
    marginBottom: 12,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#94a3b8',
    alignItems: 'center',
    minHeight: 14,
  },
  tableRowHeaderL1: {
    backgroundColor: '#e2e8f0',
    borderBottomWidth: 0.8,
    borderBottomColor: '#475569',
    minHeight: 14,
  },
  tableRowHeaderL2: {
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 0.8,
    borderBottomColor: '#334155',
    minHeight: 12,
  },
  tableRowFooter: {
    backgroundColor: '#e2e8f0',
    borderTopWidth: 1,
    borderTopColor: '#0f172a',
    minHeight: 15,
  },
  tableRowPct: {
    backgroundColor: '#f8fafc',
    minHeight: 13,
  },

  // Celdas
  cellGrade: {
    width: 65,
    paddingLeft: 4,
    paddingRight: 2,
    borderRightWidth: 0.8,
    borderRightColor: '#475569',
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
  },
  cellAgeGroup: {
    flex: 3,
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    borderRightWidth: 0.8,
    borderRightColor: '#475569',
    paddingVertical: 1,
  },
  cellTotalGroup: {
    flex: 3,
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    backgroundColor: '#cbd5e1',
    borderRightWidth: 0.8,
    borderRightColor: '#475569',
    paddingVertical: 1,
  },
  cellPctGroup: {
    flex: 2,
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    paddingVertical: 1,
  },

  // Subceldas individuales (V, H, T)
  cellSubV: {
    flex: 1,
    textAlign: 'center',
    fontSize: 6.5,
    borderRightWidth: 0.4,
    borderRightColor: '#cbd5e1',
    paddingVertical: 1,
  },
  cellSubH: {
    flex: 1,
    textAlign: 'center',
    fontSize: 6.5,
    borderRightWidth: 0.4,
    borderRightColor: '#cbd5e1',
    paddingVertical: 1,
  },
  cellSubT: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
    fontSize: 6.5,
    borderRightWidth: 0.8,
    borderRightColor: '#475569',
    paddingVertical: 1,
    backgroundColor: '#f8fafc',
  },
  cellSubTotalT: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
    fontSize: 6.8,
    borderRightWidth: 0.8,
    borderRightColor: '#475569',
    paddingVertical: 1,
    backgroundColor: '#e2e8f0',
  },
  cellSubPct: {
    flex: 1,
    textAlign: 'center',
    fontSize: 6.5,
    borderRightWidth: 0.4,
    borderRightColor: '#cbd5e1',
    paddingVertical: 1,
  },

  // 3. Sección de firmas oficiales
  signaturesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 18,
    paddingHorizontal: 20,
  },
  signatureBox: {
    alignItems: 'center',
    width: 190,
  },
  signatureLine: {
    width: '100%',
    borderTopWidth: 0.8,
    borderTopColor: '#334155',
    marginBottom: 4,
  },
  signatureTitle: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    color: '#0f172a',
    textAlign: 'center',
  },
  signatureSubtitle: {
    fontSize: 6.5,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 1,
  },
  sealBox: {
    width: 90,
    height: 48,
    borderWidth: 0.8,
    borderColor: '#94a3b8',
    borderRadius: 4,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealText: {
    fontSize: 6.5,
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
})
