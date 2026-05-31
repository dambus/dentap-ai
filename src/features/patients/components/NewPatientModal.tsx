import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'
import { useCreatePatient } from '../hooks/useCreatePatient'
import { Modal, Button, Input, Textarea, Select } from '../../../components/ui'

interface NewPatientModalProps {
  open: boolean
  onClose: () => void
}

const GENDER_OPTIONS = [
  { value: 'M', label: 'Muški' },
  { value: 'F', label: 'Ženski' },
  { value: 'other', label: 'Ostalo' },
]

export function NewPatientModal({ open, onClose }: NewPatientModalProps) {
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const createPatient = useCreatePatient()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [gender, setGender] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [city, setCity] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  function reset() {
    setFirstName(''); setLastName(''); setDateOfBirth(''); setGender('')
    setPhone(''); setEmail(''); setCity(''); setNotes('')
    setErrors({}); setSubmitError(null)
  }

  function handleClose() {
    reset()
    onClose()
  }

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!firstName.trim()) e.firstName = 'Ime je obavezno'
    if (!lastName.trim()) e.lastName = 'Prezime je obavezno'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (!validate() || !profile) return
    setSubmitError(null)

    try {
      const patient = await createPatient.mutateAsync({
        clinic_id: profile.clinic_id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        date_of_birth: dateOfBirth || null,
        gender: gender || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        city: city.trim() || null,
        notes: notes.trim() || null,
        created_by: profile.id,
        is_active: true,
      })
      handleClose()
      navigate(`/pacijenti/${patient.id}`)
    } catch {
      setSubmitError('Greška pri kreiranju pacijenta. Pokušajte ponovo.')
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Novi pacijent"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={createPatient.isPending}>
            Otkaži
          </Button>
          <Button
            type="submit"
            form="new-patient-form"
            loading={createPatient.isPending}
          >
            Kreiraj pacijenta
          </Button>
        </>
      }
    >
      <form id="new-patient-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Ime *"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            error={errors.firstName}
            placeholder="Stefan"
            autoFocus
          />
          <Input
            label="Prezime *"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            error={errors.lastName}
            placeholder="Marković"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Datum rođenja
            </label>
            <input
              type="date"
              value={dateOfBirth}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
          <Select
            label="Pol"
            options={GENDER_OPTIONS}
            value={gender}
            onValueChange={setGender}
            placeholder="Izaberi..."
          />
        </div>

        <Input
          label="Telefon"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+381 64 123 4567"
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ime@email.rs"
          />
          <Input
            label="Grad"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Beograd"
          />
        </div>

        <Textarea
          label="Napomena"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Opcionalna napomena vidljiva recepciji..."
          rows={2}
        />

        {submitError && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2">
            <p className="text-sm text-red-700 dark:text-red-400">{submitError}</p>
          </div>
        )}
      </form>
    </Modal>
  )
}
