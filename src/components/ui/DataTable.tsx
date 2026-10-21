import React, { type ReactNode } from 'react'
import { Inbox } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface Column<T> {
  key: string
  header: ReactNode
  render?: (item: T, index: number) => ReactNode
  className?: string
  headerClassName?: string
  align?: 'left' | 'center' | 'right'
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor?: (item: T, index: number) => string | number
  onRowClick?: (item: T) => void
  emptyState?: ReactNode
  isLoading?: boolean
  className?: string
  tableClassName?: string
}

const alignStyles = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  emptyState,
  isLoading = false,
  className,
  tableClassName,
}: DataTableProps<T>) {
  const hasRows = data.length > 0

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-xs',
        className
      )}
    >
      <div className="overflow-x-auto max-h-[70vh]">
        <table className={cn('w-full border-collapse text-sm text-left', tableClassName)}>
          <thead className="sticky top-0 z-10 border-b border-zinc-200/90 bg-zinc-50/95 backdrop-blur-xs">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  scope="col"
                  className={cn(
                    'px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider',
                    alignStyles[col.align || 'left'],
                    col.headerClassName
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100 bg-white">
            {isLoading ? (
              // Loading skeleton rows
              Array.from({ length: 4 }).map((_, rIdx) => (
                <tr key={`loading-row-${rIdx}`} className="animate-pulse">
                  {columns.map((col, cIdx) => (
                    <td key={`loading-col-${cIdx}`} className="px-4 py-3.5">
                      <div className="h-4 w-3/4 rounded bg-zinc-100" />
                    </td>
                  ))}
                </tr>
              ))
            ) : hasRows ? (
              data.map((item, rowIdx) => {
                const rowKey = keyExtractor ? keyExtractor(item, rowIdx) : rowIdx
                const isClickable = Boolean(onRowClick)

                return (
                  <tr
                    key={rowKey}
                    onClick={() => isClickable && onRowClick?.(item)}
                    className={cn(
                      'transition-colors duration-150 motion-reduce:transition-none',
                      'hover:bg-zinc-50/80',
                      isClickable && 'cursor-pointer select-none active:bg-zinc-100/70'
                    )}
                  >
                    {columns.map((col, colIdx) => (
                      <td
                        key={col.key || colIdx}
                        className={cn(
                          'px-4 py-3 text-zinc-700 whitespace-nowrap',
                          alignStyles[col.align || 'left'],
                          col.className
                        )}
                      >
                        {col.render
                          ? col.render(item, rowIdx)
                          : item[col.key] !== undefined
                            ? item[col.key]
                            : null}
                      </td>
                    ))}
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  {emptyState || (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="rounded-full bg-zinc-100 p-3 text-zinc-400">
                        <Inbox className="h-6 w-6" strokeWidth={1.5} />
                      </div>
                      <p className="text-sm font-medium text-zinc-800">
                        No hay registros para mostrar
                      </p>
                      <p className="text-xs text-zinc-400">
                        Los datos cargados aparecerán en esta tabla.
                      </p>
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
