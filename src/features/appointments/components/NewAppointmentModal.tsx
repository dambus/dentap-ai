import { useState, useEffect } from 'react'
import { format, addMinutes } from 'date-fns'
import { useAuthStore } from '../../../store/authStore'
import { useDoctors } from '../hooks/useDoctors'
import { useCreateAppointment } from '../hooks/useCreateAppointment'
import { PatientSearch } from './PatientSearch'
import { Modal, Button, Select, Textarea } from '../../../components/ui'
import type { PatientSearchResult } from '../hooks/usePatientSearch'

interface NewAppointmentModalProps {
  open: boolean
  onClose: () => void
  initialDate?: Date
  initialDoctorId?: string
}

const DURATION_OPTIONS = [
  { value: '15', label: '15 min' },
  { value: '30', label: '30 min' },
  { value: '45', label: '45 min' },
  { value: '60', label: '1 sat' },
  { value: '90', label: '1h 30min' },
  { value: '120', label: '2 sata' },
]

const TYPE_OPTIONS = [
  { value: 'regular', label: 'Redovan pregled' },
  { value: 'followup', label: 'Kontrola' },
  { value: 'urgent', label: 'Hitan slučaj' },
  { value: 'consultation', label: 'Konsultacija' },
  { value: 'specialist', label: 'Specijalista' },
]

function buildDateTimeISO(date: string, time: string): string {
  return new Date(`${date}T${time}`).toISOString()
}

// Uvek vraća vreme u budućnosti — zaokružuje NAVIŠE na sledeći 30-minutni slot
function nextSlotTime(base?: Date): string {
  const now = base ?? new Date()
  const min = now.getMinutes()
  const roundedMin = Math.ceil((min + 1) / 30) * 30
  const totalMin = now.getHours() * 60 + roundedMin
  const h = Math.floor(totalMin / 60) % 24
  const m = totalMin % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function toLocalDateString(d: Date) {
  return format(d, 'yyyy-MM-dd')
}

function toLocalTimeString(d: Date) {
  return format(d, 'HH:mm')
}

export function NewAppointmentModal({
  open,
  onClose,
  initialDate,
  initialDoctorId,
}: NewAppointmentModalProps) {
  const profile = useAuthStore((s) => s.profile)
  const { data: doctors = [] } = useDoctors()
  const createAppointment = useCreateAppointment()

  const [patient, setPatient] = useState<PatientSearchResult | null>(null)
  const [doctorId, setDoctorId] = useState('')
  const [date, setDate] = useState(toLocalDateString(initialDate ?? new Date()))
  const [time, setTime] = useState(
    initialDate ? toLocalTimeString(initialDate) : nextSlotTime()
  )
  const [duration, setDuration] = useState('30')
  const [appointmentType, setAppointmentType] = useState('regular')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Postavi inicijalne vrednosti kada se modal otvori
  useEffect(() => {
    if (open) {
      setPatient(null)
      setDoctorId(initialDoctorId ?? (profile?.is_doctor ? (profile?.id ?? '') : (doctors[0]?.id ?? '')))
      setDate(toLocalDateString(initialDate ?? new Date()))
      setTime(initialDate ? toLocalTimeString(initialDate) : nextSlotTime())
      setDuration('30')
      setAppointmentType('regular')
      setNotes('')
      setErrors({})
      setSubmitError(null)
    }
  }, [open, initialDate, initialDoctorId, profile, doctors])

  // Ažuriraj doktora kada se doctors učitaju
  useEffect(() => {
    if (!doctorId && doctors.length > 0) {
      setDoctorId(initialDoctorId ?? (profile?.is_doctor ? (profile?.id ?? '') : doctors[0].id))
    }
  }, [doctors, doctorId, initialDoctorId, profile])

  const doctorOptions = doctors.map((d) => ({
    value: d.id,
    label: d.display_name ?? `${d.first_name} ${d.last_name}`,
  }))

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!patient) newErrors.patient = 'Izaberite pacijenta'
    if (!doctorId) newErrors.doctor = 'Izaberite doktora'
    if (!date) newErrors.date = 'Unesite datum'
    if (!time) newErrors.time = 'Unesite vreme'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    if (!patient || !profile?.clinic_id || !profile?.id) return

    setSubmitError(null)

    const startsAt = buildDateTimeISO(date, time)
    const endsAt = addMinutes(new Date(startsAt), parseInt(duration)).toISOString()

    try {
      await createAppointment.mutateAsync({
        clinic_id: profile.clinic_id,
        patient_id: patient.id,
        doctor_id: doctorId,
        starts_at: startsAt,
        ends_at: endsAt,
        appointment_type: appointmentType,
        notes: notes.trim() || undefined,
        created_by: profile.id,
      })
      onClose()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Greška pri zakazivanju termina.')
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Novi termin"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={createAppointment.isPending}>
            Otkaži
          </Button>
          <Button
            type="submit"
            form="new-appointment-form"
            loading={createAppointment.isPending}
          >
            Zakaži termin
          </Button>
        </>
      }
    >
      <form id="new-appointment-form" onSubmit={handleSubmit} className="space-y-4">
        <PatientSearch
          selectedPatient={patient}
          onSelect={setPatient}
          error={errors.patient}
        />

        <Select
          label="Doktor"
          options={doctorOptions}
          value={doctorId}
          onValueChange={setDoctorId}
          error={errors.doctor}
        />

        {/* Datum i vreme — grid 2 kolone */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Datum <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              min={toLocalDateString(new Date())}
              onChange={(e) => { setDate(e.target.value); setErrors((p) => ({ ...p, date: '' })) }}
              className={`w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600 dark:border-slate-600 ${errors.date ? 'border-red-400' : 'border-slate-300'}`}
            />
            {errors.date && <p className="text-xs text-red-600 dark:text-red-400">{errors.date}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Vreme <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={time}
              step="900"
              onChange={(e) => { setTime(e.target.value); setErrors((p) => ({ ...p, time: '' })) }}
              className={`w-full rounded-md border px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600 dark:border-slate-600 ${errors.time ? 'border-red-400' : 'border-slate-300'}`}
            />
            {errors.time && <p className="text-xs text-red-600 dark:text-red-400">{errors.time}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Trajanje"
            options={DURATION_OPTIONS}
            value={duration}
            onValueChange={setDuration}
          />
          <Select
            label="Tip termina"
            options={TYPE_OPTIONS}
            value={appointmentType}
            onValueChange={setAppointmentType}
          />
        </div>

        <Textarea
          label="Napomena"
          placeholder="Opcionalna napomena..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
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
