import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { ROLE_DASHBOARD_MAP } from '@/lib/permissions'

// Rutas protegidas por rol
const PROTECTED_PREFIXES = ['/admin', '/docente', '/representante', '/estudiante']
// Rutas de auth públicas (login, root)
const AUTH_ROUTES = ['/login', '/register', '/']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANTE: No escribir lógica entre createServerClient y supabase.auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  )
  const isAuthRoute = AUTH_ROUTES.includes(pathname)

  // -------------------------------------------------------------------
  // CASO 1: Sin sesión + intenta acceder a ruta protegida → /login
  // -------------------------------------------------------------------
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // -------------------------------------------------------------------
  // CASO 2: Con sesión activa + intenta cargar /login o / → redirigir
  //         automáticamente a su dashboard correspondiente según rol.
  // -------------------------------------------------------------------
  if (user && isAuthRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role) {
      const destination = ROLE_DASHBOARD_MAP[profile.role as keyof typeof ROLE_DASHBOARD_MAP]

      if (destination) {
        const url = request.nextUrl.clone()
        url.pathname = destination
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Intercepta todas las rutas excepto archivos estáticos y assets:
     * - _next/static (archivos estáticos de Next.js)
     * - _next/image (optimización de imágenes)
     * - favicon.ico
     * - Archivos con extensión de imagen/recurso
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
