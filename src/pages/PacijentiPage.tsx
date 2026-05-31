import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, ChevronRight, ChevronLeft, Users } from 'lucide-react'
import { usePatients, type PatientListItem } from '../features/patients/hooks/usePatients'
import { NewPatientModal } from '../features/patients/components/NewPatientModal'
import { useDebounce } from '../lib/useDebounce'
import { Avatar, Badge, Button, Spinner } from '../components/ui'
import { formatAge } from '../lib/date'
import { cn } from '../lib/utils'

const PAGE_SIZE = 20

export function PacijentiPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const debouncedSearch = useDebounce(search, 300)

  // Reset na prvu stranicu kad se pretraga menja
  const effectivePage = debouncedSearch ? 1 : page

  const { data, isLoading } = usePatients({
    search: debouncedSearch,
    page: effectivePage,
    pageSize: PAGE_SIZE,
  })

  const patients = data?.patients ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const isSearching = !!debouncedSearch

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value)
    setPage(1)
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex-wrap gap-y-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={handleSearchChange}
            placeholder="Pretraži po prezimenu, imenu ili telefonu..."
            className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
          />
        </div>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Novi pacijent</span>
        </Button>
      </div>

      {/* Sadržaj */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Spinner size="lg" className="text-teal-600" />
            <span className="text-sm text-slate-400 dark:text-slate-500">Učitavanje...</span>
          </div>
        ) : patients.length === 0 ? (
          <EmptyState isSearching={isSearching} search={debouncedSearch} onNew={() => setModalOpen(true)} />
        ) : (
          <>
            {/* Broj rezultata */}
            <div className="px-4 py-2.5 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
              {isSearching
                ? `${total} rezultat${total === 1 ? '' : total < 5 ? 'a' : 'a'} za „${debouncedSearch}"`
                : `${total} pacijenata ukupno`}
            </div>

            {/* Lista */}
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {patients.map((p) => (
                <PatientRow
                  key={p.id}
                  patient={p}
                  onClick={() => navigate(`/pacijenti/${p.id}`)}
                />
              ))}
            </ul>

            {/* Paginacija — samo bez pretrage */}
            {!isSearching && totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                pageSize={PAGE_SIZE}
                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
              />
            )}
          </>
        )}
      </div>

      <NewPatientModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}

// --- Podkomponente ---

function PatientRow({ patient, onClick }: { patient: PatientListItem; onClick: () => void }) {
  return (
    <li>
      <button
        onClick={onClick}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
      >
        <Avatar name={`${patient.first_name} ${patient.last_name}`} size="md" />

        <div className="flex-1 min-w-0">
          {/* Ime — istaknuto */}
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
            {patient.last_name} {patient.first_name}
          </p>
          {/* Sekundarni podaci */}
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {patient.date_of_birth && (
              <span>{formatAge(patient.date_of_birth)}</span>
            )}
            {patient.date_of_birth && patient.phone && (
              <span className="mx-1.5">·</span>
            )}
            {patient.phone && <span>{patient.phone}</span>}
            {patient.city && (
              <>
                <span className="mx-1.5">·</span>
                <span>{patient.city}</span>
              </>
            )}
          </p>
        </div>

        {/* Status + chevron */}
        <div className="flex items-center gap-2 shrink-0">
          {patient.is_active === false && (
            <Badge variant="neutral">Neaktivan</Badge>
          )}
          <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500 transition-colors" />
        </div>
      </button>
    </li>
  )
}

function EmptyState({
  isSearching, search, onNew,
}: { isSearching: boolean; search: string; onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-center px-4">
      <Users className="w-10 h-10 text-slate-300 dark:text-slate-600" />
      {isSearching ? (
        <>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Nema rezultata za „{search}"
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Pokušajte sa drugim pojmom
          </p>
        </>
      ) : (
        <>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Nema pacijenata
          </p>
          <Button size="sm" onClick={onNew}>
            <Plus className="w-3.5 h-3.5" />
            Dodaj prvog pacijenta
          </Button>
        </>
      )}
    </div>
  )
}

function Pagination({
  page, totalPages, total, pageSize, onPrev, onNext,
}: {
  page: number; totalPages: number; total: number
  pageSize: number; onPrev: () => void; onNext: () => void
}) {
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      <span className="text-xs text-slate-500 dark:text-slate-400">
        {from}–{to} od {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={onPrev}
          disabled={page <= 1}
          className={cn(
            'flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
            page <= 1
              ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          )}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Prethodna
        </button>
        <span className="px-2 text-xs text-slate-500 dark:text-slate-400">
          {page} / {totalPages}
        </span>
        <button
          onClick={onNext}
          disabled={page >= totalPages}
          className={cn(
            'flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
            page >= totalPages
              ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          )}
        >
          Sledeća
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
