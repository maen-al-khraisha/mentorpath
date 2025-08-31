'use client'
import { useRequireAuth } from '@/utils/protectedRoute'
import { useEffect, useState } from 'react'
import { firestore } from '@/lib/firebaseClient'
import { doc, getDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'
import Link from 'next/link'

// 🔒 SECURITY: Define the ONLY admin user
const ADMIN_EMAIL = 'maen.alkhraisha@gmail.com'

export default function AdminLayout({ children }) {
  const { user, loading } = useRequireAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkAdminStatus() {
      if (!user) return

      try {
        // 🔒 SECURITY: Check if user is the designated admin
        let isDesignatedAdmin = false

        // Method 1: Check by email (primary method)
        if (user.email === ADMIN_EMAIL) {
          isDesignatedAdmin = true
        }

        // Method 2: Check Firestore role (for existing admin)
        if (!isDesignatedAdmin) {
          const userDoc = await getDoc(doc(firestore, 'users', user.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            if (userData.role === 'admin') {
              isDesignatedAdmin = true
            }
          }
        }

        if (isDesignatedAdmin) {
          setIsAdmin(true)
        } else {
          // 🚫 User is not admin - redirect to dashboard
          router.replace('/dashboard')
          return
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
        // 🚫 On error, deny access for security
        router.replace('/dashboard')
        return
      } finally {
        setCheckingAdmin(false)
      }
    }

    if (user) {
      checkAdminStatus()
    }
  }, [user, router])

  if (loading || checkingAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Logo Header - Click to return to main app */}
      <div className="bg-card border-b border-border px-6 py-4">
        <Link href="/" className="inline-block hover:scale-105 transition-transform duration-200">
          <Logo size="lg" showText={true} animated={true} />
        </Link>
        <div className="text-sm text-muted-foreground mt-2">
          Click logo to return to main application
        </div>
      </div>

      <main className="p-6">{children}</main>
    </div>
  )
}
