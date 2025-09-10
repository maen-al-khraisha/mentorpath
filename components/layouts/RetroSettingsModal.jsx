'use client'

import { X, User, Settings, Shield, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebaseClient'
import { useLayout } from '@/lib/LayoutContext'

export default function RetroSettingsModal({ isOpen, onClose, user }) {
  const router = useRouter()
  const { currentLayout, switchLayout } = useLayout()

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      router.replace('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="retro-modal-backdrop" onClick={onClose} />

      {/* Modal Content */}
      <div className="retro-settings-modal">
        {/* Header */}
        <div className="retro-modal-header">
          <h2 className="retro-modal-title">Settings</h2>
          <button className="retro-button retro-button-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="retro-modal-content">
          {/* User Section */}
          <div className="retro-settings-section">
            <h3 className="retro-settings-section-title">User Profile</h3>
            <div className="retro-user-info-card">
              <div className="retro-user-avatar-large">
                <User size={24} />
              </div>
              <div className="retro-user-details-large">
                <div className="retro-user-name-large">{user?.displayName || 'User'}</div>
                <div className="retro-user-email-large">{user?.email || 'user@example.com'}</div>
              </div>
            </div>
          </div>

          {/* Settings Options */}
          <div className="retro-settings-section">
            <h3 className="retro-settings-section-title">Preferences</h3>
            <div className="retro-settings-options">
              <button className="retro-settings-option">
                <Settings size={16} />
                <span>General Settings</span>
              </button>

              <button className="retro-settings-option">
                <Shield size={16} />
                <span>Privacy & Security</span>
              </button>
            </div>
          </div>

          {/* Layout Options */}
          <div className="retro-settings-section">
            <h3 className="retro-settings-section-title">Layout</h3>
            <div className="retro-layout-options">
              <div className="retro-layout-option">
                <input
                  type="radio"
                  id="layout-modern"
                  name="layout"
                  value="modern"
                  className="retro-radio"
                  checked={currentLayout === 'modern'}
                  onChange={() => switchLayout('modern')}
                />
                <label htmlFor="layout-modern" className="retro-layout-label">
                  <span className="retro-layout-name">Modern</span>
                  <span className="retro-layout-desc">Clean, contemporary design</span>
                </label>
              </div>

              <div className="retro-layout-option">
                <input
                  type="radio"
                  id="layout-retro"
                  name="layout"
                  value="retro"
                  className="retro-radio"
                  checked={currentLayout === 'retro'}
                  onChange={() => switchLayout('retro')}
                />
                <label htmlFor="layout-retro" className="retro-layout-label">
                  <span className="retro-layout-name">Retro</span>
                  <span className="retro-layout-desc">Classic pixel-art aesthetic</span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="retro-settings-actions">
            <button className="retro-button retro-button-danger" onClick={handleSignOut}>
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
