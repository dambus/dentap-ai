import { useState } from 'react'
import { ShieldAlert } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { TabKlinika } from '../features/settings/components/TabKlinika'
import { TabTim } from '../features/settings/components/TabTim'
import { TabCenovnik } from '../features/settings/components/TabCenovnik'
import { TabDoktori } from '../features/settings/components/TabDoktori'
import { cn } from '../lib/utils'

type SettingsTab = 'klinika' | 'tim' | 'cenovnik' | 'doktori'

const TABS: { id: SettingsTab; label: string }[] = [
  { id: 'klinika', label: 'Klinika' },
  { id: 'tim', label: 'Tim' },
  { id: 'cenovnik', label: 'Cenovnik' },
  { id: 'doktori', label: 'Doktori' },
]

export function PodesavanjaPage() {
  const profile = useAuthStore((s) => s.profile)
  const [tab, setTab] = useState<SettingsTab>('klinika')

  if (profile?.role !== 'owner') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500 dark:text-slate-400">
        <ShieldAlert className="w-10 h-10 opacity-40" />
        <p className="text-sm font-medium">Podešavanja su dostupna samo vlasniku ordinacije.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 pt-4 pb-0">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">Podešavanja</h1>
        <div className="flex items-center gap-0">
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
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'klinika' && <TabKlinika />}
        {tab === 'tim' && <TabTim />}
        {tab === 'cenovnik' && <TabCenovnik />}
        {tab === 'doktori' && <TabDoktori />}
      </div>
    </div>
  )
}
