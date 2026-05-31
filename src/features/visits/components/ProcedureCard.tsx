import { Trash2 } from 'lucide-react'
import { Card, Badge } from '../../../components/ui'
import type { VisitProcedure } from '../hooks/useVisitProcedures'

interface ProcedureCardProps {
  procedure: VisitProcedure & {
    service?: { name: string; category: string; estimated_cost: number | null } | null
  }
  onDelete?: () => void
}

export function ProcedureCard({ procedure, onDelete }: ProcedureCardProps) {
  return (
    <Card className="flex items-start justify-between gap-3">
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {procedure.service?.name ?? 'Usluga'}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {procedure.service?.category}
        </p>
        {procedure.tooth_fdi && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Zub: {procedure.tooth_fdi}
          </p>
        )}
        {procedure.description && (
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 italic">
            {procedure.description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2">
          {procedure.price && (
            <Badge variant="success">{procedure.price.toLocaleString('sr-RS')} RSD</Badge>
          )}
        </div>
      </div>
      {onDelete && (
        <button
          onClick={onDelete}
          className="p-1.5 rounded text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </Card>
  )
}
