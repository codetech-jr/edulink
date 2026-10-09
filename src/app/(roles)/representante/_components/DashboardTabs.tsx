'use client'

import { useState } from 'react'
import {
  Wallet,
  BookOpen,
  Megaphone,
} from 'lucide-react'

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
  profileCard: React.ReactNode
  financesContent: React.ReactNode
  academicsContent: React.ReactNode
  communicationsContent: React.ReactNode
}

export function DashboardTabs({
  profileCard,
  financesContent,
  academicsContent,
  communicationsContent,
}: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('finanzas')

  const content: Record<TabKey, React.ReactNode> = {
    finanzas: financesContent,
    academico: academicsContent,
    comunicados: communicationsContent,
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Columna Lateral (Sidebar) */}
      <div className="lg:col-span-4 space-y-6">
        {profileCard}

        {/* Tab Navigation — Pill Style B2C SaaS */}
        <nav className="bg-zinc-100/80 rounded-full lg:rounded-2xl p-1 lg:p-1.5 border border-zinc-200/60 shadow-sm flex lg:flex-col gap-1" role="tablist">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 lg:flex-initial flex items-center justify-center lg:justify-start gap-2.5 py-2 lg:py-2.5 px-3 lg:px-4 rounded-full lg:rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-white text-zinc-800 shadow-sm border border-zinc-200/50'
                    : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50/50'
                }`}
              >
                <span className={isActive ? 'text-indigo-600' : 'text-zinc-400'}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Columna Principal */}
      <div className="lg:col-span-8 animate-in fade-in duration-200">
        {content[activeTab]}
      </div>
    </div>
  )
}
