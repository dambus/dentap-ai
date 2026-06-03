import { useState } from 'react'
import { UserPlus, ToggleLeft, ToggleRight } from 'lucide-react'
import { useAuthStore } from '../../../store/authStore'
import { useTeam, useUpdateProfile, ROLE_LABELS } from '../hooks/useTeam'
import type { UserRole } from '../hooks/useTeam'
import { Avatar, Badge, Button, Input, Spinner } from '../../../components/ui'
import { supabase } from '../../../lib/supabase'
import { cn } from '../../../lib/utils'

export function TabTim() {
  const clinic = useAuthStore((s) => s.clinic)
  const currentProfile = useAuthStore((s) => s.profile)
  const { data: members = [], isLoading } = useTeam(clinic?.id ?? null)
  const updateProfile = useUpdateProfile()
  const [showInvite, setShowInvite] = useState(false)

  async function handleRoleChange(profileId: string, role: UserRole) {
    if (!clinic?.id) return
    try {
      await updateProfile.mutateAsync({ profileId, clinicId: clinic.id, data: { role } })
    } catch { /* mutation handles */ }
  }

  async function handleToggleActive(profileId: string, currentActive: boolean) {
    if (!clinic?.id || profileId === currentProfile?.id) return
    try {
      await updateProfile.mutateAsync({ profileId, clinicId: clinic.id, data: { is_active: !currentActive } })
    } catch { /* mutation handles */ }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" className="text-teal-600" />
    </div>
  )

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
          Korisnici ({members.length})
        </h2>
        <Button size="sm" onClick={() => setShowInvite(true)}>
          <UserPlus className="w-4 h-4 mr-1.5" />
          Pozovi korisnika
        </Button>
      </div>

      {showInvite && (
        <InviteUserCard clinicId={clinic?.id ?? ''} onClose={() => setShowInvite(false)} />
      )}

      <div className="space-y-2">
        {members.map((member) => (
          <div
            key={member.id}
            className={cn(
              'flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700',
              !member.is_active && 'opacity-50',
            )}
          >
            <Avatar name={`${member.first_name} ${member.last_name}`} size="md" />

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                {member.last_name} {member.first_name}
                {member.id === currentProfile?.id && (
                  <span className="ml-2 text-xs text-teal-600 dark:text-teal-400">(ti)</span>
                )}
              </p>
              {!member.is_active && (
                <Badge variant="neutral" className="text-xs mt-0.5">Neaktivan</Badge>
              )}
            </div>

            {/* Uloga */}
            <select
              value={member.role}
              onChange={(e) => handleRoleChange(member.id, e.target.value as UserRole)}
              disabled={updateProfile.isPending || member.id === currentProfile?.id}
              className={cn(
                'rounded-lg border border-slate-200 dark:border-slate-600 px-2 py-1 text-xs',
                'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200',
                'focus:outline-none focus:ring-1 focus:ring-teal-500',
              )}
            >
              {Object.entries(ROLE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>

            {/* Toggle aktivan */}
            <button
              onClick={() => handleToggleActive(member.id, member.is_active ?? true)}
              disabled={member.id === currentProfile?.id || updateProfile.isPending}
              className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30 transition-colors"
              title={member.is_active ? 'Deaktiviraj' : 'Aktiviraj'}
            >
              {member.is_active
                ? <ToggleRight className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                : <ToggleLeft className="w-5 h-5" />
              }
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- Forma za pozivanje novog korisnika ---

function InviteUserCard({ clinicId, onClose }: { clinicId: string; onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState<UserRole>('reception')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleInvite() {
    if (!email.trim() || !firstName.trim() || !lastName.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const { data, error: fnError } = await supabase.functions.invoke('invite-user', {
        body: { email: email.trim(), first_name: firstName.trim(), last_name: lastName.trim(), role, clinic_id: clinicId },
      })
      if (fnError) throw fnError
      setResult(data?.message ?? 'Pozivnica je poslata.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri slanju pozivnice.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl p-4 space-y-3">
      <p className="text-sm font-semibold text-teal-800 dark:text-teal-200">Pozovi novog korisnika</p>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Ime" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <Input label="Prezime" value={lastName} onChange={(e) => setLastName(e.target.value)} />
      </div>
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Uloga</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="w-full rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          {Object.entries(ROLE_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>
      {result && <p className="text-sm text-teal-700 dark:text-teal-300">{result}</p>}
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" onClick={handleInvite} loading={loading} disabled={!email || !firstName || !lastName}>
          Pošalji pozivnicu
        </Button>
        <Button size="sm" variant="ghost" onClick={onClose}>Otkaži</Button>
      </div>
    </div>
  )
}
