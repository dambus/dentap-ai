import { useState } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash2, CheckCircle2, XCircle, Circle } from 'lucide-react'
import { format } from 'date-fns'
import { sr } from 'date-fns/locale'
import {
  useTreatmentPlans,
  useCreateTreatmentPlan,
  useUpdateTreatmentPlan,
  useCreateTreatmentPlanItem,
  useUpdateTreatmentPlanItem,
  useDeleteTreatmentPlanItem,
} from '../hooks/useTreatmentPlans'
import type { TreatmentPlanWithItems, TreatmentPlanItem, PlanStatus, ItemStatus } from '../hooks/useTreatmentPlans'
import { useServices } from '../hooks/useServices'
import { useAuthStore } from '../../../store/authStore'
import { Button, Card, Badge, Input, Textarea, Spinner } from '../../../components/ui'
import { cn } from '../../../lib/utils'

interface TabPlanLecenjaProps {
  patientId: string
  clinicId: string
}

// --- Status konfiguracija ---

const PLAN_STATUS_LABELS: Record<PlanStatus, string> = {
  draft: 'Nacrt',
  proposed: 'Predložen',
  accepted: 'Prihvaćen',
  in_progress: 'U toku',
  completed: 'Završen',
  archived: 'Arhiviran',
}

const PLAN_STATUS_BADGE: Record<PlanStatus, 'neutral' | 'info' | 'success' | 'warning' | 'danger'> = {
  draft: 'neutral',
  proposed: 'info',
  accepted: 'success',
  in_progress: 'warning',
  completed: 'success',
  archived: 'neutral',
}

const PLAN_TRANSITIONS: Partial<Record<PlanStatus, { label: string; next: PlanStatus }>> = {
  draft: { label: 'Predloži pacijentu', next: 'proposed' },
  proposed: { label: 'Označi kao prihvaćen', next: 'accepted' },
  accepted: { label: 'Počni lečenje', next: 'in_progress' },
  in_progress: { label: 'Završi plan', next: 'completed' },
}

const ITEM_STATUS_LABELS: Record<ItemStatus, string> = {
  planned: 'Planirano',
  in_progress: 'U toku',
  completed: 'Završeno',
  skipped: 'Preskočeno',
}

// --- Glavni tab ---

