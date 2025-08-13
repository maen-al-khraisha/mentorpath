'use client'
import { mockEvents, mockHabits, mockNotes, mockTasks } from '@/lib/mockData'

export default function DashboardPage() {
  // Protected by parent layout

  return (
    <>
      {/* TODO: Hook cards to Firestore queries and show real counts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Today tasks', count: mockTasks.length },
          { title: 'Events', count: mockEvents.length },
          { title: 'Habits', count: mockHabits.length },
          { title: 'Notes', count: mockNotes.length },
        ].map((card) => (
          <div key={card.title} className="bg-card border border-border rounded-lg p-4 shadow-soft">
            <div className="text-sm text-neutral-700 mb-1">{card.title}</div>
            <div className="text-2xl font-semibold">{card.count}</div>
          </div>
        ))}
      </div>

      {/* TODO: Add charts (recharts) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {['Yesterday Summary', 'Week Overview', 'Focus'].map((t) => (
          <div key={t} className="bg-card border border-border rounded-lg p-4 shadow-soft h-40">
            <div className="text-sm text-neutral-700 mb-1">{t}</div>
            <div className="text-neutral-700 text-sm">Placeholder</div>
          </div>
        ))}
      </div>
    </>
  )
}
