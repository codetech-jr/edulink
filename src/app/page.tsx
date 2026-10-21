import { LandingHeader } from './_components/LandingHeader'
import { LandingHero } from './_components/LandingHero'
import { LandingFeatures } from './_components/LandingFeatures'
import { LandingVenezuela } from './_components/LandingVenezuela'
import { LandingCTA } from './_components/LandingCTA'
import { LandingFooter } from './_components/LandingFooter'

export const metadata = {
  title: 'EduLink | Sistema de Gestión Escolar Inteligente para Venezuela',
  description:
    'La plataforma SaaS definitiva para colegios venezolanos. Automatiza la conciliación de Pago Móvil, el control de morosidad, boletines académicos y asistencias en vivo con una interfaz ultrarrápida.',
}

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-primary-100 selection:text-primary-900 overflow-x-hidden">
      {/* CSS-only Mobile Menu & Animation Tweaks */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        #mobile-menu-checkbox:checked ~ header #menu-icon { display: none; }
        #mobile-menu-checkbox:checked ~ header #close-icon { display: block; }
        #mobile-menu-checkbox:checked ~ header #mobile-menu { display: block; }
        
        .bg-grid-slate-light {
          background-image: 
            linear-gradient(to right, rgba(15, 23, 42, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(15, 23, 42, 0.04) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        @keyframes float-dashboard {
          0%, 100% { transform: translateY(0px) rotate(-0.5deg); }
          50% { transform: translateY(-10px) rotate(0.5deg); }
        }
        .animate-float-dashboard {
          animation: float-dashboard 8s ease-in-out infinite;
        }
      `,
        }}
      />

      <LandingHeader />

      <main id="contenido-principal">
        <LandingHero />
        <LandingFeatures />
        <LandingVenezuela />
        <LandingCTA />
      </main>

      <LandingFooter />
    </div>
  )
}
