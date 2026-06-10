import type { ReactNode } from 'react'

type ModalProps = {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-md sm:items-start sm:px-4 sm:py-8"
    >
      {/* Bottom sheet on mobile, centered card on larger screens */}
      <div className="max-h-[90svh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-bg-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-card sm:max-h-[calc(100vh-4rem)] sm:rounded-card sm:p-6 sm:pb-6">
        <div aria-hidden className="mx-auto mb-3 h-1 w-10 rounded-full bg-bg-input sm:hidden" />
        <div className="mb-4 flex items-center justify-between">
          <h2 id="modal-title" className="text-lg font-semibold text-text-primary">
            {title}
          </h2>
          <button
            aria-label="Close"
            onClick={onClose}
            className="-m-2 flex h-10 w-10 items-center justify-center rounded-full text-text-secondary transition-colors hover:text-text-primary"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
