import React from 'react'
import { NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { MppeEstadisticaTemplate } from '@/components/pdf/MppeEstadisticaTemplate'
import { getMppeAgeStatistics } from '@/lib/services/mppe-statistics.service'
import { isAdminRole } from '@/lib/permissions'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Validar autenticación de usuario
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'No autenticado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 2. Obtener perfil del usuario autenticado
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, role, school_id')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError || !profile || !profile.school_id) {
      return new Response(JSON.stringify({ error: 'Perfil de usuario no encontrado o sin institución' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 3. Verificación de permisos de rol administrativo
    if (!isAdminRole(profile.role)) {
      return new Response(JSON.stringify({ error: 'Acceso no autorizado a estadísticas oficiales' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 4. Parámetros de consulta
    const searchParams = request.nextUrl.searchParams
    const today = new Date()
    const monthParam = searchParams.get('month') ? parseInt(searchParams.get('month')!, 10) : today.getMonth() + 1
    const yearParam = searchParams.get('year') ? parseInt(searchParams.get('year')!, 10) : today.getFullYear()

    // 5. Obtener datos estadísticos
    const report = await getMppeAgeStatistics({
      schoolId: profile.school_id,
      month: isNaN(monthParam) ? today.getMonth() + 1 : monthParam,
      year: isNaN(yearParam) ? today.getFullYear() : yearParam,
    })

    // 6. Generar Buffer del PDF
    const pdfBuffer = await renderToBuffer(
      React.createElement(MppeEstadisticaTemplate, { data: report }) as any
    )

    const cleanFilename = `Estadistica_MPPE_${report.monthName}_${report.schoolYear.name.replace(/[^a-z0-9]/gi, '_')}.pdf`

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${cleanFilename}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error: any) {
    console.error('Error generando estadística MPPE en PDF:', error)
    return new Response(
      JSON.stringify({
        error: 'Error interno al generar la estadística oficial en PDF',
        details: error?.message || String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
