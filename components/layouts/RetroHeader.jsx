'use client'

import { Bell, Settings, User } from 'lucide-react'
import StyleToggle from '@/components/StyleToggle'

export default function RetroHeader({ user, title, subtitle, onOpenSettings }) {
  return (
    <header className="retro-header">
      <div className="retro-header-content">
        {/* Left Section - Title */}
        <div className="retro-header-left">
          <div className="retro-header-title-section">
            <h1 className="retro-header-title">{title}</h1>
            <p className="retro-header-subtitle">{subtitle}</p>
          </div>
        </div>

        {/* Right Section - User Info and Actions */}
        <div className="retro-header-right">
          {/* Style Toggle */}
          <div className="retro-header-action">
            <StyleToggle />
          </div>

          {/* Notifications */}
          <div className="retro-header-action">
            <button className="retro-button retro-button-icon">
              <Bell size={18} />
              <div className="retro-notification-dot"></div>
            </button>
          </div>

          {/* Settings */}
          <div className="retro-header-action">
            <button className="retro-button retro-button-icon" onClick={onOpenSettings}>
              <Settings size={18} />
            </button>
          </div>

          {/* User Profile */}
          <div className="retro-user-profile">
            <div className="retro-user-avatar">
              <User size={16} />
            </div>
            <div className="retro-user-details">
              <div className="retro-user-name">{user?.displayName || 'User'}</div>
              <div className="retro-user-email">{user?.email || 'user@example.com'}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
