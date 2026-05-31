import { useState, useRef, useEffect } from 'react'
import { Search, X, User } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { formatAge } from '../../../lib/date'
import { usePatientSearch, type PatientSearchResult } from '../hooks/usePatientSearch'
import { Spinner } from '../../../components/ui'

interface PatientSearchProps {
  selectedPatient: PatientSearchResult | null
  onSelect: (patient: PatientSearchResult | null) => void
  error?: string
}

export function PatientSearch({ selectedPatient, onSelect, error }: PatientSearchProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: results = [], isFetching } = usePatientSearch(query)

  // Zatvori dropdown pri klik izvan
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(patient: PatientSearchResult) {
    onSelect(patient)
    setQuery('')
    setOpen(false)
  }

  function handleClear() {
    onSelect(null)
    setQuery('')
    inputRef.current?.focus()
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value)
    setOpen(true)
    if (!e.target.value) onSelect(null)
  }

  const showDropdown = open && query.trim().length >= 2

  return (
    <div ref={containerRef} className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        Pacijent <span className="text-red-500">*</span>
      </label>

      {selectedPatient ? (
        <div
          className={cn(
            'flex items-center justify-between px-3 py-2 rounded-md border bg-teal-50 dark:bg-teal-900/20',
            error ? 'border-red-400' : 'border-teal-200 dark:border-teal-800'
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <User className="w-4 h-4 text-teal-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                {selectedPatient.last_name} {selectedPatient.first_name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {selectedPatient.date_of_birth && formatAge(selectedPatient.date_of_birth)}
                {selectedPatient.phone && ` · ${selectedPatient.phone}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {isFetching ? <Spinner size="sm" /> : <Search className="w-4 h-4" />}
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => query.trim().length >= 2 && setOpen(true)}
            placeholder="Pretraži po prezimenu, imenu ili telefonu..."
            className={cn(
              'w-full pl-9 pr-3 py-2 rounded-md border bg-white text-sm',
              'placeholder:text-slate-400 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600',
              'dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500',
              error
                ? 'border-red-400 focus:ring-red-400'
                : 'border-slate-300 dark:border-slate-600'
            )}
          />

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute z-50 w-full mt-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg overflow-hidden">
              {results.length === 0 && !isFetching ? (
                <div className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400 text-center">
                  Nema rezultata za „{query}"
                </div>
              ) : (
                <ul className="max-h-56 overflow-y-auto">
                  {results.map((patient) => (
                    <li key={patient.id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(patient)}
                        className="w-full text-left px-3 py-2.5 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
                      >
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {patient.last_name} {patient.first_name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {patient.date_of_birth && formatAge(patient.date_of_birth)}
                          {patient.phone && ` · ${patient.phone}`}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}
