'use client'

import Link from 'next/link'
import * as Dialog from '@radix-ui/react-dialog'
import ScreenshotModal from '@/components/ScreenshotModal'
import { useState } from 'react'

export default function Hero() {
  const [open, setOpen] = useState(false)

  return (
    <section className="relative pt-12 md:pt-20 pb-8 md:pb-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-center">
          {/* Left copy */}
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[var(--neutral-900)]">
              Focused productivity for mentors and makers
            </h1>
            <p className="mt-3 text-base md:text-lg text-[var(--neutral-700)]">
              Tasks, notes, habits, calendar, and insights — beautifully organized in one place.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg px-5 py-3 bg-[var(--primary)] text-[var(--neutral-900)] font-semibold shadow-soft focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                Get started — Free
              </Link>
              <Dialog.Root open={open} onOpenChange={setOpen}>
                <Dialog.Trigger asChild>
                  <button
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 border border-[var(--border)] bg-[var(--card)] text-[var(--neutral-900)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    aria-haspopup="dialog"
                  >
                    See demo
                  </button>
                </Dialog.Trigger>
                <ScreenshotModal onClose={() => setOpen(false)} />
              </Dialog.Root>
            </div>
          </div>

          {/* Right mockup */}
          <div className="relative">
            <div className="rounded-lg shadow-soft border border-[var(--border)] bg-gradient-to-br from-white to-[var(--muted1)] p-3">
              <div className="rounded-md bg-[var(--card)] border border-[var(--border)] overflow-hidden">
                <div className="h-6 bg-[var(--muted2)]/40" />
                <div className="p-4 grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-3">
                    <div className="h-10 rounded-md bg-[var(--muted1)]" />
                    <div className="h-28 rounded-md bg-[var(--muted1)]" />
                    <div className="h-10 rounded-md bg-[var(--muted1)]" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-16 rounded-md bg-[var(--muted1)]" />
                    <div className="h-24 rounded-md bg-[var(--muted1)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
