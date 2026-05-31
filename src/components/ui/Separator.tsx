import * as RadixSeparator from '@radix-ui/react-separator'
import { cn } from '../../lib/utils'

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export function Separator({ orientation = 'horizontal', className }: SeparatorProps) {
  return (
    <RadixSeparator.Root
      orientation={orientation}
      decorative
      className={cn(
        'bg-slate-200 shrink-0',
        orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full',
        className
      )}
    />
  )
}
