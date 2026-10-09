import { LoginForm } from './LoginForm'
import { BrandPanel } from './BrandPanel'
import Link from 'next/link'

export const metadata = {
  title: 'Iniciar Sesión | EduLink',
  description: 'Accede a la plataforma EduLink para gestionar tu perfil educativo.',
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-full bg-white">
      {/* ━━━━━━━━━━ LEFT HALF: Form (always visible) ━━━━━━━━━━ */}
      <div className="relative flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24">
        {/* Subtle top-left branding badge (mobile & desktop) */}
        <div className="absolute left-6 top-6 flex items-center gap-2 lg:left-10 lg:top-10">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <span className="text-sm font-bold text-white">E</span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-900">
            EduLink
          </span>
        </div>

        {/* Form container — generous whitespace, vertically centered */}
        <div className="w-full max-w-[380px] animate-fade-in-up">
          {/* Heading block */}
          <div className="mb-10">
            <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-zinc-900">
              Bienvenido de vuelta
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed text-zinc-400">
              Ingresa tus credenciales para acceder a tu plataforma educativa.
            </p>
          </div>

          {/* Modular Client-Side Login Form */}
          <LoginForm />

          {/* Footer links */}
          <p className="mt-8 text-center text-[13px] text-zinc-400">
            ¿Eres director y no tienes cuenta?{' '}
            <Link
              href="/register"
              className="font-medium text-indigo-600 transition-colors hover:text-indigo-500"
            >
              Registra tu colegio
            </Link>
          </p>
        </div>

        {/* Bottom legal text */}
        <div className="absolute bottom-6 left-6 right-6 text-center lg:left-10 lg:right-10">
          <p className="text-[11px] text-zinc-300">
            © {new Date().getFullYear()} EduLink. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* ━━━━━━━━━━ RIGHT HALF: Brand Visual (desktop only) ━━━━━━━━━━ */}
      <div className="hidden lg:block lg:w-1/2">
        <BrandPanel />
      </div>
    </main>
  )
}
