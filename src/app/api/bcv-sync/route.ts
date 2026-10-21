import { NextRequest, NextResponse } from 'next/server'
import { syncBcvRateToAllSchools } from '@/lib/services/bcv-sync'

export const dynamic = 'force-dynamic'
export const maxDuration = 30 // Permite hasta 30 segundos en funciones serverless de Vercel

export async function POST(request: NextRequest) {
  // 1. Autenticación: verificar header "Authorization: Bearer {CRON_SECRET}"
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET?.trim()

  // Si falta el secret en el entorno o la cabecera es incorrecta, rechazar de inmediato
  if (!cronSecret || !authHeader || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'No autorizado: Bearer token inválido o no configurado' },
      { status: 401 }
    )
  }

  // 2. Ejecutar la sincronización de la tasa oficial
  const result = await syncBcvRateToAllSchools()

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status || 500 }
    )
  }

  return NextResponse.json({
    success: true,
    rate: result.rate,
    date: result.date,
    schoolsUpdated: result.schoolsUpdated,
  })
}
