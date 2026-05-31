import { Calendar } from 'lucide-react'

export function PlanerPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
      <Calendar className="w-10 h-10" />
      <p className="text-sm font-medium">Planer — Task 005</p>
    </div>
  )
}
