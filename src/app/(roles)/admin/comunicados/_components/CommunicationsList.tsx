'use client'

import React, { useState, useTransition } from 'react'
import {
  Megaphone,
  Archive,
  Search,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import {
  archiveAnnouncementAction,
  unarchiveAnnouncementAction,
  republishAnnouncementAction,
  deleteAnnouncementAction,
} from '@/actions/communication-actions'
import { CommunicationCard } from './CommunicationCard'

export interface CommunicationItem {
  id: string
  school_id: string
  title: string
  body: string
  category: 'urgente' | 'informativo' | 'recordatorio' | string
  target_audience?: string | null
  is_archived?: boolean | null
  created_at: string
}

interface CommunicationsListProps {
  initialCommunications: CommunicationItem[]
}

export function CommunicationsList({
  initialCommunications,
}: CommunicationsListProps) {
  const [activeTab, setActiveTab] = useState<'activos' | 'archivados'>('activos')
  const [searchQuery, setSearchQuery] = useState('')
  const [isPending, startTransition] = useTransition()
  const [actionMessage, setActionMessage] = useState<{
    text: string
    type: 'success' | 'error'
  } | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const activeItems = initialCommunications.filter((c) => !c.is_archived)
  const archivedItems = initialCommunications.filter((c) => !!c.is_archived)
  const currentList = activeTab === 'activos' ? activeItems : archivedItems

  const filteredList = currentList.filter((item) => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return true
    return (
      item.title.toLowerCase().includes(query) ||
      item.body.toLowerCase().includes(query) ||
      (item.target_audience && item.target_audience.toLowerCase().includes(query))
    )
  })

  const notify = (text: string, type: 'success' | 'error') => {
    setActionMessage({ text, type })
    setTimeout(() => setActionMessage(null), 3500)
  }

  const handleArchive = (id: string) => {
    setLoadingId(id)
    startTransition(async () => {
      const res = await archiveAnnouncementAction(id)
      setLoadingId(null)
      if (res.error) {
        notify(res.error, 'error')
      } else {
        notify('Comunicado archivado exitosamente.', 'success')
      }
    })
  }

  const handleUnarchive = (id: string) => {
    setLoadingId(id)
    startTransition(async () => {
      const res = await unarchiveAnnouncementAction(id)
      setLoadingId(null)
      if (res.error) {
        notify(res.error, 'error')
      } else {
        notify('Comunicado restaurado a la lista activa.', 'success')
      }
    })
  }

  const handleRepublish = (id: string) => {
    setLoadingId(id)
    startTransition(async () => {
      const res = await republishAnnouncementAction(id)
      setLoadingId(null)
      if (res.error) {
        notify(res.error, 'error')
      } else {
        notify('Comunicado republicado con fecha actual.', 'success')
        setActiveTab('activos')
      }
    })
  }

  const handleDelete = (id: string, title: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar permanentemente el comunicado "${title}"?`)) {
      return
    }
    setLoadingId(id)
    startTransition(async () => {
      const res = await deleteAnnouncementAction(id)
      setLoadingId(null)
      if (res.error) {
        notify(res.error, 'error')
      } else {
        notify('Comunicado eliminado permanentemente.', 'success')
      }
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Cabecera y Tabs */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-emerald-600" />
            Historial de Anuncios
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Gestiona la difusión, archiva o republica comunicados según el calendario escolar.
          </p>
        </div>

        {/* Tabs de Filtro: Activos vs Archivados */}
        <div className="flex items-center bg-gray-100/90 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('activos')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'activos'
                ? 'bg-white text-emerald-700 shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>Activos</span>
            <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full text-[10px]">
              {activeItems.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('archivados')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'archivados'
                ? 'bg-white text-amber-700 shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Archivados</span>
            <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-full text-[10px]">
              {archivedItems.length}
            </span>
          </button>
        </div>
      </div>

      {/* Buscador Rápido y Notificaciones Flotantes */}
      <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Buscar en comunicados ${activeTab}...`}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-h-[36px]"
          />
        </div>

        {actionMessage && (
          <div
            role="status"
            aria-live="polite"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold animate-in fade-in duration-200 ${
              actionMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
        )}
      </div>

      {/* Listado de Comunicados */}
      {filteredList.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 mb-3">
            {activeTab === 'activos' ? (
              <Megaphone className="w-7 h-7 text-gray-400" />
            ) : (
              <Archive className="w-7 h-7 text-gray-400" />
            )}
          </div>
          <h3 className="text-sm font-bold text-gray-900">
            {activeTab === 'activos'
              ? 'No hay comunicados activos'
              : 'No hay comunicados archivados'}
          </h3>
          <p className="text-gray-500 text-xs mt-1 max-w-sm font-medium">
            {activeTab === 'activos'
              ? 'Utiliza el formulario para redactar y publicar un nuevo comunicado.'
              : 'Los comunicados que archives aparecerán en esta sección y no se mostrarán en la portada.'}
          </p>
        </div>
      ) : (
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {filteredList.map((comm) => (
            <CommunicationCard
              key={comm.id}
              comm={comm}
              isLoading={loadingId === comm.id}
              isPending={isPending}
              onRepublish={handleRepublish}
              onArchive={handleArchive}
              onUnarchive={handleUnarchive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
