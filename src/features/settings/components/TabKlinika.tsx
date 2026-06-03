import { useState, useEffect } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { useClinicSettings, useUpdateClinic } from '../hooks/useClinicSettings'
import { Button, Input, Card } from '../../../components/ui'

export function TabKlinika() {
  const clinic = useAuthStore((s) => s.clinic)
  const { data, isLoading } = useClinicSettings(clinic?.id ?? null)
  const update = useUpdateClinic()
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    tax_id: '',
    maticni_broj: '',
    organizaciona_jedinica: '',
  })

  useEffect(() => {
    if (!data) return
    setForm({
      name: data.name ?? '',
      address: data.address ?? '',
      city: data.city ?? '',
      phone: data.phone ?? '',
      email: data.email ?? '',
      tax_id: data.tax_id ?? '',
      maticni_broj: (data as unknown as { maticni_broj?: string }).maticni_broj ?? '',
      organizaciona_jedinica: (data as unknown as { organizaciona_jedinica?: string }).organizaciona_jedinica ?? '',
    })
  }, [data])

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  })

  async function handleSave() {
    if (!clinic?.id) return
    setSaved(false)
    try {
      await update.mutateAsync({ clinicId: clinic.id, data: form })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // mutation handles error
    }
  }

  if (isLoading) return <div className="p-6 text-sm text-slate-400">Učitavanje...</div>

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <Card header="Osnovi podaci">
        <div className="space-y-4">
          <Input label="Naziv ordinacije *" {...field('name')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Adresa" {...field('address')} />
            <Input label="Grad" {...field('city')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Telefon" {...field('phone')} />
            <Input label="Email" type="email" {...field('email')} />
          </div>
        </div>
      </Card>

      <Card header="Pravni podaci (za e-karton)">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="PIB" {...field('tax_id')} placeholder="npr. 123456789" />
            <Input label="Matični broj (APR)" {...field('maticni_broj')} placeholder="npr. 12345678" />
          </div>
          <Input label="Organizaciona jedinica" {...field('organizaciona_jedinica')} placeholder="npr. Stomatološka ambulanta" />
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} loading={update.isPending} disabled={saved}>
          {saved ? '✓ Sačuvano' : 'Sačuvaj izmene'}
        </Button>
        {update.isError && <span className="text-sm text-red-600">Greška pri čuvanju.</span>}
      </div>
    </div>
  )
}
