import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { cn } from '../../lib/utils'

interface DropdownProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: 'start' | 'end' | 'center'
}

interface DropdownItemProps {
  children: React.ReactNode
  onClick?: () => void
  icon?: React.ReactNode
  variant?: 'default' | 'danger'
  disabled?: boolean
  className?: string
}

export function Dropdown({ trigger, children, align = 'end' }: DropdownProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          sideOffset={6}
          className={cn(
            'z-50 min-w-40 overflow-hidden rounded-md border p-1',
            'border-slate-200 dark:border-slate-700',
            'bg-white dark:bg-slate-800 shadow-md',
            'animate-in fade-in-0 zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-2',
            'data-[side=top]:slide-in-from-bottom-2'
          )}
        >
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export function DropdownItem({
  children,
  onClick,
  icon,
  variant = 'default',
  disabled,
  className,
}: DropdownItemProps) {
  return (
    <DropdownMenu.Item
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex cursor-default select-none items-center gap-2 rounded px-2 py-1.5 text-sm outline-none',
        'data-disabled:pointer-events-none data-disabled:opacity-40',
        variant === 'default'
          ? 'text-slate-700 dark:text-slate-200 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-slate-900 dark:focus:text-slate-100'
          : 'text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/30 focus:text-red-700 dark:focus:text-red-300',
        className
      )}
    >
      {icon && <span className="w-4 h-4 shrink-0">{icon}</span>}
      {children}
    </DropdownMenu.Item>
  )
}

export function DropdownSeparator() {
  return <DropdownMenu.Separator className="my-1 h-px bg-slate-200 dark:bg-slate-700" />
}

export function DropdownLabel({ children }: { children: React.ReactNode }) {
  return (
    <DropdownMenu.Label className="px-2 py-1 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
      {children}
    </DropdownMenu.Label>
  )
}
