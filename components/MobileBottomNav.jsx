'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CheckSquare, NotebookPen, CalendarDays, ListTodo } from 'lucide-react'

const items = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { href: '/notes', icon: NotebookPen, label: 'Notes' },
  { href: '/calendar', icon: CalendarDays, label: 'Cal' },
  { href: '/agenda', icon: ListTodo, label: 'Agenda' },
]

export default function MobileBottomNav() {
  const pathname = usePathname()
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg text-slate-900 border-t border-slate-200 h-16 z-40 shadow-elevated"
      role="navigation"
      aria-label="Bottom Navigation"
    >
      <ul className="grid grid-cols-5 h-full">
        {items.map((item) => {
          const Icon = item.icon
          const active = pathname.startsWith(item.href)
          return (
            <li key={item.href} className="flex items-stretch justify-center">
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 text-xs w-full transition-all duration-200 ${
                  active ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    active ? 'bg-indigo-100' : 'hover:bg-slate-100'
                  }`}
                >
                  <Icon size={20} />
                </div>
                <span className="leading-none font-medium">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
