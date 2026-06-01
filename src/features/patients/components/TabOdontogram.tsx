import { useState } from 'react'
import { useOdontogram, useUpsertTooth, TOOTH_STATUS_LABELS } from '../hooks/useOdontogram'
import type { ToothStatus } from '../hooks/useOdontogram'
import { useAuthStore } from '../../../store/authStore'
import { Button, Spinner, Textarea } from '../../../components/ui'
import { cn } from '../../../lib/utils'

// FDI layout: quadrant arrays go from posterior to anterior (distal to mesial)
// Display left-to-right from patient's right side
const PERMANENT_UPPER_RIGHT = ['18', '17', '16', '15', '14', '13', '12', '11']
const PERMANENT_UPPER_LEFT = ['21', '22', '23', '24', '25', '26', '27', '28']
const PERMANENT_LOWER_RIGHT = ['48', '47', '46', '45', '44', '43', '42', '41']
const PERMANENT_LOWER_LEFT = ['31', '32', '33', '34', '35', '36', '37', '38']

const PRIMARY_UPPER_RIGHT = ['55', '54', '53', '52', '51']
const PRIMARY_UPPER_LEFT = ['61', '62', '63', '64', '65']
const PRIMARY_LOWER_RIGHT = ['85', '84', '83', '82', '81']
const PRIMARY_LOWER_LEFT = ['71', '72', '73', '74', '75']

type DenticijaTip = 'stalna' | 'mlecna'

interface StatusConfig {
  label: string
  bg: string
  border: string
  text: string
  icon?: string
}

const STATUS_CONFIG: Record<ToothStatus, StatusConfig> = {
  healthy: {
    label: TOOTH_STATUS_LABELS.healthy,
    bg: 'bg-white dark:bg-slate-700',
    border: 'border-slate-200 dark:border-slate-500',
    text: 'text-slate-600 dark:text-slate-300',
  },
  decayed: {
    label: TOOTH_STATUS_LABELS.decayed,
    bg: 'bg-orange-100 dark:bg-orange-900/50',
    border: 'border-orange-400 dark:border-orange-500',
    text: 'text-orange-700 dark:text-orange-300',
    icon: 'K',
  },
  filled: {
    label: TOOTH_STATUS_LABELS.filled,
    bg: 'bg-blue-100 dark:bg-blue-900/50',
    border: 'border-blue-400 dark:border-blue-500',
    text: 'text-blue-700 dark:text-blue-300',
    icon: 'P',
  },
  crowned: {
    label: TOOTH_STATUS_LABELS.crowned,
    bg: 'bg-purple-100 dark:bg-purple-900/50',
    border: 'border-purple-400 dark:border-purple-500',
    text: 'text-purple-700 dark:text-purple-300',
    icon: 'Kr',
  },
  missing: {
    label: TOOTH_STATUS_LABELS.missing,
    bg: 'bg-slate-100 dark:bg-slate-800',
    border: 'border-slate-300 dark:border-slate-600',
    text: 'text-slate-400 dark:text-slate-500',
    icon: '—',
  },
  implant: {
    label: TOOTH_STATUS_LABELS.implant,
    bg: 'bg-cyan-100 dark:bg-cyan-900/50',
    border: 'border-cyan-400 dark:border-cyan-500',
    text: 'text-cyan-700 dark:text-cyan-300',
    icon: 'Im',
  },
  bridge: {
    label: TOOTH_STATUS_LABELS.bridge,
    bg: 'bg-violet-100 dark:bg-violet-900/50',
    border: 'border-violet-400 dark:border-violet-500',
    text: 'text-violet-700 dark:text-violet-300',
    icon: 'Mo',
  },
  root_canal: {
    label: TOOTH_STATUS_LABELS.root_canal,
    bg: 'bg-indigo-100 dark:bg-indigo-900/50',
    border: 'border-indigo-400 dark:border-indigo-500',
    text: 'text-indigo-700 dark:text-indigo-300',
    icon: 'Dv',
  },
  to_extract: {
    label: TOOTH_STATUS_LABELS.to_extract,
    bg: 'bg-red-100 dark:bg-red-900/50',
    border: 'border-red-400 dark:border-red-500',
    text: 'text-red-700 dark:text-red-300',
    icon: '✕',
  },
  extracted: {
    label: TOOTH_STATUS_LABELS.extracted,
    bg: 'bg-slate-200 dark:bg-slate-900',
    border: 'border-slate-400 dark:border-slate-700',
    text: 'text-slate-500 dark:text-slate-600',
    icon: '∅',
  },
  other: {
    label: TOOTH_STATUS_LABELS.other,
    bg: 'bg-amber-100 dark:bg-amber-900/50',
    border: 'border-amber-400 dark:border-amber-500',
    text: 'text-amber-700 dark:text-amber-300',
    icon: '?',
  },
}

