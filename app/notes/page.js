'use client'
import { mockNotes } from '@/lib/mockData'

export default function NotesPage() {
  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-soft min-h-[400px]">
      <div className="font-semibold mb-2">Notes</div>
      <ul className="space-y-2 text-sm">
        {mockNotes.map((n) => (
          <li key={n.id} className="px-3 py-2 rounded-md border border-[var(--border)]">
            {n.title}
          </li>
        ))}
      </ul>
    </div>
  )
}
