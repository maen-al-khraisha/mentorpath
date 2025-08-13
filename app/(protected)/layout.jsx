'use client'

import { useRequireAuth } from '@/utils/protectedRoute'
import Layout from '@/components/Layout'

export default function ProtectedLayout({ children }) {
  const { user, loading } = useRequireAuth()
  if (loading || !user) return null
  return <Layout columns="1">{children}</Layout>
}
