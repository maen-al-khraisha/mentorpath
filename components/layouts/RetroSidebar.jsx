'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  Calendar,
  Target,
  ClipboardList,
  BarChart3,
  Bell,
  Settings,
  User,
  Share2,
  ChevronLeft,
} from 'lucide-react'

export default function RetroSidebar({ user }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Notes', href: '/notes', icon: FileText },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Habits', href: '/habits', icon: Target },
    { name: 'Agenda', href: '/agenda', icon: ClipboardList },
    { name: 'Insights', href: '/insights', icon: BarChart3 },
  ]

  const isActive = (href) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <aside className={`retro-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo Section */}
      <div className="retro-logo-section">
        <div className="retro-logo">
          <span className="retro-logo-text">Mentor Path</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="retro-nav">
        <ul className="retro-nav-list">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <li key={item.href} className="retro-nav-item">
                <Link href={item.href} className={`retro-nav-link ${active ? 'active' : ''}`}>
                  <Icon size={16} className="retro-nav-icon" />
                  <span className="retro-nav-text">{item.name}</span>
                  {active && <div className="retro-nav-checkmark">✓</div>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="retro-sidebar-bottom">
        <div className="retro-user-section">
          <div className="retro-user-avatar">
            <User size={16} />
          </div>
          <div className="retro-user-info">
            <div className="retro-user-name">{user?.displayName || 'User'}</div>
            <div className="retro-user-email">{user?.email || 'user@example.com'}</div>
          </div>
        </div>

        <div className="retro-action-buttons">
          <button className="retro-button retro-button-small">
            <Bell size={14} />
            <span>Notifications</span>
          </button>

          <button className="retro-button retro-button-small">
            <Settings size={14} />
            <span>Settings</span>
          </button>
        </div>

        <div className="retro-sidebar-actions">
          <button className="retro-button retro-button-primary">
            <Share2 size={14} />
            <span>Share</span>
          </button>

          <button className="retro-button retro-button-secondary">
            <span>Upgrade</span>
          </button>
        </div>

        <button className="retro-collapse-button" onClick={() => setCollapsed(!collapsed)}>
          <ChevronLeft size={16} />
          <span>Collapse</span>
        </button>
      </div>
    </aside>
  )
}
