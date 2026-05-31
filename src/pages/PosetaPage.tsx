import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { useVisit } from '../features/visits/hooks/useVisit'
import { VisitHeader } from '../features/visits/components/VisitHeader'
import { TabPregled } from '../features/visits/components/TabPregled'
import { Spinner } from '../components/ui'
import { cn } from '../lib/utils'

type VisitTab = 'pregled' | 'proceduri' | 'lecenje'

export function PosetaPage() {
  const { id } = useParams<{ id: string }>()
  const [tab, setTab] = useState<VisitTab>('pregled')
  const { data: visit, isLoading } = useVisit(id ?? '')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Spinner size="lg" className="text-teal-600" />
      </div>
    )
  }

  if (!visit) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 dark:text-slate-400">
        Poseta nije pronađena
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <VisitHeader visit={visit as any} />

      {/* Tab navigacija */}
      <div className="flex items-center gap-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4">
        <button
          onClick={() => setTab('pregled')}
          className={cn(
            'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
            tab === 'pregled'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          )}
        >
          Pregled
        </button>
        <button
          onClick={() => setTab('proceduri')}
          className={cn(
            'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
            tab === 'proceduri'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          )}
        >
          Procedure
        </button>
        <button
          onClick={() => setTab('lecenje')}
          className={cn(
            'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
            tab === 'lecenje'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          )}
        >
          Lečenje
        </button>
      </div>

      {/* Tab sadržaj */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'pregled' && <TabPregled visit={visit} />}
        {tab === 'proceduri' && (
          <div className="p-4 text-slate-500 dark:text-slate-400">
            Procedure — Task 013
          </div>
        )}
        {tab === 'lecenje' && (
          <div className="p-4 text-slate-500 dark:text-slate-400">
            Lečenje — Task 014
          </div>
        )}
      </div>
    </div>
  )
}
