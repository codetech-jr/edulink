import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/utils/supabase/admin'
import { PublicEnrollmentForm } from './_components/PublicEnrollmentForm'
import { GraduationCap, ShieldCheck, HelpCircle } from 'lucide-react'

interface PageProps {
  params: {
    schoolSlug: string
  }
}

export async function generateMetadata({ params }: PageProps) {
  const adminClient = createAdminClient()
  const { data: school } = await adminClient
    .from('schools')
    .select('name')
    .eq('slug', params.schoolSlug)
    .maybeSingle()

  if (!school) {
    return {
      title: 'Colegio no encontrado | EduLink',
    }
  }

  return {
    title: `Proceso de Admisión e Inscripción | ${school.name}`,
    description: `Formulario oficial de solicitud de cupo e inscripción escolar para ${school.name}.`,
  }
}

export default async function PublicEnrollmentPage({ params }: PageProps) {
  const { schoolSlug } = params
  const adminClient = createAdminClient()

  // Consultar datos de la institución educativa por su slug único
  const { data: school, error } = await adminClient
    .from('schools')
    .select('id, name, rif, email, logo_url, slug')
    .eq('slug', schoolSlug)
    .maybeSingle()

  if (error || !school) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Cabecera Pública con Identidad del Colegio */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 shadow-2xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {school.logo_url ? (
              <Image
                src={school.logo_url}
                alt={school.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-lg shadow-2xs">
                {school.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-tight line-clamp-1">
                {school.name}
              </h1>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <span>Admisiones y Pre-inscripción</span>
                {school.rif && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span>{school.rif}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2.5 py-1 rounded-full text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Portal Oficial</span>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 py-6 sm:py-10 px-4 sm:px-6 max-w-4xl mx-auto w-full">
        {/* Banner de Bienvenida */}
        <div className="mb-6 sm:mb-8 text-center sm:text-left bg-gradient-to-br from-white to-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold mb-3">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
            Año Escolar 2026-2027
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight [text-wrap:balance]">
            Solicitud de Cupo e Inscripción
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-2xl leading-relaxed">
            Completa la información requerida a continuación para postular al aspirante. Nuestro
            departamento de coordinación académica revisará los antecedentes y se pondrá en contacto contigo.
          </p>
        </div>

        {/* Formulario Interactivo Multipaso */}
        <PublicEnrollmentForm schoolSlug={school.slug} schoolName={school.name} />
      </main>

      {/* Pie de página con respaldo institucional */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} {school.name}. Todos los derechos reservados.</p>
          <div className="flex items-center gap-2 text-slate-400">
            <span>Gestionado con tecnología</span>
            <span className="font-bold text-slate-700">EduLink</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
