import { Coins, Zap, Wifi, MessageSquare } from 'lucide-react'

export function LandingVenezuela() {
  return (
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
          {/* Feature 1: BCV (Verde Esmeralda) */}
          <div className="flex flex-col gap-4 p-5 rounded-2xl hover:bg-slate-50 transition-colors duration-200">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-secondary shadow-sm">
              <Coins className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Conversión BCV Automática</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed text-pretty">
              Sincronización diaria con la tasa oficial del Banco Central de Venezuela. Genera cobros y estados de cuenta automáticos en divisas y bolívares sin errores humanos.
            </p>
          </div>

          {/* Feature 2: Pago Movil (Ámbar Cálido) */}
          <div className="flex flex-col gap-4 p-5 rounded-2xl hover:bg-slate-50 transition-colors duration-200">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-accent shadow-sm">
              <Zap className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Pago Móvil Conciliado</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed text-pretty">
              Optimiza la carga y validación manual de comprobantes. Los representantes suben el capture o los datos y la plataforma ayuda a validar la conciliación en tiempo récord.
            </p>
          </div>

          {/* Feature 3: Conexiones Lentas (Azul Marino) */}
          <div className="flex flex-col gap-4 p-5 rounded-2xl hover:bg-slate-50 transition-colors duration-200">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary shadow-sm">
              <Wifi className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Optimizado para Redes 3G</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed text-pretty">
              Estructura de código superliviana. Diseñado para cargar ágilmente en teléfonos de gama media y bajo conexiones de datos móviles intermitentes o inestables.
            </p>
          </div>

          {/* Feature 4: Soporte Local (Azul Marino) */}
          <div className="flex flex-col gap-4 p-5 rounded-2xl hover:bg-slate-50 transition-colors duration-200">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary shadow-sm">
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
  )
}
