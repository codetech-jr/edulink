import Link from 'next/link';
import { 
  School, 
  BookOpen, 
  Users, 
  UserCheck, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Wifi, 
  Coins, 
  MessageSquare, 
  ChevronRight, 
  Menu, 
  X,
  ShieldCheck,
  TrendingUp,
  Clock,
  Sparkles
} from 'lucide-react';

export const metadata = {
  title: 'EduLink | Sistema de Gestión Escolar Inteligente para Venezuela',
  description: 'La plataforma SaaS definitiva para colegios venezolanos. Automatiza la conciliación de Pago Móvil, el control de morosidad, boletines académicos y asistencias en vivo con una interfaz ultrarrápida.',
};

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-white text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      {/* CSS-only Mobile Menu & Animation Tweaks */}
      <style dangerouslySetInnerHTML={{__html: `
        #mobile-menu-checkbox:checked ~ header #menu-icon { display: none; }
        #mobile-menu-checkbox:checked ~ header #close-icon { display: block; }
        #mobile-menu-checkbox:checked ~ header #mobile-menu { display: block; }
        
        /* Light grid pattern with a custom fading mask */
        .bg-grid-slate-light {
          background-image: 
            linear-gradient(to right, rgba(15, 23, 42, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(15, 23, 42, 0.04) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        /* Animations */
        @keyframes float-dashboard {
          0%, 100% { transform: translateY(0px) rotate(-0.5deg); }
          50% { transform: translateY(-10px) rotate(0.5deg); }
        }
        .animate-float-dashboard {
          animation: float-dashboard 8s ease-in-out infinite;
        }
      `}} />

      {/* Hidden checkbox for mobile menu toggle */}
      <input type="checkbox" id="mobile-menu-checkbox" className="peer hidden" />

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/70 backdrop-blur-md transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-sm shadow-indigo-100">
                <School className="h-5 w-5" aria-hidden="true" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Edu<span className="text-indigo-600">Link</span>
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600" aria-label="Navegación principal">
              <a href="#caracteristicas" className="hover:text-slate-900 transition-colors duration-150">
                Características
              </a>
              <a href="#venezuela" className="hover:text-slate-900 transition-colors duration-150">
                Diseñado para Venezuela
              </a>
              <a href="#soporte" className="hover:text-slate-900 transition-colors duration-150">
                Soporte
              </a>
            </nav>

            {/* Header Actions */}
            <div className="hidden md:flex items-center gap-4">
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
              >
                Iniciar Sesión
              </Link>
              <Link 
                href="/register" 
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-100 hover:bg-indigo-500 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Registrar Colegio
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <label 
              htmlFor="mobile-menu-checkbox" 
              className="md:hidden flex cursor-pointer select-none items-center justify-center p-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors duration-150 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2"
              aria-label="Abrir menú"
            >
              <Menu id="menu-icon" className="h-6 w-6 block" aria-hidden="true" />
              <X id="close-icon" className="h-6 w-6 hidden" aria-hidden="true" />
            </label>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        <div 
          id="mobile-menu" 
          className="hidden md:hidden absolute top-16 left-0 right-0 bg-white border-b border-slate-200 px-4 py-6 shadow-xl space-y-4"
        >
          <nav className="flex flex-col gap-4 text-base font-medium text-slate-600" aria-label="Navegación móvil">
            <a href="#caracteristicas" className="px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors duration-150">
              Características
            </a>
            <a href="#venezuela" className="px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors duration-150">
              Diseñado para Venezuela
            </a>
            <a href="#soporte" className="px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors duration-150">
              Soporte
            </a>
          </nav>
          <hr className="border-slate-100" />
          <div className="flex flex-col gap-3">
            <Link 
              href="/login" 
              className="flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors duration-150"
            >
              Iniciar Sesión
            </Link>
            <Link 
              href="/register" 
              className="flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-base font-semibold text-white hover:bg-indigo-500 shadow-sm transition-colors duration-150"
            >
              Registrar Colegio
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="contenido-principal">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24 bg-white" aria-labelledby="hero-title">
          {/* Subtle Grid and Gradient Blobs */}
          <div className="absolute inset-0 -z-10 bg-slate-50/50">
            <div className="absolute inset-0 bg-grid-slate-light [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-80"></div>
          </div>
          <div className="absolute top-[-10%] left-[-10%] h-[350px] w-[350px] sm:h-[500px] sm:w-[500px] rounded-full bg-indigo-100/30 blur-3xl -z-10"></div>
          <div className="absolute top-[20%] right-[-10%] h-[400px] w-[400px] sm:h-[600px] sm:w-[600px] rounded-full bg-blue-100/20 blur-3xl -z-10"></div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              {/* Product Badge */}
              <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50/50 px-3.5 py-1 text-xs font-semibold text-indigo-700 backdrop-blur-sm shadow-sm mb-6">
                <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
                El primer SaaS escolar adaptado a la realidad venezolana
              </div>

              {/* Tagline */}
              <h1 id="hero-title" className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl text-wrap-balance leading-[1.1]">
                El sistema de gestión escolar inteligente para la{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 bg-clip-text text-transparent">
                  Venezuela de hoy
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-600 text-pretty leading-relaxed">
                Automatiza la conciliación de Pago Móvil en segundos, controla la morosidad con alertas automáticas y simplifica las asistencias desde el celular. Todo integrado para directores, docentes y familias en un solo lugar.
              </p>

              {/* CTAs */}
              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 px-4 sm:px-0">
                <Link 
                  id="cta-register"
                  href="/register" 
                  className="group inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-md shadow-indigo-100 hover:bg-indigo-500 transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 w-full sm:w-auto duration-150"
                >
                  Registrar mi Plantel
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" aria-hidden="true" />
                </Link>
                <Link 
                  id="cta-login"
                  href="/login" 
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-300 w-full sm:w-auto duration-150"
                >
                  Iniciar Sesión
                </Link>
              </div>
            </div>

            {/* Dashboard High-Fidelity CSS Mockup */}
            <div className="mt-16 sm:mt-20 relative mx-auto max-w-5xl rounded-2xl border border-slate-200/80 bg-slate-900/5 p-2 shadow-2xl shadow-indigo-100/30 backdrop-blur-sm">
              <div className="rounded-xl border border-slate-800/90 bg-slate-950 overflow-hidden shadow-2xl animate-float-dashboard">
                
                {/* Mockup Top Window Bar */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-red-500/80 block" />
                    <span className="h-3 w-3 rounded-full bg-yellow-500/80 block" />
                    <span className="h-3 w-3 rounded-full bg-green-500/80 block" />
                  </div>
                  <div className="rounded-md bg-slate-950 px-8 py-1 text-xs text-slate-500 font-medium border border-slate-800">
                    app.edulink.com.ve/dashboard
                  </div>
                  <div className="flex h-3 w-3 items-center" />
                </div>

                {/* Dashboard Inner App Workspace */}
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] min-h-[350px] sm:min-h-[480px]">
                  
                  {/* Left Sidebar Mockup */}
                  <aside className="hidden md:flex flex-col border-r border-slate-800 p-4 bg-slate-950">
                    <div className="flex items-center gap-2 mb-8">
                      <div className="h-6 w-6 rounded-md bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                        EL
                      </div>
                      <span className="text-xs font-bold text-slate-200">Portal Admin</span>
                    </div>
                    <nav className="flex flex-col gap-2 text-xs text-slate-400 font-medium">
                      <span className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white">
                        <TrendingUp className="h-3.5 w-3.5 text-indigo-400" aria-hidden="true" />
                        Vista General
                      </span>
                      <span className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-900/50">
                        <Users className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                        Estudiantes
                      </span>
                      <span className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-900/50">
                        <Coins className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                        Pagos y Conciliación
                      </span>
                      <span className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-900/50">
                        <BookOpen className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                        Calificaciones
                      </span>
                      <span className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-900/50">
                        <UserCheck className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                        Asistencias
                      </span>
                    </nav>
                  </aside>

                  {/* Right Dashboard Area Mockup */}
                  <main className="p-4 sm:p-6 flex flex-col gap-6 bg-slate-950/40">
                    
                    {/* Inner Mockup Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-100">Colegio San Francisco de Asís</h3>
                        <p className="text-[10px] text-slate-500">Período Académico 2025–2026</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 font-mono">
                          Tasa BCV: 36.50 Bs/USD
                        </div>
                        <div className="h-7 w-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
                          UA
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid Mockup */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      
                      {/* Stat Card 1 */}
                      <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Morosidad Actual</span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-xl font-bold text-slate-100 font-mono">12.4%</span>
                          <span className="text-[9px] text-emerald-400 font-semibold">-4.2% esta sem.</span>
                        </div>
                        <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: '12.4%' }} />
                        </div>
                      </div>

                      {/* Stat Card 2 */}
                      <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Por Conciliar (Pago Móvil)</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xl font-bold text-slate-100 font-mono">4</span>
                          <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-2">Bs. 3,650.00 reportados hoy</p>
                      </div>

                      {/* Stat Card 3 */}
                      <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Asistencia General</span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-xl font-bold text-slate-100 font-mono">94.8%</span>
                          <span className="text-[9px] text-slate-500">28 secciones</span>
                        </div>
                        <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94.8%' }} />
                        </div>
                      </div>
                    </div>

                    {/* Table-Like Mockup: Recent transactions */}
                    <div className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/30">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Últimos Pagos Reportados</span>
                      </div>
                      <div className="divide-y divide-slate-800/80 text-xs font-mono">
                        
                        {/* Row 1 */}
                        <div className="flex items-center justify-between px-4 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span className="text-slate-300 text-[11px]">Yusmeli Rodríguez (Representante)</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400 text-[10px]">1er Año A</span>
                            <span className="text-slate-200 font-bold text-[11px]">$25.00</span>
                            <span className="text-[9px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20 font-semibold">Conciliado</span>
                          </div>
                        </div>

                        {/* Row 2 */}
                        <div className="flex items-center justify-between px-4 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                            <span className="text-slate-300 text-[11px]">Carlos Mendoza (Representante)</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400 text-[10px]">3er Año B</span>
                            <span className="text-slate-200 font-bold text-[11px]">$50.00</span>
                            <span className="text-[9px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 font-semibold">Pendiente</span>
                          </div>
                        </div>

                        {/* Row 3 */}
                        <div className="flex items-center justify-between px-4 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span className="text-slate-300 text-[11px]">Milagros Pérez (Representante)</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400 text-[10px]">Preescolar B</span>
                            <span className="text-slate-200 font-bold text-[11px]">$20.00</span>
                            <span className="text-[9px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20 font-semibold">Conciliado</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </main>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section (4 Pilares Grid) */}
        <section id="caracteristicas" className="py-20 lg:py-32 bg-slate-50/50 relative" aria-labelledby="features-title">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            
            {/* Header Title */}
            <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
              <h2 id="features-title" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl text-wrap-balance leading-tight">
                Una plataforma integrada en cuatro portales dedicados
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-600 text-pretty">
                EduLink reúne todos los roles de tu comunidad escolar en un único ecosistema digital conectado en tiempo real.
              </p>
            </div>

            {/* Grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Portal 1: Colegio (Administración) */}
              <div className="group relative rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                    <School className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-slate-900">Portal del Colegio</h3>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1">Dirección y Administración</p>
                  <p className="mt-4 text-slate-600 text-sm leading-relaxed">
                    Control total administrativo, contable y académico. Automatiza las conciliaciones y obtén reportes financieros en tiempo real sin hojas de cálculo complejas.
                  </p>
                  <ul className="mt-6 space-y-2.5 text-sm text-slate-600" role="list">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-indigo-500 flex-shrink-0" aria-hidden="true" />
                      <span>Conciliación automática de transferencias y Pago Móvil.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-indigo-500 flex-shrink-0" aria-hidden="true" />
                      <span>Control e historial de morosidad por estudiante y sección.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-indigo-500 flex-shrink-0" aria-hidden="true" />
                      <span>Configuración de planes de pago y conceptos de facturación.</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">ADMINISTRADOR</span>
                  <Link href="/register" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:text-indigo-500 transition-colors duration-150">
                    Probar ahora <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>

              {/* Portal 2: Docente */}
              <div className="group relative rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                    <BookOpen className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-slate-900">Portal del Docente</h3>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1">Control Académico y Aula</p>
                  <p className="mt-4 text-slate-600 text-sm leading-relaxed">
                    Planificación digital, carga rápida de calificaciones por lapsos y registro diario de asistencia desde cualquier dispositivo, incluso sin conexión a internet permanente.
                  </p>
                  <ul className="mt-6 space-y-2.5 text-sm text-slate-600" role="list">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-indigo-500 flex-shrink-0" aria-hidden="true" />
                      <span>Carga rápida de calificaciones por lapsos académicos.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-indigo-500 flex-shrink-0" aria-hidden="true" />
                      <span>Registro de asistencia diaria en vivo en menos de un minuto.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-indigo-500 flex-shrink-0" aria-hidden="true" />
                      <span>Diseño ágil de planes de evaluación adaptados al plantel.</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">DOCENTE</span>
                  <Link href="/register" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:text-indigo-500 transition-colors duration-150">
                    Probar ahora <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>

              {/* Portal 3: Representante */}
              <div className="group relative rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                    <Users className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-slate-900">Portal del Representante</h3>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1">Familia y Finanzas</p>
                  <p className="mt-4 text-slate-600 text-sm leading-relaxed">
                    Tranquilidad y transparencia. Permite cargar comprobantes de pago desde el teléfono, revisar saldos en tiempo real y recibir avisos inmediatos sobre su representado.
                  </p>
                  <ul className="mt-6 space-y-2.5 text-sm text-slate-600" role="list">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-indigo-500 flex-shrink-0" aria-hidden="true" />
                      <span>Reporte rápido de pagos vía móvil o transferencias bancarias.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-indigo-500 flex-shrink-0" aria-hidden="true" />
                      <span>Visualización instantánea de boletas y reportes académicos.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-indigo-500 flex-shrink-0" aria-hidden="true" />
                      <span>Notificaciones de inasistencia o avisos institucionales.</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">REPRESENTANTE</span>
                  <Link href="/register" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:text-indigo-500 transition-colors duration-150">
                    Probar ahora <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>

              {/* Portal 4: Alumno */}
              <div className="group relative rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                    <UserCheck className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-slate-900">Portal del Estudiante</h3>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1">Seguimiento Académico</p>
                  <p className="mt-4 text-slate-600 text-sm leading-relaxed">
                    Fomenta la responsabilidad del alumno. Permite consultar calificaciones publicadas, planes de evaluación y tareas pendientes en un formato optimizado y amigable.
                  </p>
                  <ul className="mt-6 space-y-2.5 text-sm text-slate-600" role="list">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-indigo-500 flex-shrink-0" aria-hidden="true" />
                      <span>Consulta rápida de notas publicadas por materia y lapso.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-indigo-500 flex-shrink-0" aria-hidden="true" />
                      <span>Calendario interactivo con cronogramas de evaluaciones.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-indigo-500 flex-shrink-0" aria-hidden="true" />
                      <span>Historial propio de asistencia y inasistencias justificadas.</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">ESTUDIANTE</span>
                  <Link href="/register" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:text-indigo-500 transition-colors duration-150">
                    Probar ahora <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Section: Diseñado para Venezuela */}
        <section id="venezuela" className="py-20 lg:py-32 bg-white relative" aria-labelledby="venezuela-title">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            
            {/* Grid split header */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-16 items-start mb-16 sm:mb-20">
              <div>
                <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-100 mb-4">
                  100% Adaptado Localmente
                </div>
                <h2 id="venezuela-title" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl text-wrap-balance leading-tight">
                  Diseñado para los desafíos y la realidad del colegio venezolano
                </h2>
              </div>
              <div>
                <p className="text-slate-600 text-base sm:text-lg leading-relaxed text-pretty">
                  Entendemos el contexto del país. No somos un software genérico adaptado a medias; nacimos para solventar los problemas financieros de conversión cambiaria, conciliación de pagos y conectividad que experimentan las escuelas nacionales a diario.
                </p>
              </div>
            </div>

            {/* Local Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              
              {/* Feature 1: BCV */}
              <div className="flex flex-col gap-4 p-5 rounded-2xl hover:bg-slate-50 transition-colors duration-200">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 shadow-sm">
                  <Coins className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Conversión BCV Automática</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed text-pretty">
                  Sincronización diaria con la tasa oficial del Banco Central de Venezuela. Genera cobros y estados de cuenta automáticos en divisas y bolívares sin errores humanos.
                </p>
              </div>

              {/* Feature 2: Pago Movil */}
              <div className="flex flex-col gap-4 p-5 rounded-2xl hover:bg-slate-50 transition-colors duration-200">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 shadow-sm">
                  <Zap className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Pago Móvil Conciliado</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed text-pretty">
                  Optimiza la carga y validación manual de comprobantes. Los representantes suben el capture o los datos y la plataforma ayuda a validar la conciliación en tiempo récord.
                </p>
              </div>

              {/* Feature 3: Conexiones Lentas */}
              <div className="flex flex-col gap-4 p-5 rounded-2xl hover:bg-slate-50 transition-colors duration-200">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 shadow-sm">
                  <Wifi className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Optimizado para Redes 3G</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed text-pretty">
                  Estructura de código superliviana. Diseñado para cargar ágilmente en teléfonos de gama media y bajo conexiones de datos móviles intermitentes o inestables.
                </p>
              </div>

              {/* Feature 4: Soporte Miranda */}
              <div className="flex flex-col gap-4 p-5 rounded-2xl hover:bg-slate-50 transition-colors duration-200">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 shadow-sm">
                  <MessageSquare className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Soporte Local Dedicado</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed text-pretty">
                  Asistencia real y personalizada basada en Miranda/Caracas. Soporte vía WhatsApp, llamadas o presencial para acompañar a tu directiva durante la implementación.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Section: CTA Final */}
        <section id="soporte" className="py-16 sm:py-24 bg-slate-50/50" aria-labelledby="cta-final-title">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative isolate overflow-hidden bg-slate-900 px-6 py-16 shadow-2xl rounded-3xl sm:px-16 md:py-24 flex flex-col items-center text-center">
              
              {/* Subtle background effects for final CTA */}
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_20rem_at_top,rgba(99,102,241,0.15),transparent)]" />
              <div className="absolute inset-0 -z-10 bg-grid-white bg-grid [mask-image:radial-gradient(ellipse_at_center,rgba(255,255,255,0.03),transparent)]" />

              <Sparkles className="h-10 w-10 text-indigo-400 mb-6 animate-pulse" aria-hidden="true" />
              
              <h2 id="cta-final-title" className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl text-wrap-balance leading-tight">
                ¿Listo para transformar la gestión de tu colegio?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-slate-300 text-sm sm:text-base leading-relaxed text-pretty">
                Digitaliza procesos hoy mismo. Comienza a registrar tu institución en menos de cinco minutos de forma totalmente gratuita y descubre la nueva forma de organizar tu plantel.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto px-4 sm:px-0">
                <Link 
                  id="cta-final-register"
                  href="/register" 
                  className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-slate-950 shadow-sm hover:bg-slate-100 hover:text-slate-900 transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white w-full sm:w-auto duration-150"
                >
                  Registrar mi Plantel
                </Link>
                <Link 
                  id="cta-final-login"
                  href="/login" 
                  className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-950 px-6 py-3.5 text-base font-semibold text-slate-300 hover:bg-slate-900 hover:text-white transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700 w-full sm:w-auto duration-150"
                >
                  Iniciar Sesión
                </Link>
              </div>

              {/* Security/Trust indicator */}
              <div className="mt-8 flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="h-4 w-4 text-indigo-400" aria-hidden="true" />
                <span>Datos protegidos y conexión cifrada SSL.</span>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12" aria-labelledby="footer-heading">
        <h2 id="footer-heading" className="sr-only">Pie de página</h2>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-slate-100 pb-8">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
                <School className="h-4 w-4" aria-hidden="true" />
              </div>
              <span className="text-base font-bold tracking-tight text-slate-900">
                Edu<span className="text-indigo-600">Link</span>
              </span>
            </div>
            
            {/* Support Phone / Email */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-xs font-semibold text-slate-500">
              <span>Soporte: +58 (212) 555-LINK</span>
              <span>Correo: soporte@edulink.com.ve</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-slate-400">
            <p>
              &copy; {new Date().getFullYear()} EduLink. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-4">
              <span>Hecho en Venezuela con orgullo 🇻🇪</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
