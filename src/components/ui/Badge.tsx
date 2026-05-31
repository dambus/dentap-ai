import { cn } from '../../lib/utils'

type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'info'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20',
  warning: 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20',
  danger: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20',
  neutral: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20',
  info: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20',
}

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

// --- Domain status badges ---

type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show'
type ArrivalStatus = 'not_arrived' | 'arrived' | 'in_chair' | 'completed'
type VisitStatus = 'draft' | 'completed'
type PlanStatus = 'draft' | 'proposed' | 'accepted' | 'in_progress' | 'completed' | 'archived'

const appointmentStatusMap: Record<AppointmentStatus, { variant: BadgeVariant; label: string }> = {
  scheduled: { variant: 'info', label: 'Zakazano' },
  completed: { variant: 'success', label: 'Završeno' },
  cancelled: { variant: 'danger', label: 'Otkazano' },
  no_show: { variant: 'warning', label: 'Nije došao' },
}

const arrivalStatusMap: Record<ArrivalStatus, { variant: BadgeVariant; label: string }> = {
  not_arrived: { variant: 'neutral', label: 'Čeka' },
  arrived: { variant: 'info', label: 'Stigao' },
  in_chair: { variant: 'warning', label: 'U stolici' },
  completed: { variant: 'success', label: 'Gotovo' },
}

const visitStatusMap: Record<VisitStatus, { variant: BadgeVariant; label: string }> = {
  draft: { variant: 'neutral', label: 'U toku' },
  completed: { variant: 'success', label: 'Završena' },
}

const planStatusMap: Record<PlanStatus, { variant: BadgeVariant; label: string }> = {
  draft: { variant: 'neutral', label: 'Nacrt' },
  proposed: { variant: 'info', label: 'Predložen' },
  accepted: { variant: 'info', label: 'Prihvaćen' },
  in_progress: { variant: 'warning', label: 'U toku' },
  completed: { variant: 'success', label: 'Završen' },
  archived: { variant: 'neutral', label: 'Arhiviran' },
}

interface AppointmentStatusBadgeProps { status: AppointmentStatus; className?: string }
interface ArrivalStatusBadgeProps { status: ArrivalStatus; className?: string }
interface VisitStatusBadgeProps { status: VisitStatus; className?: string }
interface PlanStatusBadgeProps { status: PlanStatus; className?: string }

export function AppointmentStatusBadge({ status, className }: AppointmentStatusBadgeProps) {
  const { variant, label } = appointmentStatusMap[status]
  return <Badge variant={variant} className={className}>{label}</Badge>
}

export function ArrivalStatusBadge({ status, className }: ArrivalStatusBadgeProps) {
  const { variant, label } = arrivalStatusMap[status]
  return <Badge variant={variant} className={className}>{label}</Badge>
}

export function VisitStatusBadge({ status, className }: VisitStatusBadgeProps) {
  const { variant, label } = visitStatusMap[status]
  return <Badge variant={variant} className={className}>{label}</Badge>
}

export function PlanStatusBadge({ status, className }: PlanStatusBadgeProps) {
  const { variant, label } = planStatusMap[status]
  return <Badge variant={variant} className={className}>{label}</Badge>
}
