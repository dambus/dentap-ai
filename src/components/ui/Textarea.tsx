import { cn } from '../../lib/utils'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export function Textarea({
  label,
  error,
  helperText,
  id,
  className,
  ...props
}: TextareaProps) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        {...props}
        className={cn(
          'w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900',
          'placeholder:text-slate-400 resize-y min-h-20 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-0 focus:border-teal-600',
          'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
          'dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500',
          'dark:disabled:bg-slate-900',
          error
            ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
            : 'border-slate-300 dark:border-slate-600 dark:focus:border-teal-500',
          className
        )}
      />
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      {!error && helperText && <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>}
    </div>
  )
}
