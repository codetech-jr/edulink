import { createAdminClient } from '@/utils/supabase/admin'

interface DolarApiResponse {
  promedio?: number
  price?: number
  fechaActualizacion?: string
  [key: string]: unknown
}

export interface BcvSyncResult {
  success: boolean
  rate?: number
  date?: string
  schoolsUpdated?: number
  error?: string
  status?: number
}

/**
 * Consulta la tasa oficial del BCV desde DolarApi y la actualiza
 * en la tabla exchange_rates para todas las instituciones registradas.
 */
export async function syncBcvRateToAllSchools(): Promise<BcvSyncResult> {
  let bcvRate: number | null = null
  let rateDateStr: string = new Date().toISOString().split('T')[0]

  // 1. Obtener la tasa de https://ve.dolarapi.com/v1/dolares/oficial con timeout de 10s
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'EduLink-Cron/1.0',
      },
      cache: 'no-store',
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(`[BCV Sync] Error en DolarApi: HTTP ${response.status} ${response.statusText}`)
      return {
        success: false,
        error: 'Servicio de tasa oficial no disponible (HTTP error)',
        status: 503,
      }
    }

    const data: DolarApiResponse = await response.json()
    const rawRate = data.promedio ?? data.price

    if (typeof rawRate !== 'number' || isNaN(rawRate) || rawRate <= 0) {
      console.error('[BCV Sync] Tasa inválida recibida de DolarApi:', data)
      return {
        success: false,
        error: 'Servicio de tasa oficial devolvió datos numéricos inválidos',
        status: 503,
      }
    }

    bcvRate = Number(rawRate.toFixed(4))

    if (data.fechaActualizacion) {
      const parsedDate = data.fechaActualizacion.split('T')[0]
      if (/^\d{4}-\d{2}-\d{2}$/.test(parsedDate)) {
        rateDateStr = parsedDate
      }
    }
  } catch (error: any) {
    console.error('[BCV Sync] Error al consultar API externa:', error?.message || error)
    return {
      success: false,
      error: 'Servicio de tasa oficial no disponible (timeout o conexión fallida)',
      status: 503,
    }
  }

  // 2. Upsert de la tasa en exchange_rates para todas las instituciones
  try {
    const adminClient = createAdminClient()

    const { data: schools, error: schoolsError } = await adminClient
      .from('schools')
      .select('id')

    if (schoolsError || !schools || schools.length === 0) {
      console.error('[BCV Sync] Error consultando instituciones:', schoolsError)
      return {
        success: false,
        error: 'No se encontraron instituciones registradas para sincronizar',
        status: 500,
      }
    }

    const schoolIds = schools.map((s) => s.id)

    // Consultar tasas existentes para la fecha indicada
    const { data: existingRates, error: selectError } = await adminClient
      .from('exchange_rates')
      .select('id, school_id')
      .in('school_id', schoolIds)
      .eq('rate_date', rateDateStr)

    if (selectError) {
      console.error('[BCV Sync] Error consultando exchange_rates:', selectError)
    }

    const existingMap = new Map<string, string>()
    existingRates?.forEach((r) => {
      existingMap.set(r.school_id, r.id)
    })

    const toUpdateIds: string[] = []
    const toInsertPayload: Array<{
      school_id: string
      rate_date: string
      rate: number
      currency_from: string
      currency_to: string
      source: string
    }> = []

    for (const school of schools) {
      const existingId = existingMap.get(school.id)
      if (existingId) {
        toUpdateIds.push(existingId)
      } else {
        toInsertPayload.push({
          school_id: school.id,
          rate_date: rateDateStr,
          rate: bcvRate,
          currency_from: 'USD',
          currency_to: 'VES',
          source: 'BCV (DolarApi)',
        })
      }
    }

    // Actualizar registros existentes
    if (toUpdateIds.length > 0) {
      const { error: updateError } = await adminClient
        .from('exchange_rates')
        .update({
          rate: bcvRate,
          source: 'BCV (DolarApi)',
          currency_from: 'USD',
          currency_to: 'VES',
        })
        .in('id', toUpdateIds)

      if (updateError) {
        console.error('[BCV Sync] Error al actualizar exchange_rates:', updateError)
        throw updateError
      }
    }

    // Insertar nuevos registros para instituciones sin tasa hoy
    if (toInsertPayload.length > 0) {
      const { error: insertError } = await adminClient
        .from('exchange_rates')
        .insert(toInsertPayload)

      if (insertError) {
        console.error('[BCV Sync] Error al insertar exchange_rates:', insertError)
        throw insertError
      }
    }

    return {
      success: true,
      rate: bcvRate,
      date: rateDateStr,
      schoolsUpdated: schools.length,
    }
  } catch (error: any) {
    console.error('[BCV Sync] Error en base de datos al sincronizar tasa:', error)
    return {
      success: false,
      error: 'Error al persistir la tasa de cambio en la base de datos',
      status: 500,
    }
  }
}
