import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ChevronRight, Calendar } from 'lucide-react'
import { useVisits } from '../features/visits/hooks/useVisits'
import { Spinner, VisitStatusBadge } from '../components/ui'
import { formatDate } from '../lib/date'
import { cn } from '../lib/utils'

const PAGE_SIZE = 20

export function PostePage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const { data, isLoading } = useVisits({ page, pageSize: PAGE_SIZE })

  const visits = data?.visits ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Spinner size="lg" className="text-teal-600" />
      </div>
    )
  }

  if (visits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-500 dark:text-slate-400">
        <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600" />
        <p className="text-sm font-medium">Nema poseta</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
      {/* Lista poseta */}
      <div className="flex-1 overflow-y-auto">
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {visits.map((v) => (
            <li key={v.id}>
              <button
                onClick={() => navigate(`/posete/${v.id}`)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                    {v.patient.last_name} {v.patient.first_name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(v.visit_date)}
                    {v.diagnosis && ` · ${v.diagnosis}`}
                  </p>
                </div>
                <VisitStatusBadge status={v.status as 'draft' | 'completed'} />
                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500 transition-colors shrink-0" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Paginacija */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} od {total}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                page <= 1
                  ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              )}
            >
              Prethodna
            </button>
            <span className="px-2 text-xs text-slate-500 dark:text-slate-400">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                page >= totalPages
                  ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              )}
            >
              Sledeća
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
