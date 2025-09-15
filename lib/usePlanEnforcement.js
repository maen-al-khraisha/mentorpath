'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import {
  getUserSubscription,
  canPerformAction,
  getCurrentMonthUsage,
  getPlanLimits,
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
    async function checkPlan() {
      if (!user) {
        setCheckingPlan(false)
        return
      }

      try {
        const userSubscription = await getUserSubscription(user.uid)
        setSubscription(userSubscription)

        if (userSubscription) {
          const limits = getPlanLimits(userSubscription.plan)
          setPlanLimits(limits)

          const currentUsage = await getCurrentMonthUsage(user.uid)
          setUsage(currentUsage)
        }
      } catch (error) {
        console.error('Error checking plan:', error)
      } finally {
        setCheckingPlan(false)
      }
    }

    checkPlan()
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
