import {
  Bell,
  CalendarCheck,
  AlertTriangle,
  Info,
  Megaphone,
  Clock,
  Users,
} from 'lucide-react'

function getTypeConfig(type: 'urgente' | 'informativo' | 'recordatorio') {
  switch (type) {
    case 'urgente':
      return {
        icon: <AlertTriangle className="w-4 h-4" />,
        color: 'text-red-600',
        dotColor: 'bg-red-500',
        iconBg: 'bg-zinc-50 border border-zinc-200/60 text-zinc-500',
        label: 'Urgente',
        accentBar: 'bg-red-500',
      }
    case 'recordatorio':
      return {
        icon: <Bell className="w-4 h-4" />,
        color: 'text-amber-600',
        dotColor: 'bg-amber-500',
        iconBg: 'bg-zinc-50 border border-zinc-200/60 text-zinc-500',
        label: 'Recordatorio',
        accentBar: 'bg-amber-500',
      }
    default:
      return {
        icon: <Info className="w-4 h-4" />,
        color: 'text-indigo-600',
        dotColor: 'bg-indigo-500',
        iconBg: 'bg-zinc-50 border border-zinc-200/60 text-zinc-500',
        label: 'Informativo',
        accentBar: 'bg-zinc-400',
      }
  }
}

interface CommunicationsTabProps {
  schoolName?: string
  // TODO: tipado pendiente
  communications: any[]
}

export function CommunicationsTab({ schoolName = 'Colegio', communications }: CommunicationsTabProps) {
  return (
    <div className="space-y-4">

      {/* Header del Feed */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 pl-1">
          <Megaphone className="w-3.5 h-3.5 text-zinc-300" />
          Comunicados de {schoolName}
        </span>
        <span className="px-2 py-0.5 bg-zinc-100 text-zinc-500 text-[10px] font-medium rounded-full">
          {communications.length} {communications.length === 1 ? 'aviso' : 'avisos'}
        </span>
      </div>

      {/* Feed de Comunicados */}
      {communications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-8 text-center">
          <Megaphone className="w-6 h-6 text-zinc-300 mx-auto mb-2" />
          <p className="text-xs font-normal text-zinc-400">No hay comunicados oficiales en este momento.</p>
        </div>
      ) : (
        communications.map((comm) => {
          const config = getTypeConfig(comm.category)
          const dateObj = new Date(comm.created_at)
          const dateFormatted = dateObj.toLocaleDateString('es-VE', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })
          const timeFormatted = dateObj.toLocaleTimeString('es-VE', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })

          return (
            <div
              key={comm.id}
              className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden relative"
            >
              {/* Barra de Acento Lateral */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${config.accentBar}`} />

              <div className="pl-5 pr-5 py-5 space-y-3">
                {/* Cabecera */}
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${config.iconBg}`}>
                    {config.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xs font-semibold text-zinc-800 leading-tight">
                        {comm.title}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[9px] font-normal text-zinc-500">
                        <span className={`w-1 h-1 rounded-full ${config.dotColor}`} />
                        {config.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1.5 leading-relaxed whitespace-pre-wrap">
                      {comm.body}
                    </p>
                  </div>
                </div>

                {/* Metadatos */}
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-2 border-t border-zinc-100 text-[10px] font-normal text-zinc-400">
                  <span className="flex items-center gap-1">
                    <CalendarCheck className="w-3 h-3 text-zinc-300" />
                    {dateFormatted}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-300" />
                    {timeFormatted}
                  </span>
                  <span className="flex items-center gap-1 ml-auto">
                    <Users className="w-3 h-3 text-zinc-300" />
                    Dirección General
                  </span>
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
