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
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/60 backdrop-blur-md sm:items-start sm:px-4 sm:py-8"
    >
      {/* Full-height top-anchored sheet on mobile, centered card on larger screens */}
      <div className="flex h-full w-full max-w-md flex-col overflow-hidden bg-bg-card shadow-card sm:h-auto sm:max-h-[calc(100vh-4rem)] sm:rounded-card">
        {/* Sticky header so the title and close button stay visible while scrolling */}
        <div className="flex items-center justify-between border-b border-border/60 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-4 sm:rounded-t-card sm:px-6 sm:pt-6">
          <h2 id="modal-title" className="text-lg font-semibold text-text-primary">
            {title}
          </h2>
          <button
            aria-label="Close"
            onClick={onClose}
            className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full text-text-secondary transition-colors hover:text-text-primary"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6">
          {children}
        </div>
      </div>
    </div>
  )
}
