'use client'

import {
  LayoutDashboard,
  CheckSquare,
  NotebookPen,
  Activity,
  CalendarDays,
  ListTodo,
  BarChart3,
} from 'lucide-react'

const features = [
  { icon: CheckSquare, title: 'Tasks', desc: 'Plan and focus with smart daily lists.' },
  { icon: NotebookPen, title: 'Notes', desc: 'Capture ideas and link to tasks.' },
  { icon: Activity, title: 'Habits', desc: 'Build routines that stick.' },
  { icon: CalendarDays, title: 'Calendar', desc: 'See your day at a glance.' },
  { icon: ListTodo, title: 'Agenda', desc: 'Run efficient meetings.' },
  { icon: BarChart3, title: 'Insights', desc: 'Reflect with lightweight analytics.' },
]

export default function FeaturesGrid() {
  return (
    <section className="py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-[var(--neutral-900)]">
          Everything you need
        </h2>
        <p className="text-[var(--neutral-700)] mt-1">Simple, fast, and focused.</p>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4 shadow-soft"
            >
              <div className="flex items-center gap-2">
                <f.icon size={18} className="text-[var(--neutral-900)]" aria-hidden />
                <div className="font-medium text-[var(--neutral-900)]">{f.title}</div>
              </div>
              <div className="mt-2 text-sm text-[var(--neutral-700)]">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
