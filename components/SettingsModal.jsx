'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/Button'
import {
  Settings,
  User,
  Bell,
  Shield,
  Download,
  Upload,
  Palette,
  Monitor,
  Smartphone,
  Key,
  Save,
  Clock,
  Database,
} from 'lucide-react'

export default function SettingsModal({ isOpen, onClose, user }) {
  const [activeTab, setActiveTab] = useState('profile')
  const [isSaving, setIsSaving] = useState(false)

  // Form states
  const [profile, setProfile] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    bio: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: 'en',
    avatar: '',
  })

  const [preferences, setPreferences] = useState({
    theme: 'light',
    layout: 'comfortable',
    sidebarCollapsed: false,
    defaultView: 'dashboard',
    notifications: {
      email: true,
      push: true,
      inApp: true,
      taskReminders: true,
      habitStreaks: true,
      weeklyReports: true,
    },
    productivity: {
      autoStartTimers: false,
      defaultTaskDuration: 25,
      showProgressBars: true,
      enableKeyboardShortcuts: true,
    },
  })

  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 60,
    requireEmailVerification: true,
    allowDataSharing: false,
  })

  const [data, setData] = useState({
    autoBackup: true,
    backupFrequency: 'weekly',
    dataRetention: '1year',
    exportFormat: 'json',
  })

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User, color: 'bg-blue-100' },
    { id: 'preferences', label: 'Preferences', icon: Settings, color: 'bg-purple-100' },
    { id: 'theme', label: 'Theme', icon: Palette, color: 'bg-pink-100' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: 'bg-green-100' },
    { id: 'security', label: 'Security', icon: Shield, color: 'bg-amber-100' },
    { id: 'data', label: 'Data & Export', icon: Database, color: 'bg-indigo-100' },
  ]

  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        name: user.displayName || '',
        email: user.email || '',
      }))
    }
  }, [user])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save settings logic here
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

      // Save to localStorage for now (in real app, save to Firestore)
      localStorage.setItem('userPreferences', JSON.stringify(preferences))
      localStorage.setItem('userProfile', JSON.stringify(profile))
      localStorage.setItem('userSecurity', JSON.stringify(security))
      localStorage.setItem('userData', JSON.stringify(data))

      onClose()
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportData = () => {
    const exportData = {
      profile,
      preferences,
      security,
      data,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `user-settings-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result)
            if (data.profile) setProfile(data.profile)
            if (data.preferences) setPreferences(data.preferences)
            if (data.security) setSecurity(data.security)
            if (data.data) setData(data.data)
            alert('Settings imported successfully!')
          } catch (error) {
            alert('Invalid settings file')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Personal Information</h3>

        {/* Avatar Section */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white">
            {profile.name?.[0] ?? profile.email?.[0] ?? 'U'}
          </div>
          <div>
            <Button variant="secondary" size="sm">
              <Upload size={16} className="mr-2" />
              Change Avatar
            </Button>
            <p className="text-xs text-slate-500 mt-1">JPG, PNG or GIF. Max 2MB.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-500"
              placeholder="your@email.com"
            />
            <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            placeholder="Tell us about yourself..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Timezone</label>
            <select
              value={profile.timezone}
              onChange={(e) => setProfile((prev) => ({ ...prev, timezone: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Paris">Paris (CET)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
            <select
              value={profile.language}
              onChange={(e) => setProfile((prev) => ({ ...prev, language: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="ja">日本語</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">App Preferences</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Theme</label>
            <div className="space-y-3">
              {['light', 'dark', 'auto'].map((theme) => (
                <label key={theme} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    value={theme}
                    checked={preferences.theme === theme}
                    onChange={(e) => setPreferences((prev) => ({ ...prev, theme: e.target.value }))}
                    className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700 capitalize">{theme}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Layout Density</label>
            <div className="space-y-3">
              {['compact', 'comfortable', 'spacious'].map((layout) => (
                <label key={layout} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="layout"
                    value={layout}
                    checked={preferences.layout === layout}
                    onChange={(e) =>
                      setPreferences((prev) => ({ ...prev, layout: e.target.value }))
                    }
                    className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700 capitalize">{layout}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">Default View</label>
          <select
            value={preferences.defaultView}
            onChange={(e) => setPreferences((prev) => ({ ...prev, defaultView: e.target.value }))}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          >
            <option value="dashboard">Dashboard</option>
            <option value="tasks">Tasks</option>
            <option value="habits">Habits</option>
            <option value="notes">Notes</option>
            <option value="calendar">Calendar</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="sidebarCollapsed"
            checked={preferences.sidebarCollapsed}
            onChange={(e) =>
              setPreferences((prev) => ({ ...prev, sidebarCollapsed: e.target.checked }))
            }
            className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor="sidebarCollapsed" className="text-sm text-slate-700">
            Start with collapsed sidebar
          </label>
        </div>
      </div>
    </div>
  )

  const renderThemeTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Personal Theme</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Accent Color</label>
            <div className="space-y-3">
              {['blue', 'purple', 'green', 'orange', 'pink', 'indigo'].map((color) => (
                <label key={color} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="accentColor"
                    value={color}
                    className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                  />
                  <div className={`w-6 h-6 rounded-full bg-${color}-500`}></div>
                  <span className="text-sm text-slate-700 capitalize">{color}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Font Size</label>
            <div className="space-y-3">
              {['small', 'medium', 'large'].map((size) => (
                <label key={size} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="fontSize"
                    value={size}
                    className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                  />
                  <span
                    className={`text-slate-700 capitalize ${
                      size === 'small' ? 'text-sm' : size === 'large' ? 'text-lg' : 'text-base'
                    }`}
                  >
                    {size}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">Border Radius</label>
          <select className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
            <option value="none">None (Sharp)</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Notification Preferences</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Notification Channels
            </label>
            <div className="space-y-3">
              {Object.entries(preferences.notifications).map(([key, value]) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, [key]: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700">
                    {key === 'email'
                      ? 'Email Notifications'
                      : key === 'push'
                        ? 'Push Notifications'
                        : key === 'inApp'
                          ? 'In-App Notifications'
                          : key === 'taskReminders'
                            ? 'Task Reminders'
                            : key === 'habitStreaks'
                              ? 'Habit Streak Alerts'
                              : key === 'weeklyReports'
                                ? 'Weekly Progress Reports'
                                : key}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Notification Frequency
            </label>
            <select className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
              <option value="realtime">Real-time</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Security Settings</h3>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <h4 className="font-medium text-slate-900 mb-2">Two-Factor Authentication</h4>
          <p className="text-sm text-slate-600 mb-4">
            Add an extra layer of security to your account.
          </p>
          <Button variant="secondary" className="flex items-center gap-2">
            <Shield size={16} />
            {security.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
          </Button>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <h4 className="font-medium text-slate-900 mb-2">Active Sessions</h4>
          <p className="text-sm text-slate-600 mb-4">Manage your active sessions across devices.</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                <Monitor size={16} className="text-slate-500" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Desktop - Chrome</p>
                  <p className="text-xs text-slate-500">Current session</p>
                </div>
              </div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            </div>

            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                <Smartphone size={16} className="text-slate-500" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Mobile - Safari</p>
                  <p className="text-xs text-slate-500">Last active 2 hours ago</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                Revoke
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <h4 className="font-medium text-slate-900 mb-2">Password</h4>
          <p className="text-sm text-slate-600 mb-4">Change your account password.</p>
          <Button variant="secondary" className="flex items-center gap-2">
            <Key size={16} />
            Change Password
          </Button>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={security.requireEmailVerification}
              onChange={(e) =>
                setSecurity((prev) => ({ ...prev, requireEmailVerification: e.target.checked }))
              }
              className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-700">Require email verification for changes</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={security.allowDataSharing}
              onChange={(e) =>
                setSecurity((prev) => ({ ...prev, allowDataSharing: e.target.checked }))
              }
              className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-700">
              Allow anonymous data sharing for improvements
            </span>
          </label>
        </div>
      </div>
    </div>
  )

  const renderDataTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Data Management</h3>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <h4 className="font-medium text-slate-900 mb-2">Export Your Data</h4>
          <p className="text-sm text-slate-600 mb-4">
            Download all your data including tasks, notes, habits, and preferences.
          </p>
          <Button
            variant="secondary"
            onClick={handleExportData}
            className="flex items-center gap-2"
          >
            <Download size={16} />
            Export All Data
          </Button>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <h4 className="font-medium text-slate-900 mb-2">Import Data</h4>
          <p className="text-sm text-slate-600 mb-4">
            Import data from other productivity apps or restore from backup.
          </p>
          <Button
            variant="secondary"
            onClick={handleImportData}
            className="flex items-center gap-2"
          >
            <Upload size={16} />
            Import Data
          </Button>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <h4 className="font-medium text-slate-900 mb-2">Backup & Sync</h4>
          <p className="text-sm text-slate-600 mb-4">
            Your data is automatically backed up and synced across all your devices.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              Auto-backup enabled
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock size={14} />
              Last backup: 2 hours ago
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={data.autoBackup}
              onChange={(e) => setData((prev) => ({ ...prev, autoBackup: e.target.checked }))}
              className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-700">Enable automatic backups</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Backup Frequency
            </label>
            <select
              value={data.backupFrequency}
              onChange={(e) => setData((prev) => ({ ...prev, backupFrequency: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab()
      case 'preferences':
        return renderPreferencesTab()
      case 'theme':
        return renderThemeTab()
      case 'notifications':
        return renderNotificationsTab()
      case 'security':
        return renderSecurityTab()
      case 'data':
        return renderDataTab()
      default:
        return renderProfileTab()
    }
  }

  const header = {
    icon: <Settings size={24} className="text-indigo-600" />,
    title: 'Settings',
    subtitle: 'Customize your MentorPath experience',
    iconBgColor: 'bg-indigo-100',
  }

  const content = (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">{renderTabContent()}</div>
    </div>
  )

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleSave}
        disabled={isSaving}
        className="flex items-center gap-2"
      >
        {isSaving ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Saving...
          </>
        ) : (
          <>
            <Save size={16} />
            Save Changes
          </>
        )}
      </Button>
    </>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      header={header}
      content={content}
      footer={footer}
      size="xl"
      position="top"
      showCloseButton={true}
      closeOnBackdropClick={true}
    />
  )
}
