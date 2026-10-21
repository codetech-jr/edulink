'use client'

import { useState } from 'react'
import {
  Wallet,
  BookOpen,
  Megaphone,
  Plus,
} from 'lucide-react'
import { ReportPaymentForm } from './ReportPaymentForm'

type TabKey = 'finanzas' | 'academico' | 'comunicados'

interface Tab {
  key: TabKey
  label: string
  icon: React.ReactNode
}

const tabs: Tab[] = [
  { key: 'finanzas', label: 'Finanzas', icon: <Wallet className="w-4 h-4" /> },
  { key: 'academico', label: 'Académico', icon: <BookOpen className="w-4 h-4" /> },
  { key: 'comunicados', label: 'Comunicados', icon: <Megaphone className="w-4 h-4" /> },
]

interface DashboardTabsProps {
  profileCard?: React.ReactNode
  financesContent: React.ReactNode
  academicsContent: React.ReactNode
  communicationsContent: React.ReactNode
  students?: any[] /* TODO: tipado pendiente */
  billingConcepts?: any[] /* TODO: tipado pendiente */
  bcvRate?: number
}

export function DashboardTabs({
  profileCard,
  financesContent,
  academicsContent,
  communicationsContent,
  students = [],
  billingConcepts = [],
  bcvRate = 36.5,
}: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('finanzas')
  const [isFabModalOpen, setIsFabModalOpen] = useState(false)

  const content: Record<TabKey, React.ReactNode> = {
    finanzas: financesContent,
    academico: academicsContent,
    comunicados: communicationsContent,
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Columna Lateral (Sidebar) */}
        <div className="lg:col-span-4 space-y-4">
          {profileCard}

          {/* Tab Navigation — Modern Segmented Control con Touch Targets >= 44px */}
          <nav
            className="bg-white rounded-2xl p-1.5 border border-zinc-200/80 shadow-xs flex lg:flex-col gap-1.5 sticky top-16 z-20"
            role="tablist"
            aria-label="Pestañas del portal"
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 lg:flex-initial flex items-center justify-center lg:justify-start gap-2.5 py-2.5 px-3.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer min-h-[44px] ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-zinc-400'}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Columna Principal */}
        <div className="lg:col-span-8 animate-in fade-in duration-200 pb-16 lg:pb-0">
          {content[activeTab]}
        </div>
      </div>

      {/* ── Quick Action Flotante en Móviles (FAB) ────────────── */}
      {students.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setIsFabModalOpen(true)}
            className="fixed bottom-5 right-5 z-40 lg:hidden flex items-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold text-xs rounded-full shadow-lg shadow-indigo-600/30 transition-all min-h-[48px]"
            aria-label="Reportar pago"
          >
            <Plus className="w-5 h-5" />
            <span className="font-bold">Reportar Pago</span>
          </button>

          {/* Modal activado desde el FAB */}
          <ReportPaymentForm
            students={students}
            billingConcepts={billingConcepts}
            bcvRate={bcvRate}
            isOpen={isFabModalOpen}
            onClose={() => setIsFabModalOpen(false)}
            hideDefaultButton={true}
          />
        </>
      )}
    </div>
  )
}
