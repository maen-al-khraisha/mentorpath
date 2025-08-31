'use client'

import { useState } from 'react'
import Button from '@/components/Button'
import SettingsModal from '@/components/SettingsModal'
import { Settings } from 'lucide-react'

export default function SettingsDemo() {
  const [isOpen, setIsOpen] = useState(false)

  // Mock user data for demo
  const mockUser = {
    displayName: 'Demo User',
    email: 'demo@example.com',
    uid: 'demo123',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Settings size={32} className="text-white" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-4">Settings Modal Demo</h1>

        <p className="text-slate-600 mb-8">
          Click the button below to see the comprehensive user settings modal in action!
        </p>

        <Button variant="primary" onClick={() => setIsOpen(true)} className="w-full">
          <Settings size={20} className="mr-2" />
          Open Settings Modal
        </Button>

        <div className="mt-8 p-4 bg-slate-50 rounded-xl">
          <h3 className="font-semibold text-slate-900 mb-2">What You'll See:</h3>
          <ul className="text-sm text-slate-600 space-y-1 text-left">
            <li>• 6 comprehensive settings tabs</li>
            <li>• Professional tabbed interface</li>
            <li>• Responsive design for all devices</li>
            <li>• Local storage persistence</li>
            <li>• Export/import functionality</li>
          </ul>
        </div>
      </div>

      <SettingsModal isOpen={isOpen} onClose={() => setIsOpen(false)} user={mockUser} />
    </div>
  )
}
