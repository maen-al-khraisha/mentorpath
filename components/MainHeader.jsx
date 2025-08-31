'use client'

import Link from 'next/link'
import ThemeToggle from './ThemeToggle'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  GoogleAuthProvider,
  getRedirectResult,
} from 'firebase/auth'
import { auth } from '@/lib/firebaseClient'
import Button from '@/components/Button'
import Logo from '@/components/Logo'

export default function MainHeader() {
  const authClient = auth
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!authClient) return

    // Handle redirect result when component mounts
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(authClient)
        if (result) {
          console.log('Sign-in successful via redirect')
        }
      } catch (error) {
        console.error('Error getting redirect result:', error)
      }
    }

    handleRedirectResult()

    const unsubscribe = onAuthStateChanged(authClient, (currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [authClient])

  const handleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider()
      // Add custom parameters to improve popup experience
      provider.setCustomParameters({
        prompt: 'select_account',
      })

      await signInWithPopup(authClient, provider)
    } catch (error) {
      console.error('Error signing in:', error)

      // Handle specific popup errors gracefully
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('Sign-in popup was closed by user')
        // You could show a user-friendly message here
      } else if (error.code === 'auth/popup-blocked') {
        console.log('Sign-in popup was blocked by browser')
        // You could show instructions to allow popups
      } else if (error.code === 'auth/cancelled-popup-request') {
        console.log('Sign-in popup request was cancelled')
      }

      // Fallback to redirect method if popup fails
      console.log('Falling back to redirect sign-in method...')
      try {
        await signInWithRedirect(authClient, provider)
      } catch (redirectError) {
        console.error('Redirect sign-in also failed:', redirectError)
      }
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(authClient)
      // Redirect to home page after sign out
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
      {/* Logo */}
      <Link href="/" className="flex items-center">
        <Logo size="lg" showText={true} animated={true} />
      </Link>

      {/* Navigation */}
      <nav className="flex items-center space-x-6">
        <Link
          href="/"
          className={`transition-colors duration-200 ${
            pathname === '/'
              ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600 pb-1'
              : 'text-[var(--neutral-700)] hover:text-[var(--neutral-900)]'
          }`}
        >
          Home
        </Link>
        <Link
          href="/features"
          className={`transition-colors duration-200 ${
            pathname === '/features'
              ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600 pb-1'
              : 'text-[var(--neutral-700)] hover:text-[var(--neutral-900)]'
          }`}
        >
          Features
        </Link>
        <Link 
          href="/contact" 
          className={`transition-colors duration-200 ${
            pathname === '/contact'
              ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600 pb-1'
              : 'text-[var(--neutral-700)] hover:text-[var(--neutral-900)]'
          }`}
        >
          Contact
        </Link>
        <Link 
          href="/pricing" 
          className={`transition-colors duration-200 ${
            pathname === '/pricing'
              ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600 pb-1'
              : 'text-[var(--neutral-700)] hover:text-[var(--neutral-900)]'
          }`}
        >
          Pricing
        </Link>
        <Link 
          href="/about" 
          className={`transition-colors duration-200 ${
            pathname === '/about'
              ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600 pb-1'
              : 'text-[var(--neutral-700)] hover:text-[var(--neutral-900)]'
          }`}
        >
          About
        </Link>
      </nav>

      {/* Right Side */}
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        {user ? (
          <>
            <span className="text-[var(--neutral-700)]">Hi, {user.displayName || 'User'}</span>

            <Link href="/dashboard">
              <Button variant="primary" size="sm">
                Dashboard
              </Button>
            </Link>
            <Button variant="primary" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </>
        ) : (
          <Button variant="primary" size="sm" onClick={handleSignIn}>
            Sign In
          </Button>
        )}
      </div>
    </header>
  )
}
