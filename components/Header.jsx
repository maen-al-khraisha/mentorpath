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
    <header
      className="sticky top-0 z-50 bg-white border-l border-[var(--border)] shadow-sm"
      style={{ backgroundColor: 'white', backdropFilter: 'none' }}
    >
      <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-[var(--muted1)] focus:outline-none"
            onClick={onOpenMobileSidebar}
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
            <div className="text-sm font-semibold tracking-wide">{title}</div>
            <div className="text-xs text-[var(--neutral-700)]">{subtitle}</div>
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
              className="p-2 rounded-md hover:bg-[var(--muted1)] focus:outline-none"
              aria-label="Toggle theme"
            >
              <Sun size={16} />
            </button>
          )}

          <button
            className="p-2 rounded-md hover:bg-[var(--muted1)] focus:outline-none"
            aria-label="Notifications"
          >
            <Bell size={16} />
          </button>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen((d) => !d)}
              className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-[var(--muted1)] focus:outline-none"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <div className="w-8 h-8 rounded-full bg-[var(--muted2)] flex items-center justify-center text-sm">
                {user?.displayName?.[0] ?? 'U'}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm">{user?.displayName ?? 'Guest'}</div>
                <div className="text-xs text-[var(--neutral-700)]">{user?.email ?? ''}</div>
              </div>
            </button>

            {dropdownOpen && (
              <div
                role="menu"
                aria-label="User menu"
                className="absolute right-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border)] rounded-md shadow-soft py-1"
              >
                <button className="w-full text-left px-3 py-2 hover:bg-[var(--muted1)] flex items-center gap-2">
                  <User size={14} /> Profile
                </button>
                <button className="w-full text-left px-3 py-2 hover:bg-[var(--muted1)] flex items-center gap-2">
                  <Settings size={14} /> Settings
                </button>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="block w-full text-left px-3 py-2 hover:bg-[var(--muted1)]"
                  >
                    Admin
                  </Link>
                )}
                <hr className="my-1" />
                <button
                  onClick={async () => {
                    try {
                      await firebaseSignOut(auth)
                    } finally {
                      router.replace('/')
                    }
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-[var(--muted1)] flex items-center gap-2"
                >
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
