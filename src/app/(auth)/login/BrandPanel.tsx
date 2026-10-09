'use client'

import { useEffect, useState } from 'react'
import {
  GraduationCap,
  Shield,
  BarChart3,
  Users,
  CloudCog,
  Sparkles,
} from 'lucide-react'

const quotes = [
  {
    text: 'Revolucionando la gestión académica con tecnología Cloud.',
    author: 'Infraestructura Confiable',
  },
  {
    text: 'Cada dato educativo, protegido con cifrado de nivel bancario.',
    author: 'Seguridad de Datos',
  },
  {
    text: 'Conectamos docentes, estudiantes y familias en un solo ecosistema.',
    author: 'Comunicación Integrada',
  },
  {
    text: 'Analítica en tiempo real para decisiones académicas inteligentes.',
    author: 'Inteligencia Educativa',
  },
]

const floatingFeatures = [
  { icon: Shield, label: 'Cifrado E2E', x: '12%', y: '18%', delay: '0s' },
  { icon: BarChart3, label: 'Analítica', x: '68%', y: '14%', delay: '1s' },
  { icon: Users, label: '4 Roles', x: '78%', y: '55%', delay: '2s' },
  { icon: CloudCog, label: 'Cloud', x: '15%', y: '62%', delay: '0.5s' },
]

export function BrandPanel() {
  const [currentQuote, setCurrentQuote] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentQuote((prev) => (prev + 1) % quotes.length)
        setIsTransitioning(false)
      }, 400)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative flex h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900">
      {/* ── Grid Pattern Overlay ── */}
      <div
        className="animate-grid-pulse pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* ── Radial Glow Orbs ── */}
      <div className="animate-pulse-glow pointer-events-none absolute -right-20 -top-20 h-[400px] w-[400px] rounded-full bg-indigo-500/20 blur-[120px]" />
      <div
        className="animate-pulse-glow pointer-events-none absolute -bottom-20 -left-20 h-[350px] w-[350px] rounded-full bg-purple-500/15 blur-[100px]"
        style={{ animationDelay: '2s' }}
      />
      <div
        className="animate-pulse-glow pointer-events-none absolute right-1/4 top-1/3 h-[200px] w-[200px] rounded-full bg-cyan-400/10 blur-[80px]"
        style={{ animationDelay: '4s' }}
      />

      {/* ── Floating Feature Badges ── */}
      {floatingFeatures.map((feature, i) => (
        <div
          key={i}
          className="glass-card animate-float pointer-events-none absolute flex items-center gap-2 rounded-xl px-3 py-2 shadow-xl"
          style={{
            left: feature.x,
            top: feature.y,
            animationDelay: feature.delay,
            animationDuration: `${5 + i * 0.8}s`,
          }}
        >
          <feature.icon className="h-4 w-4 text-indigo-300" />
          <span className="text-xs font-medium text-white/80">
            {feature.label}
          </span>
        </div>
      ))}

      {/* ── Central Content ── */}
      <div className="relative z-10 flex max-w-md flex-col items-center px-10 text-center animate-fade-in-up">
        {/* Logo Mark */}
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
          <GraduationCap className="h-8 w-8 text-indigo-300" />
        </div>

        {/* Brand Name */}
        <h2 className="mb-2 text-3xl font-bold tracking-tight text-white">
          EduLink
        </h2>
        <p className="mb-10 text-sm font-medium text-indigo-300/80">
          Sistema de Gestión Escolar
        </p>

        {/* ── Rotating Quote Card ── */}
        <div className="glass-card w-full rounded-2xl px-8 py-6 shadow-2xl">
          <div
            className="transition-all duration-400 ease-out"
            style={{
              opacity: isTransitioning ? 0 : 1,
              transform: isTransitioning
                ? 'translateY(-6px)'
                : 'translateY(0)',
            }}
          >
            <Sparkles className="mx-auto mb-3 h-5 w-5 text-indigo-400/70" />
            <p className="text-[15px] font-medium leading-relaxed text-white/90">
              &ldquo;{quotes[currentQuote].text}&rdquo;
            </p>
            <p className="mt-3 text-xs font-medium uppercase tracking-widest text-indigo-300/60">
              {quotes[currentQuote].author}
            </p>
          </div>
        </div>

        {/* ── Trust Indicators ── */}
        <div className="mt-10 flex items-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-white">99.9%</span>
            <span className="text-[11px] text-indigo-300/60">Uptime</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-white">256-bit</span>
            <span className="text-[11px] text-indigo-300/60">Cifrado</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-white">4</span>
            <span className="text-[11px] text-indigo-300/60">Roles</span>
          </div>
        </div>
      </div>

      {/* ── Bottom attribution ── */}
      <div className="absolute bottom-6 text-center">
        <p className="text-[11px] text-indigo-400/40">
          Plataforma impulsada por tecnología de nueva generación
        </p>
      </div>
    </div>
  )
}
