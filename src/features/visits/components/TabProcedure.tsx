import { useState } from 'react'
import { CheckCircle2, Circle, XCircle, Plus, Trash2 } from 'lucide-react'
import { useAuthStore } from '../../../store/authStore'
import { useVisitProcedures, useCreateVisitProcedure } from '../hooks/useVisitProcedures'
import { useTreatmentPlansForVisit, useUpdateTreatmentPlanItemStatus } from '../hooks/useTreatmentPlans'
import { Button, Card, Input, Textarea, Spinner, Badge } from '../../../components/ui'
import { cn } from '../../../lib/utils'
import type { VisitDetail } from '../hooks/useVisit'
import type { VisitProcedure } from '../hooks/useVisitProcedures'
import type { TreatmentPlanItem } from '../hooks/useTreatmentPlans'

interface TabProcedureProps {
  visit: VisitDetail
}

export function TabProcedure({ visit }: TabProcedureProps) {
  const profile = useAuthStore((s) => s.profile)
  const isReadOnly = visit.status === 'completed'

  const { data: procedures = [], isLoading: loadingProc } = useVisitProcedures(visit.id)
  const { data: plans = [], isLoading: loadingPlan } = useTreatmentPlansForVisit(visit.id)
  const createProcedure = useCreateVisitProcedure()
  const updateItemStatus = useUpdateTreatmentPlanItemStatus()

  const [showAddForm, setShowAddForm] = useState(false)
  const [description, setDescription] = useState('')
  const [toothFdi, setToothFdi] = useState('')
  const [price, setPrice] = useState('')

  const activePlan = plans[0] ?? null
  const planItems = (activePlan?.items ?? []).slice().sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  )

  // Procedure koje NISU nastale iz plana (slobodne)
  // Razlikujemo ih jer plan procedure imaju isti service_id
  const freeProcedures = procedures

  async function handleTickPlanItem(item: TreatmentPlanItem) {
    if (!profile || isReadOnly) return
    const isCompleted = item.status === 'completed'

    try {
      if (isCompleted) {
        // Undo: vrati na planned
        await updateItemStatus.mutateAsync({ itemId: item.id, status: 'planned' })
      } else {
        // Tick: označi completed + auto-kreiraj visit_procedure
        await Promise.all([
          updateItemStatus.mutateAsync({ itemId: item.id, status: 'completed' }),
          createProcedure.mutateAsync({
            clinic_id: visit.clinic_id,
            visit_id: visit.id,
            patient_id: visit.patient_id,
            doctor_id: visit.doctor_id,
            service_id: item.service_id ?? null,
            tooth_fdi: item.tooth_fdi ?? null,
            description: item.description,
            price: item.estimated_price ?? null,
          }),
        ])
      }
    } catch {
      // error state iz mutation
    }
  }

  async function handleSkipPlanItem(item: TreatmentPlanItem) {
    if (!profile || isReadOnly) return
    try {
      await updateItemStatus.mutateAsync({ itemId: item.id, status: 'skipped' })
    } catch {
      // error state
    }
  }

  async function handleAddFree() {
    if (!profile || !description.trim()) return
    try {
      await createProcedure.mutateAsync({
        clinic_id: visit.clinic_id,
        visit_id: visit.id,
        patient_id: visit.patient_id,
        doctor_id: visit.doctor_id,
        service_id: null,
        tooth_fdi: toothFdi.trim() || null,
        description: description.trim(),
        price: price ? parseFloat(price) : null,
      })
      setDescription('')
      setToothFdi('')
      setPrice('')
      setShowAddForm(false)
    } catch {
      // error state
    }
  }

  const isLoading = loadingProc || loadingPlan

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" className="text-teal-600" />
      </div>
    )
  }

  return (
    <div className="p-4 space-y-5 max-w-3xl">
      {isReadOnly && (
        <div className="px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-400">
          Poseta je završena — sadržaj je zaključan za izmene.
        </div>
      )}

      {/* ── Iz plana lečenja ── */}
      {activePlan && (
        <section>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Iz plana lečenja
            </h3>
            <span className="text-xs text-slate-400 dark:text-slate-500">— {activePlan.title}</span>
          </div>

          <div className="space-y-1">
            {planItems.length === 0 && (
              <p className="text-sm text-slate-400 dark:text-slate-500 py-2">
                Plan nema stavki.
              </p>
            )}
            {planItems.map((item) => (
              <PlanItemRow
                key={item.id}
                item={item}
                isReadOnly={isReadOnly}
                isPending={updateItemStatus.isPending || createProcedure.isPending}
                onTick={() => handleTickPlanItem(item)}
                onSkip={() => handleSkipPlanItem(item)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Slobodne procedure ── */}
      <section>
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
          {activePlan ? 'Slobodne procedure' : 'Procedure'}
        </h3>

        {freeProcedures.length === 0 && !showAddForm && (
          <p className="text-sm text-slate-400 dark:text-slate-500 py-2">
            {isReadOnly ? 'Nema slobodnih procedura.' : 'Nema slobodnih procedura. Dodaj ispod.'}
          </p>
        )}

        <div className="space-y-1.5 mb-3">
          {freeProcedures.map((proc) => (
            <FreeProcedureRow key={proc.id} procedure={proc} />
          ))}
        </div>

        {!isReadOnly && (
          showAddForm ? (
            <Card padding="sm">
              <div className="space-y-3">
                <Textarea
                  label="Procedura *"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Npr. Plomba, Ekstrakcija, Čišćenje..."
                  rows={2}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Zub (FDI)"
                    value={toothFdi}
                    onChange={(e) => setToothFdi(e.target.value)}
                    placeholder="npr. 36"
                  />
                  <Input
                    label="Cena (RSD)"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleAddFree}
                    loading={createProcedure.isPending}
                    disabled={!description.trim()}
                  >
                    Dodaj
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>
                    Otkaži
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Dodaj slobodnu proceduru
            </button>
          )
        )}
      </section>
    </div>
  )
}

// ── Plan item red ──

interface PlanItemRowProps {
  item: TreatmentPlanItem
  isReadOnly: boolean
  isPending: boolean
  onTick: () => void
  onSkip: () => void
}

function PlanItemRow({ item, isReadOnly, isPending, onTick, onSkip }: PlanItemRowProps) {
  const status = item.status as string
  const isCompleted = status === 'completed'
  const isSkipped = status === 'skipped'

  return (
    <div
      className={cn(
        'flex items-center gap-2 p-2 rounded-lg group transition-colors',
        'hover:bg-slate-50 dark:hover:bg-slate-700/40',
        isCompleted && 'opacity-60',
        isSkipped && 'opacity-40',
      )}
    >
      {/* Checkbox / status */}
      {!isReadOnly ? (
        <button
          onClick={onTick}
          disabled={isPending || isSkipped}
          className="shrink-0 focus:outline-none"
          title={isCompleted ? 'Vrati na planirano' : 'Označi kao urađeno'}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          ) : isSkipped ? (
            <XCircle className="w-5 h-5 text-slate-400" />
          ) : (
            <Circle className="w-5 h-5 text-slate-300 dark:text-slate-500 hover:text-teal-500 transition-colors" />
          )}
        </button>
      ) : (
        <span className="shrink-0">
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          ) : isSkipped ? (
            <XCircle className="w-5 h-5 text-slate-400" />
          ) : (
            <Circle className="w-5 h-5 text-slate-300 dark:text-slate-500" />
          )}
        </span>
      )}

      {/* Opis */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-medium',
            isCompleted || isSkipped
              ? 'line-through text-slate-400 dark:text-slate-500'
              : 'text-slate-700 dark:text-slate-200',
          )}
        >
          {item.description}
          {item.tooth_fdi && (
            <span className="ml-1 text-xs font-mono text-slate-400">(zub {item.tooth_fdi})</span>
          )}
        </p>
      </div>

      {/* Cena */}
      {item.estimated_price != null && (
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 shrink-0">
          {item.estimated_price.toLocaleString('sr-RS')} RSD
        </span>
      )}

      {/* Skip akcija */}
      {!isReadOnly && !isCompleted && !isSkipped && (
        <button
          onClick={onSkip}
          disabled={isPending}
          className="shrink-0 p-1 rounded text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors opacity-0 group-hover:opacity-100"
          title="Preskoči"
        >
          <XCircle className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

// ── Slobodna procedura red ──

function FreeProcedureRow({ procedure }: { procedure: VisitProcedure }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
      <Trash2 className="w-4 h-4 text-transparent shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700 dark:text-slate-200 truncate">
          {procedure.description ?? 'Procedura'}
          {procedure.tooth_fdi && (
            <span className="ml-1 text-xs font-mono text-slate-400">(zub {procedure.tooth_fdi})</span>
          )}
        </p>
      </div>
      {procedure.price != null && (
        <Badge variant="neutral" className="shrink-0 font-mono text-xs">
          {procedure.price.toLocaleString('sr-RS')} RSD
        </Badge>
      )}
    </div>
  )
}
