import { useState, useEffect } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { useTeam, useUpdateProfile } from '../hooks/useTeam'
import { Avatar, Button, Input, Spinner } from '../../../components/ui'

const COLORS = [
  '#0B6E6E', '#2563eb', '#7c3aed', '#db2777', '#ea580c',
  '#16a34a', '#ca8a04', '#0891b2', '#9333ea', '#dc2626',
]

export function TabDoktori() {
  const clinic = useAuthStore((s) => s.clinic)
  const { data: members = [], isLoading } = useTeam(clinic?.id ?? null)
  const updateProfile = useUpdateProfile()

  const doctors = members.filter((m) => m.is_doctor && m.is_active)

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" className="text-teal-600" />
    </div>
  )

  if (doctors.length === 0) return (
    <div className="p-6 text-slate-500 text-sm">Nema aktivnih doktora u klinici.</div>
  )

  return (
    <div className="p-6 max-w-3xl space-y-4">
      {doctors.map((doctor) => (
        <DoctorCard
          key={doctor.id}
          doctor={doctor}
          clinicId={clinic?.id ?? ''}
          onSave={updateProfile.mutateAsync}
          isSaving={updateProfile.isPending}
        />
      ))}
    </div>
  )
}

function DoctorCard({
  doctor, clinicId, onSave, isSaving,
}: {
  doctor: ReturnType<typeof useTeam>['data'] extends (infer T)[] | undefined ? T : never
  clinicId: string
  onSave: ReturnType<typeof useUpdateProfile>['mutateAsync']
  isSaving: boolean
}) {
  const [specialty, setSpecialty] = useState(doctor.specialty ?? '')
  const [uzaSpecijalizacija, setUzaSpecijalizacija] = useState(
    (doctor as unknown as { uza_specijalizacija?: string }).uza_specijalizacija ?? '',
  )
  const [brojLicence, setBrojLicence] = useState(
    (doctor as unknown as { broj_licence?: string }).broj_licence ?? '',
  )
  const [color, setColor] = useState(doctor.color ?? COLORS[0])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSpecialty(doctor.specialty ?? '')
    setColor(doctor.color ?? COLORS[0])
  }, [doctor])

  async function handleSave() {
    setSaved(false)
    try {
      await onSave({
        profileId: doctor.id,
        clinicId,
        data: {
          specialty: specialty.trim() || null,
          uza_specijalizacija: uzaSpecijalizacija.trim() || null,
          broj_licence: brojLicence.trim() || null,
          color,
        } as Parameters<typeof onSave>[0]['data'],
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch { /* mutation handles */ }
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-4">
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full shrink-0 ring-2 ring-offset-2 ring-slate-200 dark:ring-slate-600"
          style={{ backgroundColor: color }}
        />
        <div className="flex-1">
          <p className="font-medium text-slate-800 dark:text-slate-100">
            {doctor.last_name} {doctor.first_name}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{doctor.role}</p>
        </div>
      </div>

      {/* Boja u kalendaru */}
      <div>
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Boja u kalendaru</p>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="w-6 h-6 rounded-full transition-transform hover:scale-110 focus:outline-none"
              style={{
                backgroundColor: c,
                boxShadow: color === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : undefined,
              }}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
            title="Prilagođena boja"
          />
        </div>
      </div>

      {/* Specijalizacije i licenca */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Specijalizacija"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          placeholder="npr. Opšta stomatologija"
        />
        <Input
          label="Uža specijalizacija"
          value={uzaSpecijalizacija}
          onChange={(e) => setUzaSpecijalizacija(e.target.value)}
          placeholder="npr. Ortodoncija"
        />
        <Input
          label="Broj licence"
          value={brojLicence}
          onChange={(e) => setBrojLicence(e.target.value)}
          placeholder="npr. 12345"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleSave} loading={isSaving} disabled={saved}>
          {saved ? '✓ Sačuvano' : 'Sačuvaj'}
        </Button>
      </div>
    </div>
  )
}
