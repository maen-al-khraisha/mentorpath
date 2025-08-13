'use client'

import Link from 'next/link'
import ThemeToggle from './ThemeToggle'
import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '@/lib/firebaseClient'

export default function MainHeader() {
  const authClient = auth
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (!authClient) return
    const unsubscribe = onAuthStateChanged(authClient, (currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [authClient])

  const handleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(authClient, provider)
    } catch (error) {
      console.error('Error signing in:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(authClient)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
      {/* Logo */}
      <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
        MentorPath
      </Link>

      {/* Navigation */}
      <nav className="flex items-center space-x-6">
        <Link
          href="/features"
          className="text-[var(--neutral-700)] hover:text-[var(--neutral-900)]"
        >
          Features
        </Link>
        <Link href="/contact" className="text-[var(--neutral-700)] hover:text-[var(--neutral-900)]">
          Contact
        </Link>

        <Link href="/pricing" className="text-[var(--neutral-700)] hover:text-[var(--neutral-900)]">
          Pricing
        </Link>
        <Link href="/about" className="text-[var(--neutral-700)] hover:text-[var(--neutral-900)]">
          About
        </Link>
      </nav>

      {/* Right Side */}
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        {user ? (
          <>
            <span className="text-[var(--neutral-700)]">Hi, {user.displayName || 'User'}</span>

            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--primary)] text-[var(--neutral-900)] shadow-soft hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              Dashboard
            </Link>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--primary)] text-[var(--neutral-900)] shadow-soft hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              Sign Out
            </button>
          </>
        ) : (
          <button
            onClick={handleSignIn}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--primary)] text-[var(--neutral-900)] shadow-soft hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  )
}
