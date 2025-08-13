'use client'
import { mockHabits } from '@/lib/mockData'

export default function HabitsPage() {
  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-soft min-h-[400px]">
      <div className="font-semibold mb-2">Habits</div>
      <ul className="space-y-2 text-sm">
        {mockHabits.map((h) => (
          <li key={h.id} className="px-3 py-2 rounded-md border border-[var(--border)]">
            {h.title}
          </li>
        ))}
      </ul>
    </div>
  )
}
