import { useState } from 'react'
import {
  Search,
  Mail,
  Eye,
  Trash2,
  Edit,
  MoreVertical,
  Plus,
} from 'lucide-react'
import {
  Avatar,
  Badge,
  AppointmentStatusBadge,
  ArrivalStatusBadge,
  VisitStatusBadge,
  PlanStatusBadge,
  Button,
  Card,
  Dropdown,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
  Input,
  Modal,
  Select,
  Separator,
  Spinner,
  Textarea,
  Tooltip,
  TooltipProvider,
} from '../components/ui'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold text-slate-800 mb-1">{title}</h2>
      <Separator className="mb-4" />
      {children}
    </section>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">{label}</p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}

export function DevKitchen() {
  const [modalOpen, setModalOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [selectValue, setSelectValue] = useState('')
  const [textareaValue, setTextareaValue] = useState('')

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-teal-600">DentApp — Dev Kitchen</h1>
            <p className="text-slate-500 mt-1">Vizuelni pregled svih UI komponenti</p>
          </div>

          {/* BUTTON */}
          <Section title="Button">
            <Row label="Variante">
              <Button variant="primary">Primarno</Button>
              <Button variant="secondary">Sekundarno</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Opasnost</Button>
            </Row>
            <Row label="Veličine">
              <Button size="sm">Malo</Button>
              <Button size="md">Srednje</Button>
              <Button size="lg">Veliko</Button>
            </Row>
            <Row label="Stanja">
              <Button loading>Učitavanje</Button>
              <Button disabled>Onemogućeno</Button>
              <Button variant="primary" size="sm">
                <Plus className="w-3.5 h-3.5" />
                Sa ikonom
              </Button>
            </Row>
          </Section>

          {/* BADGE */}
          <Section title="Badge">
            <Row label="Generalne variante">
              <Badge variant="success">Uspeh</Badge>
              <Badge variant="warning">Upozorenje</Badge>
              <Badge variant="danger">Greška</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="neutral">Neutralno</Badge>
            </Row>
            <Row label="Status termina">
              <AppointmentStatusBadge status="scheduled" />
              <AppointmentStatusBadge status="completed" />
              <AppointmentStatusBadge status="cancelled" />
              <AppointmentStatusBadge status="no_show" />
            </Row>
            <Row label="Dolazak">
              <ArrivalStatusBadge status="not_arrived" />
              <ArrivalStatusBadge status="arrived" />
              <ArrivalStatusBadge status="in_chair" />
              <ArrivalStatusBadge status="completed" />
            </Row>
            <Row label="Poseta">
              <VisitStatusBadge status="draft" />
              <VisitStatusBadge status="completed" />
            </Row>
            <Row label="Plan lečenja">
              <PlanStatusBadge status="draft" />
              <PlanStatusBadge status="proposed" />
              <PlanStatusBadge status="accepted" />
              <PlanStatusBadge status="in_progress" />
              <PlanStatusBadge status="completed" />
              <PlanStatusBadge status="archived" />
            </Row>
          </Section>

          {/* AVATAR */}
          <Section title="Avatar">
            <Row label="Veličine">
              <Avatar name="Ana Petrović" size="sm" />
              <Avatar name="Marko Jovanović" size="md" />
              <Avatar name="Jelena Nikolić" size="lg" />
              <Avatar name="Dragan Petrović" size="xl" />
            </Row>
            <Row label="Različite boje (hash)">
              <Avatar name="Ana Petrović" size="lg" />
              <Avatar name="Marko Jovanović" size="lg" />
              <Avatar name="Jelena Nikolić" size="lg" />
              <Avatar name="Zoran Matić" size="lg" />
              <Avatar name="Ivana Stojanović" size="lg" />
            </Row>
          </Section>

          {/* SPINNER */}
          <Section title="Spinner">
            <Row label="Veličine">
              <Spinner size="sm" className="text-teal-600" />
              <Spinner size="md" className="text-teal-600" />
              <Spinner size="lg" className="text-teal-600" />
            </Row>
            <Row label="Boje">
              <Spinner size="md" className="text-slate-400" />
              <Spinner size="md" className="text-teal-600" />
              <Spinner size="md" className="text-red-500" />
            </Row>
          </Section>

          {/* INPUT */}
          <Section title="Input">
            <div className="grid grid-cols-2 gap-4 max-w-2xl">
              <Input
                label="Ime pacijenta"
                placeholder="Unesite ime..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Input
                label="Email"
                placeholder="email@primer.rs"
                prefixIcon={<Mail className="w-4 h-4" />}
              />
              <Input
                label="Pretraga"
                placeholder="Pretraži..."
                prefixIcon={<Search className="w-4 h-4" />}
                suffixIcon={<span className="text-xs text-slate-400">⌘K</span>}
              />
              <Input
                label="Sa greškom"
                placeholder="Unesite telefon..."
                error="Broj telefona nije ispravan"
                defaultValue="abc"
              />
              <Input
                label="Sa helper tekstom"
                placeholder="JJJJ-MM-DD"
                helperText="Format: 1990-05-15"
              />
              <Input
                label="Onemogućeno"
                value="Nije dostupno"
                disabled
              />
            </div>
          </Section>

          {/* TEXTAREA */}
          <Section title="Textarea">
            <div className="grid grid-cols-2 gap-4 max-w-2xl">
              <Textarea
                label="Kliničke napomene"
                placeholder="Unesite napomene..."
                value={textareaValue}
                onChange={(e) => setTextareaValue(e.target.value)}
                rows={3}
              />
              <Textarea
                label="Sa greškom"
                error="Ovo polje je obavezno"
                rows={3}
              />
            </div>
          </Section>

          {/* SELECT */}
          <Section title="Select">
            <div className="grid grid-cols-2 gap-4 max-w-2xl">
              <Select
                label="Tip termina"
                placeholder="Izaberi tip..."
                value={selectValue}
                onValueChange={setSelectValue}
                options={[
                  { value: 'regular', label: 'Redovan pregled' },
                  { value: 'urgent', label: 'Hitan slučaj' },
                  { value: 'followup', label: 'Kontrola' },
                  { value: 'consultation', label: 'Konsultacija' },
                ]}
              />
              <Select
                label="Sa greškom"
                error="Izaberite tip termina"
                options={[
                  { value: 'a', label: 'Opcija A' },
                  { value: 'b', label: 'Opcija B' },
                ]}
              />
            </div>
          </Section>

          {/* CARD */}
          <Section title="Card">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <p className="text-sm text-slate-600">Osnovna kartica bez headera</p>
              </Card>
              <Card header="Naslov kartice">
                <p className="text-sm text-slate-600">Kartica sa headerom i sadržajem.</p>
              </Card>
              <Card
                header="Puna kartica"
                footer={
                  <Button size="sm" variant="outline">
                    Akcija
                  </Button>
                }
              >
                <p className="text-sm text-slate-600">Kartica sa headerom i footerom.</p>
              </Card>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <Card padding="sm">
                <p className="text-xs text-slate-500">Padding: sm</p>
              </Card>
              <Card padding="md">
                <p className="text-sm text-slate-500">Padding: md (default)</p>
              </Card>
              <Card padding="lg">
                <p className="text-sm text-slate-500">Padding: lg</p>
              </Card>
            </div>
          </Section>

          {/* SEPARATOR */}
          <Section title="Separator">
            <Row label="Horizontalni">
              <div className="w-full max-w-md">
                <p className="text-sm text-slate-600 mb-2">Gornji sadržaj</p>
                <Separator />
                <p className="text-sm text-slate-600 mt-2">Donji sadržaj</p>
              </div>
            </Row>
            <Row label="Vertikalni">
              <div className="flex items-center gap-3 h-8">
                <span className="text-sm text-slate-600">Levo</span>
                <Separator orientation="vertical" />
                <span className="text-sm text-slate-600">Desno</span>
              </div>
            </Row>
          </Section>

          {/* TOOLTIP */}
          <Section title="Tooltip">
            <Row label="Pozicije">
              <Tooltip content="Gornji tooltip" side="top">
                <Button variant="outline" size="sm">Top</Button>
              </Tooltip>
              <Tooltip content="Desni tooltip" side="right">
                <Button variant="outline" size="sm">Right</Button>
              </Tooltip>
              <Tooltip content="Donji tooltip" side="bottom">
                <Button variant="outline" size="sm">Bottom</Button>
              </Tooltip>
              <Tooltip content="Levi tooltip" side="left">
                <Button variant="outline" size="sm">Left</Button>
              </Tooltip>
            </Row>
          </Section>

          {/* DROPDOWN */}
          <Section title="Dropdown">
            <Row label="Meni">
              <Dropdown
                trigger={
                  <Button variant="outline" size="sm">
                    <MoreVertical className="w-4 h-4" />
                    Opcije
                  </Button>
                }
              >
                <DropdownLabel>Akcije</DropdownLabel>
                <DropdownItem icon={<Eye className="w-4 h-4" />}>Pogledaj karton</DropdownItem>
                <DropdownItem icon={<Edit className="w-4 h-4" />}>Izmeni</DropdownItem>
                <DropdownSeparator />
                <DropdownItem icon={<Trash2 className="w-4 h-4" />} variant="danger">
                  Obriši
                </DropdownItem>
              </Dropdown>
            </Row>
          </Section>

          {/* MODAL */}
          <Section title="Modal">
            <Row label="Otvori modal">
              <Button onClick={() => setModalOpen(true)}>Otvori modal</Button>
            </Row>
            <Modal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              title="Potvrda akcije"
              description="Da li ste sigurni da želite da nastavite sa ovom akcijom?"
              footer={
                <>
                  <Button variant="outline" onClick={() => setModalOpen(false)}>
                    Otkaži
                  </Button>
                  <Button variant="primary" onClick={() => setModalOpen(false)}>
                    Potvrdi
                  </Button>
                </>
              }
            >
              <p className="text-sm text-slate-600">
                Ova akcija će biti izvršena i ne može se poništiti. Molimo potvrdite da
                želite da nastavite.
              </p>
            </Modal>
          </Section>
        </div>
      </div>
    </TooltipProvider>
  )
}
