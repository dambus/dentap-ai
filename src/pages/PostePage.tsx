import { ClipboardList } from 'lucide-react'

export function PostePage() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
      <ClipboardList className="w-10 h-10" />
      <p className="text-sm font-medium">Posete — pregled</p>
    </div>
  )
}