export function TabPlanLecenja({ patientId, clinicId }: TabPlanLecenjaProps) {
  const profile = useAuthStore((s) => s.profile)
  const { data: plans = [], isLoading } = useTreatmentPlans(patientId)
  const createPlan = useCreateTreatmentPlan()
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null)

  async function handleNewPlan() {
    if (!profile) return
    const title = `Plan lečenja — ${format(new Date(), 'd. MMMM yyyy.', { locale: sr })}`
    try {
      const created = await createPlan.mutateAsync({
        clinic_id: clinicId,
        patient_id: patientId,
        doctor_id: profile.id,
        title,
        status: 'draft',
        created_by: profile.id,
      })
      if (created) setExpandedPlanId(created.id)
    } catch {
      // error state iz mutation
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" className="text-teal-600" />
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
          Planovi lečenja
        </h2>
        <Button
          size="sm"
          onClick={handleNewPlan}
          loading={createPlan.isPending}
        >
          <Plus className="w-4 h-4 mr-1" />
          Novi plan
        </Button>
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          <p className="text-sm">Nema planova lečenja.</p>
          <p className="text-xs mt-1">Klikni „Novi plan" da dodaš prvi.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              patientId={patientId}
              clinicId={clinicId}
              isExpanded={expandedPlanId === plan.id}
              onToggle={() =>
                setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id)
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}

// --- Plan kartica ---

interface PlanCardProps {
  plan: TreatmentPlanWithItems
  patientId: string
  clinicId: string
  isExpanded: boolean
  onToggle: () => void
}

function PlanCard({ plan, patientId, clinicId, isExpanded, onToggle }: PlanCardProps) {
  const updatePlan = useUpdateTreatmentPlan()
  const [showAddItem, setShowAddItem] = useState(false)

  const status = plan.status as PlanStatus
  const transition = PLAN_TRANSITIONS[status]
  const isReadOnly = status === 'completed' || status === 'archived'

  const estimatedTotal = plan.items.reduce((sum, item) => sum + (item.estimated_price ?? 0), 0)

  async function handleStatusTransition() {
    if (!transition) return
    try {
      await updatePlan.mutateAsync({
        planId: plan.id,
        patientId,
        data: { status: transition.next },
      })
    } catch {
      // mutation handles error state
    }
  }

  async function handleArchive() {
    try {
      await updatePlan.mutateAsync({
        planId: plan.id,
        patientId,
        data: { status: 'archived' },
      })
    } catch {
      // mutation handles error state
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="font-medium text-slate-800 dark:text-slate-100 text-sm truncate">
            {plan.title}
          </span>
          <Badge variant={PLAN_STATUS_BADGE[status]}>
            {PLAN_STATUS_LABELS[status]}
          </Badge>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {estimatedTotal > 0 && (
            <span className="text-sm font-mono text-slate-600 dark:text-slate-400">
              {estimatedTotal.toLocaleString('sr-RS')} RSD
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {/* Expanded sadržaj */}
      {isExpanded && (
        <div className="border-t border-slate-100 dark:border-slate-700">
          {/* Akcije plana */}
          {!isReadOnly && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-700/30 flex-wrap">
              {transition && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleStatusTransition}
                  loading={updatePlan.isPending}
                >
                  {transition.label}
                </Button>
              )}
              {status !== 'archived' && status !== 'completed' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleArchive}
                  loading={updatePlan.isPending}
                >
                  Arhiviraj
                </Button>
              )}
            </div>
          )}

          {/* Lista stavki */}
          <div className="px-4 py-3 space-y-1">
            {plan.items.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 py-2 text-center">
                Nema stavki. Dodaj prvu ispod.
              </p>
            ) : (
              plan.items
                .slice()
                .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                .map((item) => (
                  <PlanItemRow
                    key={item.id}
                    item={item}
                    patientId={patientId}
                    isReadOnly={isReadOnly}
                  />
                ))
            )}
          </div>

          {/* Ukupno */}
          {estimatedTotal > 0 && (
            <div className="flex justify-end px-4 py-2 border-t border-slate-100 dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Ukupno:{' '}
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-100">
                  {estimatedTotal.toLocaleString('sr-RS')} RSD
                </span>
              </span>
            </div>
          )}

          {/* Dodaj stavku */}
          {!isReadOnly && (
            <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-700">
              {showAddItem ? (
                <AddItemForm
                  planId={plan.id}
                  patientId={patientId}
                  clinicId={clinicId}
                  onClose={() => setShowAddItem(false)}
                />
              ) : (
                <button
                  onClick={() => setShowAddItem(true)}
                  className="flex items-center gap-1.5 text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Dodaj stavku
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// --- Red stavke plana ---

interface PlanItemRowProps {
  item: TreatmentPlanItem
  patientId: string
  isReadOnly: boolean
}

function PlanItemRow({ item, patientId, isReadOnly }: PlanItemRowProps) {
  const updateItem = useUpdateTreatmentPlanItem()
  const deleteItem = useDeleteTreatmentPlanItem()

  const status = item.status as ItemStatus

  async function handleStatusChange(newStatus: ItemStatus) {
    try {
      await updateItem.mutateAsync({ itemId: item.id, patientId, data: { status: newStatus } })
    } catch {
      // handled by mutation
    }
  }

  async function handleDelete() {
    try {
      await deleteItem.mutateAsync({ itemId: item.id, patientId })
    } catch {
      // handled by mutation
    }
  }

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
      {/* Status ikona */}
      <div className="shrink-0">
        {isCompleted ? (
          <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
        ) : isSkipped ? (
          <XCircle className="w-4 h-4 text-slate-400" />
        ) : (
          <Circle className="w-4 h-4 text-slate-300 dark:text-slate-500" />
        )}
      </div>

      {/* Opis */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-medium',
            isCompleted
              ? 'line-through text-slate-400 dark:text-slate-500'
              : isSkipped
                ? 'line-through text-slate-400 dark:text-slate-500'
                : 'text-slate-700 dark:text-slate-200',
          )}
        >
          {item.description}
          {item.tooth_fdi && (
            <span className="ml-1 text-xs font-mono text-slate-400 dark:text-slate-500">
              (zub {item.tooth_fdi})
            </span>
          )}
        </p>
        {item.notes && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{item.notes}</p>
        )}
      </div>

      {/* Cena */}
      {item.estimated_price != null && (
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 shrink-0">
          {item.estimated_price.toLocaleString('sr-RS')} RSD
        </span>
      )}

      {/* Akcije */}
      {!isReadOnly && (
        <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isCompleted && (
            <button
              onClick={() => handleStatusChange('completed')}
              disabled={updateItem.isPending}
              className="p-1 rounded text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors"
              title="Označi završeno"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          )}
          {isCompleted && (
            <button
              onClick={() => handleStatusChange('planned')}
              disabled={updateItem.isPending}
              className="p-1 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Vrati na planirano"
            >
              <Circle className="w-3.5 h-3.5" />
            </button>
          )}
          {!isSkipped && !isCompleted && (
            <button
              onClick={() => handleStatusChange('skipped')}
              disabled={updateItem.isPending}
              className="p-1 rounded text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors"
              title="Preskoči"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={deleteItem.isPending}
            className="p-1 rounded text-slate-300 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            title="Ukloni stavku"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

// --- Forma za novu stavku ---

interface AddItemFormProps {
  planId: string
  patientId: string
  clinicId: string
  onClose: () => void
}

function AddItemForm({ planId, patientId, clinicId, onClose }: AddItemFormProps) {
  const { data: services = [] } = useServices(clinicId)
  const createItem = useCreateTreatmentPlanItem()

  const [description, setDescription] = useState('')
  const [toothFdi, setToothFdi] = useState('')
  const [price, setPrice] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedServiceId, setSelectedServiceId] = useState<string>('')

  function handleServiceChange(serviceId: string) {
    setSelectedServiceId(serviceId)
    if (!serviceId) return
    const service = services.find((s) => s.id === serviceId)
    if (service) {
      if (!description) setDescription(service.name)
      if (!price && service.default_price != null) {
        setPrice(String(service.default_price))
      }
    }
  }

  async function handleSubmit() {
    if (!description.trim()) return
    try {
      await createItem.mutateAsync({
        clinic_id: clinicId,
        treatment_plan_id: planId,
        patient_id: patientId,
        description: description.trim(),
        tooth_fdi: toothFdi.trim() || null,
        service_id: selectedServiceId || null,
        estimated_price: price ? parseFloat(price) : null,
        notes: notes.trim() || null,
        status: 'planned',
        priority: 0,
        sort_order: 0,
      })
      setDescription('')
      setToothFdi('')
      setPrice('')
      setNotes('')
      setSelectedServiceId('')
      onClose()
    } catch {
      // mutation handles error state
    }
  }

  return (
    <Card padding="sm">
      <div className="space-y-3">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
          Nova stavka
        </p>

        {/* Usluga iz cenovnika (opciono) */}
        {services.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Usluga iz cenovnika (opciono)
            </label>
            <select
              value={selectedServiceId}
              onChange={(e) => handleServiceChange(e.target.value)}
              className={cn(
                'w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-slate-800',
                'border-slate-200 dark:border-slate-700',
                'text-slate-800 dark:text-slate-100',
                'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500',
              )}
            >
              <option value="">— Izaberi uslugu —</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                  {s.default_price != null ? ` (${s.default_price.toLocaleString('sr-RS')} RSD)` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        <Textarea
          label="Opis *"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Npr. Plomba na zubu 36, Ekstrakcija..."
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
            label="Procenjena cena (RSD)"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0"
          />
        </div>

        <Input
          label="Napomena"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Opciona napomena..."
        />

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleSubmit}
            loading={createItem.isPending}
            disabled={!description.trim()}
          >
            Dodaj stavku
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose}>
            Otkaži
          </Button>
          {createItem.isError && (
            <span className="text-xs text-red-600 dark:text-red-400">Greška</span>
          )}
        </div>
      </div>
    </Card>
  )
}
