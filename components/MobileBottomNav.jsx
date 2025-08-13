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
      className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--neutral-900)] text-white border-t border-white/10 h-14 z-40"
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
                className={`flex flex-col items-center justify-center gap-1 text-[11px] w-full ${
                  active ? 'text-white' : 'text-white/70'
                }`}
              >
                <Icon size={18} />
                <span className="leading-none">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
