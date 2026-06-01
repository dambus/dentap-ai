import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { useVisit } from '../features/visits/hooks/useVisit'
import { VisitHeader } from '../features/visits/components/VisitHeader'
import { TabPregled } from '../features/visits/components/TabPregled'
import { TabProcedure } from '../features/visits/components/TabProcedure'
import { Spinner } from '../components/ui'
import { cn } from '../lib/utils'

type VisitTab = 'pregled' | 'uradjeno'

const TABS: { id: VisitTab; label: string }[] = [
  { id: 'pregled', label: 'Pregled' },
  { id: 'uradjeno', label: 'Urađeno' },
]

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
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
              tab === t.id
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab sadržaj */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'pregled' && <TabPregled visit={visit} />}
        {tab === 'uradjeno' && <TabProcedure visit={visit} />}
      </div>
    </div>
  )
}