const ALL_STATUSES: ToothStatus[] = [
  'healthy',
  'decayed',
  'filled',
  'crowned',
  'missing',
  'implant',
  'bridge',
  'root_canal',
  'to_extract',
  'extracted',
  'other',
]

interface TabOdontogramProps {
  patientId: string
  clinicId: string
}

export function TabOdontogram({ patientId, clinicId }: TabOdontogramProps) {
  const profile = useAuthStore((s) => s.profile)
  const { data: teeth = [], isLoading } = useOdontogram(patientId)
  const upsertTooth = useUpsertTooth()

  const [denticija, setDenticija] = useState<DenticijaTip>('stalna')
  const [selectedFdi, setSelectedFdi] = useState<string | null>(null)
  const [editStatus, setEditStatus] = useState<ToothStatus>('healthy')
  const [editNote, setEditNote] = useState('')
  const [saved, setSaved] = useState(false)

  const teethMap = new Map(teeth.map((t) => [t.tooth_fdi, t]))

  function getToothStatus(fdi: string): ToothStatus {
    const tooth = teethMap.get(fdi)
    return (tooth?.status as ToothStatus | undefined) ?? 'healthy'
  }

  function handleToothClick(fdi: string) {
    if (selectedFdi === fdi) {
      setSelectedFdi(null)
      return
    }
    const tooth = teethMap.get(fdi)
    setSelectedFdi(fdi)
    setEditStatus((tooth?.status as ToothStatus | undefined) ?? 'healthy')
    setEditNote(tooth?.treatment_note ?? '')
    setSaved(false)
  }

  async function handleSave() {
    if (!selectedFdi || !profile) return
    setSaved(false)
    try {
      await upsertTooth.mutateAsync({
        patientId,
        clinicId,
        toothFdi: selectedFdi,
        status: editStatus,
        treatmentNote: editNote.trim() || null,
        updatedBy: profile.id,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // error state handled by mutation
    }
  }

  const upperRight = denticija === 'stalna' ? PERMANENT_UPPER_RIGHT : PRIMARY_UPPER_RIGHT
  const upperLeft = denticija === 'stalna' ? PERMANENT_UPPER_LEFT : PRIMARY_UPPER_LEFT
  const lowerRight = denticija === 'stalna' ? PERMANENT_LOWER_RIGHT : PRIMARY_LOWER_RIGHT
  const lowerLeft = denticija === 'stalna' ? PERMANENT_LOWER_LEFT : PRIMARY_LOWER_LEFT

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" className="text-teal-600" />
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4 max-w-4xl">
      {/* Denticija toggle */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600 dark:text-slate-400">Denticija:</span>
        <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden text-sm">
          {(['stalna', 'mlecna'] as const).map((tip) => (
            <button
              key={tip}
              onClick={() => {
                setDenticija(tip)
                setSelectedFdi(null)
              }}
              className={cn(
                'px-3 py-1.5 font-medium transition-colors',
                tip === 'mlecna' && 'border-l border-slate-200 dark:border-slate-700',
                denticija === tip
                  ? 'bg-teal-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700',
              )}
            >
              {tip === 'stalna' ? 'Stalna (odrasli)' : 'Mlečna (deca)'}
            </button>
          ))}
        </div>
      </div>

      {/* Odontogram grid */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        {/* Gornja vilica */}
        <div className="mb-1">
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-2 text-center">
            Gornja vilica
          </p>
          <div className="flex justify-center items-end gap-0.5">
            <div className="flex gap-0.5">
              {upperRight.map((fdi) => (
                <ToothCell
                  key={fdi}
                  fdi={fdi}
                  status={getToothStatus(fdi)}
                  isSelected={selectedFdi === fdi}
                  position="upper"
                  onClick={() => handleToothClick(fdi)}
                />
              ))}
            </div>
            <div className="w-px self-stretch bg-slate-300 dark:bg-slate-600 mx-1" />
            <div className="flex gap-0.5">
              {upperLeft.map((fdi) => (
                <ToothCell
                  key={fdi}
                  fdi={fdi}
                  status={getToothStatus(fdi)}
                  isSelected={selectedFdi === fdi}
                  position="upper"
                  onClick={() => handleToothClick(fdi)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Midline gap */}
        <div className="my-2 flex items-center gap-1">
          <div className="flex-1 border-t border-dashed border-slate-200 dark:border-slate-600" />
          <span className="text-[10px] text-slate-300 dark:text-slate-600 select-none">FDI</span>
          <div className="flex-1 border-t border-dashed border-slate-200 dark:border-slate-600" />
        </div>

        {/* Donja vilica */}
        <div className="mt-1">
          <div className="flex justify-center items-start gap-0.5">
            <div className="flex gap-0.5">
              {lowerRight.map((fdi) => (
                <ToothCell
                  key={fdi}
                  fdi={fdi}
                  status={getToothStatus(fdi)}
                  isSelected={selectedFdi === fdi}
                  position="lower"
                  onClick={() => handleToothClick(fdi)}
                />
              ))}
            </div>
            <div className="w-px self-stretch bg-slate-300 dark:bg-slate-600 mx-1" />
            <div className="flex gap-0.5">
              {lowerLeft.map((fdi) => (
                <ToothCell
                  key={fdi}
                  fdi={fdi}
                  status={getToothStatus(fdi)}
                  isSelected={selectedFdi === fdi}
                  position="lower"
                  onClick={() => handleToothClick(fdi)}
                />
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-2 text-center">
            Donja vilica
          </p>
        </div>
      </div>

      {/* Edit panel */}
      {selectedFdi && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-teal-200 dark:border-teal-800 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">
              Zub{' '}
              <span className="font-mono text-teal-600 dark:text-teal-400">{selectedFdi}</span>
            </h3>
            <button
              onClick={() => setSelectedFdi(null)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              Zatvori
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Status</p>
            <div className="flex flex-wrap gap-1.5">
              {ALL_STATUSES.map((status) => {
                const cfg = STATUS_CONFIG[status]
                const isActive = editStatus === status
                return (
                  <button
                    key={status}
                    onClick={() => setEditStatus(status)}
                    className={cn(
                      'px-2.5 py-1 text-xs rounded-full border-2 font-medium transition-all',
                      cfg.bg,
                      cfg.text,
                      isActive
                        ? cn(cfg.border, 'ring-2 ring-offset-1 ring-teal-500 dark:ring-offset-slate-800')
                        : 'border-transparent hover:border-slate-300 dark:hover:border-slate-500',
                    )}
                  >
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mb-4">
            <Textarea
              label="Napomena"
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              placeholder="Klinička napomena za ovaj zub..."
              rows={2}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleSave} loading={upsertTooth.isPending} disabled={saved} size="sm">
              {saved ? '✓ Sačuvano' : 'Sačuvaj'}
            </Button>
            {upsertTooth.isError && (
              <span className="text-sm text-red-600 dark:text-red-400">Greška pri čuvanju</span>
            )}
          </div>
        </div>
      )}

      {/* Legenda */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Legenda</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {ALL_STATUSES.map((status) => {
            const cfg = STATUS_CONFIG[status]
            return (
              <div key={status} className="flex items-center gap-1.5">
                <div
                  className={cn(
                    'w-4 h-4 rounded border-2 flex items-center justify-center',
                    cfg.bg,
                    cfg.border,
                  )}
                >
                  {cfg.icon && (
                    <span className={cn('text-[7px] font-bold leading-none', cfg.text)}>
                      {cfg.icon.length <= 2 ? cfg.icon : ''}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-600 dark:text-slate-400">{cfg.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

interface ToothCellProps {
  fdi: string
  status: ToothStatus
  isSelected: boolean
  position: 'upper' | 'lower'
  onClick: () => void
}

function ToothCell({ fdi, status, isSelected, position, onClick }: ToothCellProps) {
  const cfg = STATUS_CONFIG[status]

  const numberEl = (
    <span
      className={cn(
        'font-mono leading-none select-none text-[clamp(7px,1.8vw,9px)]',
        isSelected ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-400 dark:text-slate-500',
      )}
    >
      {fdi}
    </span>
  )

  const toothEl = (
    <div
      className={cn(
        'rounded border-2 flex items-center justify-center transition-all',
        'w-[clamp(14px,4vw,28px)] h-[clamp(18px,5vw,32px)]',
        cfg.bg,
        cfg.border,
        isSelected && 'ring-2 ring-teal-500 dark:ring-teal-400 ring-offset-1 dark:ring-offset-slate-800',
      )}
    >
      {cfg.icon && (
        <span className={cn('text-[clamp(6px,1.6vw,8px)] font-bold leading-none', cfg.text)}>
          {cfg.icon}
        </span>
      )}
    </div>
  )

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 hover:scale-110 transition-transform focus:outline-none"
      title={`${fdi} — ${cfg.label}`}
    >
      {position === 'upper' ? (
        <>
          {numberEl}
          {toothEl}
        </>
      ) : (
        <>
          {toothEl}
          {numberEl}
        </>
      )}
    </button>
  )
}
