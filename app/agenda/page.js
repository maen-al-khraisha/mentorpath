'use client'
import { mockEvents } from '@/lib/mockData'

export default function AgendaPage() {
  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-soft min-h-[400px]">
      <div className="font-semibold mb-2">Agenda</div>
      <ul className="space-y-2 text-sm">
        {mockEvents.map((e) => (
          <li
            key={e.id}
            className="px-3 py-2 rounded-md border border-[var(--border)] flex items-center justify-between"
          >
            <span className="truncate">{e.title}</span>
            <span className="text-[11px] text-[var(--neutral-700)]">{e.time}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
