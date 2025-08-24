// components/Header.jsx
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sun, Bell, User, LogOut, Settings } from 'lucide-react'
import { useAuth } from '@/lib/useAuth'
import { signOut as firebaseSignOut } from 'firebase/auth'
import { auth } from '@/lib/firebaseClient'
import { useRouter } from 'next/navigation'
import ThemeToggle from './ThemeToggle' // optional; fallback implemented below if missing

export default function Header({
  title = 'Dashboard',
  subtitle = 'Simplify Your Day, Every Day',
  onOpenMobileSidebar,
}) {
  const { user } = useAuth()
  const router = useRouter()
  const isAdmin =
    typeof window !== 'undefined' &&
    (localStorage.getItem('mentorpath.isAdmin') === 'true' ||
      process.env.NEXT_PUBLIC_ADMIN_MODE === 'true')

  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-soft">
      <div className="max-w-[1400px] mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
            onClick={onOpenMobileSidebar}
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
          </button>

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
            <button
              className="p-2 rounded-xl hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              aria-label="Toggle theme"
            >
              <Sun size={18} className="text-slate-600" />
            </button>
          )}

          <button
            className="p-2 rounded-xl hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 relative"
            aria-label="Notifications"
          >
            <Bell size={18} className="text-slate-600" />
            {/* Notification indicator */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </button>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen((d) => !d)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
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
            </button>

            {dropdownOpen && (
              <div
                role="menu"
                aria-label="User menu"
                className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-elevated py-2 z-50"
              >
                <button className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 transition-colors duration-200">
                  <User size={16} className="text-slate-600" />
                  <span className="text-slate-700">Profile</span>
                </button>
                <button className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 transition-colors duration-200">
                  <Settings size={16} className="text-slate-600" />
                  <span className="text-slate-700">Settings</span>
                </button>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="block w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors duration-200 text-slate-700"
                  >
                    Admin
                  </Link>
                )}
                <hr className="my-2 border-slate-200" />
                <button
                  onClick={async () => {
                    try {
                      await firebaseSignOut(auth)
                    } finally {
                      router.replace('/')
                    }
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 transition-colors duration-200"
                >
                  <LogOut size={16} className="text-slate-600" />
                  <span className="text-slate-700">Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
