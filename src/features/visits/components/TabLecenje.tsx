import { CheckCircle2, Circle, XCircle } from 'lucide-react'
import { useTreatmentPlansForVisit, useUpdateTreatmentPlanItemStatus } from '../hooks/useTreatmentPlans'
import { Card, Badge, Spinner } from '../../../components/ui'
import type { VisitDetail } from '../hooks/useVisit'

interface TabLecenjeProps {
  visit: VisitDetail
}

export function TabLecenje({ visit }: TabLecenjeProps) {
  const { data: plans = [], isLoading } = useTreatmentPlansForVisit(visit.id)
  const updateItemStatus = useUpdateTreatmentPlanItemStatus()

  async function handleMarkItem(itemId: string, status: 'completed' | 'skipped') {
    try {
      await updateItemStatus.mutateAsync({ itemId, status })
    } catch (err) {
      console.error('Greška pri ažuriranju stavke:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Spinner size="lg" className="text-teal-600" />
      </div>
    )
  }

  if (plans.length === 0) {
    return (
      <div className="p-4 text-slate-500 dark:text-slate-400 text-center py-8">
        Nema aktivnih planova lečenja za ovaj termin
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4 max-w-4xl">
      {plans.map((plan) => (
        <Card key={plan.id} header={plan.title}>
          <div className="space-y-2">
            {/* Plan info */}
            <div className="flex items-center gap-2 mb-3">
              <Badge
                variant={
                  plan.status === 'accepted'
                    ? 'success'
                    : plan.status === 'in_progress'
                      ? 'warning'
                      : 'neutral'
                }
              >
                {plan.status}
              </Badge>
              {plan.estimated_total && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Procena: {plan.estimated_total.toLocaleString('sr-RS')} RSD
                </span>
              )}
            </div>

            {/* Items */}
            <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-700 pt-3">
              {plan.items && plan.items.length > 0 ? (
                plan.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {item.status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${
                            item.status === 'completed'
                              ? 'text-slate-400 dark:text-slate-500 line-through'
                              : 'text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          {item.description}
                        </p>
                        {item.estimated_price && (
                          <p className="text-xs text-slate-400 dark:text-slate-500">
                            {item.estimated_price.toLocaleString('sr-RS')} RSD
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {item.status !== 'completed' && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleMarkItem(item.id, 'completed')}
                          disabled={updateItemStatus.isPending}
                          className="p-1 rounded text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
                          title="Označi kao završeno"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMarkItem(item.id, 'skipped')}
                          disabled={updateItemStatus.isPending}
                          className="p-1 rounded text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                          title="Preskoči"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 py-2">
                  Nema stavki u ovom planu
                </p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
