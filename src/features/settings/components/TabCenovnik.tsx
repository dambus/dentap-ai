import { useState } from 'react'
import { Plus, ToggleRight, ToggleLeft, ChevronDown, ChevronUp } from 'lucide-react'
import { useAuthStore } from '../../../store/authStore'
import { useServicesAll, useCreateService, useUpdateService, SERVICE_CATEGORIES, CATEGORY_LABELS } from '../hooks/useServicesCRUD'
import type { ServiceRow } from '../hooks/useServicesCRUD'
import { Button, Input, Spinner } from '../../../components/ui'
import { cn } from '../../../lib/utils'

export function TabCenovnik() {
  const clinic = useAuthStore((s) => s.clinic)
  const { data: services = [], isLoading } = useServicesAll(clinic?.id ?? null)
  const createService = useCreateService()
  const updateService = useUpdateService()
  const [showAdd, setShowAdd] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  // Grupisanje po kategoriji
  const grouped = SERVICE_CATEGORIES.reduce<Record<string, ServiceRow[]>>((acc, cat) => {
    acc[cat] = services.filter((s) => s.category === cat)
    return acc
  }, {})
  const uncategorized = services.filter((s) => !s.category)
  if (uncategorized.length > 0) grouped['ostalo'] = uncategorized

  async function handleToggle(service: ServiceRow) {
    if (!clinic?.id) return
    try {
      await updateService.mutateAsync({ id: service.id, clinicId: clinic.id, data: { is_active: !service.is_active } })
    } catch { /* mutation handles */ }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" className="text-teal-600" />
    </div>
  )

  return (
    <div className="p-6 max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
          Cenovnik ({services.filter(s => s.is_active).length} aktivnih)
        </h2>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Nova usluga
        </Button>
      </div>

      {showAdd && clinic && (
        <AddServiceForm
          clinicId={clinic.id}
          onCreate={createService.mutateAsync}
          isLoading={createService.isPending}
          onClose={() => setShowAdd(false)}
        />
      )}

      {/* Grupisan cenovnik */}
      {Object.entries(grouped).map(([cat, items]) => {
        if (items.length === 0) return null
        const label = CATEGORY_LABELS[cat] ?? cat
        const isExpanded = expandedCategory === cat || expandedCategory === null

        return (
          <div key={cat} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <button
              onClick={() => setExpandedCategory(expandedCategory === cat ? null : cat)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{items.length} usluga</span>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-slate-100 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700">
                {items.map((svc) => (
                  <ServiceRow
                    key={svc.id}
                    service={svc}
                    clinicId={clinic?.id ?? ''}
                    onToggle={() => handleToggle(svc)}
                    onUpdate={updateService.mutateAsync}
                    isPending={updateService.isPending}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// --- Red usluge sa inline editovanjem ---

function ServiceRow({
  service, clinicId, onToggle, onUpdate, isPending,
}: {
  service: ServiceRow
  clinicId: string
  onToggle: () => void
  onUpdate: (args: { id: string; clinicId: string; data: Partial<Pick<ServiceRow, 'name' | 'default_price' | 'duration_min'>> }) => Promise<unknown>
  isPending: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(service.name)
  const [price, setPrice] = useState(service.default_price?.toString() ?? '')
  const [duration, setDuration] = useState(service.duration_min?.toString() ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await onUpdate({
        id: service.id,
        clinicId,
        data: {
          name: name.trim() || service.name,
          default_price: price ? parseFloat(price) : null,
          duration_min: duration ? parseInt(duration) : null,
        },
      })
      setEditing(false)
    } catch { /* mutation handles */ }
    finally { setSaving(false) }
  }

  return (
    <div className={cn('flex items-center gap-3 px-4 py-2.5 group', !service.is_active && 'opacity-50')}>
      {editing ? (
        <>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 text-sm border-b border-teal-400 bg-transparent focus:outline-none text-slate-800 dark:text-slate-100"
          />
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type="number"
            placeholder="Cena"
            className="w-20 text-sm text-right border-b border-teal-400 bg-transparent focus:outline-none text-slate-800 dark:text-slate-100"
          />
          <span className="text-xs text-slate-400">RSD</span>
          <input
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            type="number"
            placeholder="min"
            className="w-12 text-sm text-right border-b border-teal-400 bg-transparent focus:outline-none text-slate-800 dark:text-slate-100"
          />
          <span className="text-xs text-slate-400">min</span>
          <button onClick={handleSave} disabled={saving} className="text-xs text-teal-600 dark:text-teal-400 font-medium">
            {saving ? '...' : 'Sačuvaj'}
          </button>
          <button onClick={() => setEditing(false)} className="text-xs text-slate-400">Otkaži</button>
        </>
      ) : (
        <>
          <span
            className="flex-1 text-sm text-slate-700 dark:text-slate-200 cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            onClick={() => setEditing(true)}
          >
            {service.name}
          </span>
          {service.duration_min && (
            <span className="text-xs text-slate-400 shrink-0">{service.duration_min} min</span>
          )}
          {service.default_price != null && (
            <span className="text-xs font-mono text-slate-600 dark:text-slate-400 shrink-0">
              {service.default_price.toLocaleString('sr-RS')} RSD
            </span>
          )}
          <button
            onClick={onToggle}
            disabled={isPending}
            className="shrink-0 text-slate-300 hover:text-slate-500 dark:hover:text-slate-200 transition-colors"
            title={service.is_active ? 'Deaktiviraj' : 'Aktiviraj'}
          >
            {service.is_active
              ? <ToggleRight className="w-4 h-4 text-teal-500" />
              : <ToggleLeft className="w-4 h-4" />
            }
          </button>
        </>
      )}
    </div>
  )
}

// --- Forma za novu uslugu ---

function AddServiceForm({
  clinicId, onCreate, isLoading, onClose,
}: {
  clinicId: string
  onCreate: (data: Parameters<ReturnType<typeof useCreateService>['mutateAsync']>[0]) => Promise<unknown>
  isLoading: boolean
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<string>(SERVICE_CATEGORIES[0])
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('30')

  async function handleCreate() {
    if (!name.trim()) return
    try {
      await onCreate({
        clinic_id: clinicId,
        name: name.trim(),
        category,
        default_price: price ? parseFloat(price) : null,
        duration_min: duration ? parseInt(duration) : null,
        is_active: true,
        sort_order: 0,
      })
      onClose()
    } catch { /* mutation handles */ }
  }

  return (
    <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl p-4 space-y-3">
      <p className="text-sm font-semibold text-teal-800 dark:text-teal-200">Nova usluga</p>
      <Input label="Naziv usluge *" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Kategorija</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-600 px-2 py-2 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            {SERVICE_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
          </select>
        </div>
        <Input label="Cena (RSD)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
        <Input label="Trajanje (min)" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="30" />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleCreate} loading={isLoading} disabled={!name.trim()}>Dodaj</Button>
        <Button size="sm" variant="ghost" onClick={onClose}>Otkaži</Button>
      </div>
    </div>
  )
}
