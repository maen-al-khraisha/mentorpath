'use client'

import * as Dialog from '@radix-ui/react-dialog'

export default function ScreenshotModal({ onClose }) {
  const shots = ['/screenshot-1.svg', '/screenshot-2.svg', '/screenshot-3.svg']
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
      <Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-3xl rounded-lg bg-[var(--bg-card)] border border-[var(--border)] shadow-soft p-3">
        <div className="flex items-center justify-between px-2 py-2">
          <Dialog.Title className="text-sm font-semibold text-[var(--neutral-900)]">
            Product demo
          </Dialog.Title>
          <Dialog.Close asChild>
            <button
              className="px-2 py-1 rounded-md border border-[var(--border)] bg-[var(--bg-card)] text-xs"
              onClick={onClose}
            >
              Close
            </button>
          </Dialog.Close>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-2">
          {shots.map((src) => (
            <div
              key={src}
              className="rounded-md border border-[var(--border)] bg-[var(--bg-card)] p-2"
            >
              <img
                src={src}
                alt="MentorPath screenshot"
                className="w-full h-40 object-cover rounded"
              />
            </div>
          ))}
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  )
}
