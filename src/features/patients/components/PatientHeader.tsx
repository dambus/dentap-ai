import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Cake, ArrowLeft } from 'lucide-react'
import { Avatar, Badge } from '../../../components/ui'
import { formatAge, formatDate } from '../../../lib/date'
import type { PatientDetail } from '../hooks/usePatient'

interface PatientHeaderProps {
  patient: PatientDetail
}

export function PatientHeader({ patient }: PatientHeaderProps) {
  return (
    <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 pt-3 pb-4">
      <Link
        to="/pacijenti"
        className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors mb-3"
      >
        <ArrowLeft className="w-3 h-3" />
        Pacijenti
      </Link>

      <div className="flex items-start gap-4">
        <Avatar name={`${patient.first_name} ${patient.last_name}`} size="lg" />
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3 mb-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {patient.last_name} {patient.first_name}
            </h1>
            {!patient.is_active && <Badge variant="neutral">Neaktivan</Badge>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-400">
            {patient.date_of_birth && (
              <div className="flex items-center gap-2">
                <Cake className="w-4 h-4" />
                <span>
                  {formatAge(patient.date_of_birth)} ({formatDate(patient.date_of_birth)})
                </span>
              </div>
            )}
            {patient.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <a
                  href={`tel:${patient.phone}`}
                  className="text-teal-600 dark:text-teal-400 hover:underline"
                >
                  {patient.phone}
                </a>
              </div>
            )}
            {patient.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a
                  href={`mailto:${patient.email}`}
                  className="text-teal-600 dark:text-teal-400 hover:underline truncate"
                >
                  {patient.email}
                </a>
              </div>
            )}
            {patient.city && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{patient.city}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
