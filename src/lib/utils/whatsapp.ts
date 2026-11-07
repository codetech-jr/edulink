/**
 * Normaliza y formatea enlaces a WhatsApp para el representante o acudiente.
 * Soporta formatos venezolanos (0414, 0424, 0412, etc.) y limpia caracteres no numéricos.
 * Es una función pura y segura para importar tanto en Client como en Server Components.
 */
export function formatWhatsAppLink(
  phone: string | null | undefined,
  message: string
): string | null {
  if (!phone) return null
  const cleaned = phone.replace(/[^0-9]/g, '')
  if (!cleaned || cleaned.length < 10) return null

  let fullNumber = cleaned
  if (cleaned.startsWith('04') && cleaned.length === 11) {
    fullNumber = `58${cleaned.slice(1)}`
  } else if (
    cleaned.length === 10 &&
    (cleaned.startsWith('414') ||
      cleaned.startsWith('424') ||
      cleaned.startsWith('412') ||
      cleaned.startsWith('416') ||
      cleaned.startsWith('426'))
  ) {
    fullNumber = `58${cleaned}`
  }

  return `https://wa.me/${fullNumber}?text=${encodeURIComponent(message)}`
}
