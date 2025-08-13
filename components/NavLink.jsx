'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Accessible nav link with active state and optional tooltip when collapsed
export default function NavLink({ href, icon: Icon, label, collapsed, badge, title }) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-colors ${
        isActive ? 'bg-white/10 text-white' : 'text-white/90 hover:bg-white/10'
      }`}
      aria-current={isActive ? 'page' : undefined}
      title={collapsed ? label : title || ''}
    >
      {Icon ? <Icon size={18} aria-hidden className="shrink-0" /> : null}
      {!collapsed && <span className="truncate flex-1">{label}</span>}
      {!collapsed && badge != null && (
        <span className="ml-auto text-[10px] leading-4 px-1.5 py-0.5 rounded bg-white/15 text-white">
          {badge}
        </span>
      )}
    </Link>
  )
}
