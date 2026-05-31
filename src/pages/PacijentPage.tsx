import { useParams } from 'react-router-dom'
import { User } from 'lucide-react'

export function PacijentPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
      <User className="w-10 h-10" />
      <p className="text-sm font-medium">Karton pacijenta — Task 011</p>
      {id && <p className="text-xs font-mono">{id}</p>}
    </div>
  )
}
