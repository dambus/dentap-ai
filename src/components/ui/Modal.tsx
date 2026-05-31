import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
            'w-[calc(100%-2rem)] bg-white dark:bg-slate-800 rounded-lg shadow-xl overflow-hidden',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            sizeClasses[size],
            className
          )}
        >
          {(title || description) && (
            <div className="flex items-start justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <div>
                {title && (
                  <Dialog.Title className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {title}
                  </Dialog.Title>
                )}
                {description && (
                  <Dialog.Description className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                    {description}
                  </Dialog.Description>
                )}
              </div>
              <Dialog.Close
                onClick={onClose}
                className="ml-4 rounded p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <X className="w-4 h-4" />
              </Dialog.Close>
            </div>
          )}
          <div className="px-5 py-4 text-slate-700 dark:text-slate-300">{children}</div>
          {footer && (
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
