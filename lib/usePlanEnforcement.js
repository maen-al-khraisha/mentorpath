'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import {
  getUserSubscription,
  canPerformAction,
  getCurrentMonthUsage,
  getPlanLimits,
  listenToUserSubscription,
  PLAN_TYPES,
} from '@/lib/subscriptionApi'

export function usePlanEnforcement() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [subscription, setSubscription] = useState(null)
  const [usage, setUsage] = useState(null)
  const [planLimits, setPlanLimits] = useState(null)
  const [checkingPlan, setCheckingPlan] = useState(true)

  useEffect(() => {
    if (!user) {
      setCheckingPlan(false)
      return
    }

    setCheckingPlan(true)

    // Set up real-time listener for subscription changes
    const unsubscribe = listenToUserSubscription(user.uid, async (userData) => {
      if (userData) {
        setSubscription(userData)

        try {
          const limits = await getPlanLimits(user.uid)
          setPlanLimits(limits)

          const currentUsage = await getCurrentMonthUsage(user.uid)
          setUsage(currentUsage)
        } catch (error) {
          console.error('Error loading plan data:', error)
        }
      } else {
        setSubscription(null)
        setPlanLimits(null)
        setUsage(null)
      }
      setCheckingPlan(false)
    })

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [user])

  const checkAction = async (action) => {
    if (!user) return false

    try {
      return await canPerformAction(user.uid, action)
    } catch (error) {
      console.error('Error checking action:', error)
      return false
    }
  }

  const redirectToBilling = () => {
    router.push('/billing')
  }

  return {
    subscription,
    usage,
    planLimits,
    checkingPlan,
    checkAction,
    redirectToBilling,
    user,
    loading,
  }
}
