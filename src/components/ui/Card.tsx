import { cn } from '../../lib/utils'

type CardPadding = 'sm' | 'md' | 'lg'

interface CardProps {
  children: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
  padding?: CardPadding
  className?: string
}

const paddingClasses: Record<CardPadding, string> = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

const paddingHeaderFooter: Record<CardPadding, string> = {
  sm: 'px-3 py-2',
  md: 'px-4 py-3',
  lg: 'px-6 py-4',
}

export function Card({ children, header, footer, padding = 'md', className }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden',
        className
      )}
    >
      {header && (
        <div
          className={cn(
            'border-b border-slate-200 font-medium text-slate-700',
            paddingHeaderFooter[padding]
          )}
        >
          {header}
        </div>
      )}
      <div className={paddingClasses[padding]}>{children}</div>
      {footer && (
        <div
          className={cn(
            'border-t border-slate-200 bg-slate-50',
            paddingHeaderFooter[padding]
          )}
        >
          {footer}
        </div>
      )}
    </div>
  )
}
