import * as RadixSelect from '@radix-ui/react-select'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '../../lib/utils'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps {
  options: SelectOption[]
  value?: string
  onValueChange?: (value: string) => void
  label?: string
  placeholder?: string
  error?: string
  helperText?: string
  disabled?: boolean
  id?: string
  className?: string
}

export function Select({
  options,
  value,
  onValueChange,
  label,
  placeholder = 'Izaberi...',
  error,
  helperText,
  disabled,
  id,
  className,
}: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <RadixSelect.Trigger
          id={selectId}
          className={cn(
            'flex h-9 w-full items-center justify-between rounded-md border bg-white px-3 text-sm',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-0',
            'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
            'data-[placeholder]:text-slate-400',
            error ? 'border-red-400 focus:ring-red-400' : 'border-slate-300'
          )}
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content
            className={cn(
              'z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-200',
              'bg-white shadow-md animate-in fade-in-0 zoom-in-95'
            )}
            position="popper"
            sideOffset={4}
          >
            <RadixSelect.Viewport className="p-1">
              {options.map((opt) => (
                <RadixSelect.Item
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  className={cn(
                    'relative flex cursor-default select-none items-center rounded px-2 py-1.5 pl-7 text-sm',
                    'text-slate-700 outline-none',
                    'focus:bg-teal-50 focus:text-teal-700',
                    'data-[disabled]:pointer-events-none data-[disabled]:opacity-40'
                  )}
                >
                  <span className="absolute left-2 flex items-center">
                    <RadixSelect.ItemIndicator>
                      <Check className="w-3.5 h-3.5 text-teal-600" />
                    </RadixSelect.ItemIndicator>
                  </span>
                  <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>

      {error && <p className="text-xs text-red-600">{error}</p>}
      {!error && helperText && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  )
}
