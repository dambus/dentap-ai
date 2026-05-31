import { format, formatDistance, isToday, isTomorrow, isYesterday } from 'date-fns'
import { sr } from 'date-fns/locale'

export function formatDate(date: Date | string, pattern = 'd. MMM yyyy.'): string {
  return format(new Date(date), pattern, { locale: sr })
}

export function formatTime(date: Date | string): string {
  return format(new Date(date), 'HH:mm', { locale: sr })
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), 'd. MMM yyyy. HH:mm', { locale: sr })
}

export function formatRelative(date: Date | string): string {
  const d = new Date(date)
  if (isToday(d)) return 'danas'
  if (isTomorrow(d)) return 'sutra'
  if (isYesterday(d)) return 'juče'
  return formatDistance(d, new Date(), { addSuffix: true, locale: sr })
}

export function formatAge(dateOfBirth: Date | string): string {
  const birth = new Date(dateOfBirth)
  const today = new Date()
  const age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  const adjusted = m < 0 || (m === 0 && today.getDate() < birth.getDate()) ? age - 1 : age
  return `${adjusted} god.`
}
