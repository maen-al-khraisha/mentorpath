// components/Header.jsx
'use client'

import { useState } from 'react'
import { Bell, Sun, User, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebaseClient'
import Button from '@/components/Button'

export default function Header({
  title,
  subtitle,
  user,
  isAdmin,
  onOpenMobileSidebar,
  ThemeToggle,
}) {
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-soft">
      <div className="max-w-[1400px] mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenMobileSidebar}
            className="md:hidden"
            aria-label="Open menu"
          >
            <svg
              className="w-5 h-5 text-slate-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </Button>

          {/* Left: tab name + slogan */}
          <div className="flex flex-col">
            <div className="text-lg font-bold tracking-wide text-slate-900">{title}</div>
            <div className="text-sm text-slate-600">{subtitle}</div>
          </div>
        </div>

        {/* Middle: empty per requirement */}
        <div className="flex-1" />

        <div className="flex items-center gap-3">
          {/* Theme toggle - use provided component if exists */}
          {ThemeToggle ? (
            <ThemeToggle />
          ) : (
            <Button variant="ghost" size="icon" aria-label="Toggle theme">
              <Sun size={18} className="text-slate-600" />
            </Button>
          )}

          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell size={18} className="text-slate-600" />
            {/* Notification indicator */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </Button>

          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setDropdownOpen((d) => !d)}
              className="flex items-center gap-3"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center text-sm font-semibold text-white">
                {user?.displayName?.[0] ?? 'U'}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-slate-900">
                  {user?.displayName ?? 'Guest'}
                </div>
                <div className="text-xs text-slate-600">{user?.email ?? ''}</div>
              </div>
            </Button>

            {dropdownOpen && (
              <div
                role="menu"
                aria-label="User menu"
                className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-elevated py-2 z-50"
              >
                <Button variant="ghost" className="w-full justify-start px-4 py-3">
                  <User size={16} className="text-slate-600" />
                  <span className="text-slate-700">Profile</span>
                </Button>
                <Button variant="ghost" className="w-full justify-start px-4 py-3">
                  <Settings size={16} className="text-slate-600" />
                  <span className="text-slate-700">Settings</span>
                </Button>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="block w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors duration-200 text-slate-700"
                  >
                    Admin
                  </Link>
                )}
                <hr className="my-2 border-slate-200" />
                <Button
                  variant="ghost"
                  onClick={async () => {
                    try {
                      await signOut(auth)
                    } finally {
                      router.replace('/')
                    }
                  }}
                  className="w-full justify-start px-4 py-3"
                >
                  <LogOut size={16} className="text-slate-600" />
                  <span className="text-slate-700">Sign out</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
