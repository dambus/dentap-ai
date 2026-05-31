import { useParams } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'

export function PosetaPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
      <ClipboardList className="w-10 h-10" />
      <p className="text-sm font-medium">Visit Screen — Task 014</p>
      {id && <p className="text-xs font-mono">{id}</p>}
    </div>
  )
}
