'use client'

import { firestore, auth } from '@/lib/firebaseClient'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore'

// Collection references
const usersCol = () => collection(firestore, 'users')
const usageCol = () => collection(firestore, 'usage')
const plansCol = () => collection(firestore, 'plans')

// Plan types
export const PLAN_TYPES = {
  TRIAL: 'trial',
  FREE: 'free',
  PRO: 'pro',
}

// Default plan limits
export const DEFAULT_PLAN_LIMITS = {
  [PLAN_TYPES.FREE]: {
    tasks: 20,
    notes: 5,
    habits: 3,
    events: 1, // per day
    sheets: 2,
    insights: false,
  },
  [PLAN_TYPES.PRO]: {
    tasks: -1, // unlimited
    notes: -1,
    habits: -1,
    events: -1,
    sheets: -1,
    insights: true,
  },
  [PLAN_TYPES.TRIAL]: {
    tasks: -1, // unlimited during trial
    notes: -1,
    habits: -1,
    events: -1,
    sheets: -1,
    insights: true,
  },
}

// Create or update user subscription data
export async function createUserSubscription(userId, userData = {}) {
  const user = auth?.currentUser
  if (!user) {
    throw new Error('User must be authenticated to create subscription')
  }

  const now = new Date()
  const trialEndDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) // 14 days

  const subscriptionData = {
    userId,
    email: userData.email || user.email,
    name: userData.name || user.displayName,
    plan: PLAN_TYPES.TRIAL,
    trialStartDate: now,
    trialEndDate,
    subscriptionStartDate: null,
    subscriptionEndDate: null,
    paddleCustomerId: null,
    paddleSubscriptionId: null,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  await setDoc(doc(firestore, 'users', userId), subscriptionData, { merge: true })
  return subscriptionData
}

// Get user subscription data
export async function getUserSubscription(userId) {
  try {
    const userDoc = await getDoc(doc(firestore, 'users', userId))
    if (!userDoc.exists()) {
      return null
    }
    return userDoc.data()
  } catch (error) {
    console.error('Error fetching user subscription:', error)
    throw error
  }
}

// Update user plan
export async function updateUserPlan(userId, plan, additionalData = {}) {
  const user = auth?.currentUser
  if (!user) {
    throw new Error('User must be authenticated to update plan')
  }

  const updateData = {
    plan,
    updatedAt: serverTimestamp(),
    ...additionalData,
  }

  // If upgrading to pro, set subscription dates
  if (plan === PLAN_TYPES.PRO) {
    updateData.subscriptionStartDate = new Date()
    updateData.trialEndDate = null // Clear trial end date
  }

  await updateDoc(doc(firestore, 'users', userId), updateData)
  return updateData
}

// Check if user is in trial period
export function isInTrial(subscription) {
  if (!subscription || subscription.plan !== PLAN_TYPES.TRIAL) {
    return false
  }

  const now = new Date()
  const trialEnd = subscription.trialEndDate?.toDate?.() || new Date(subscription.trialEndDate)
  return now < trialEnd
}

// Check if trial has expired
export function isTrialExpired(subscription) {
  if (!subscription || subscription.plan !== PLAN_TYPES.TRIAL) {
    return false
  }

  const now = new Date()
  const trialEnd = subscription.trialEndDate?.toDate?.() || new Date(subscription.trialEndDate)
  return now >= trialEnd
}

// Get days remaining in trial
export function getTrialDaysRemaining(subscription) {
  if (!isInTrial(subscription)) {
    return 0
  }

  const now = new Date()
  const trialEnd = subscription.trialEndDate?.toDate?.() || new Date(subscription.trialEndDate)
  const diffTime = trialEnd - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

// Get current month usage for a user
export async function getCurrentMonthUsage(userId) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  try {
    const usageQuery = query(
      usageCol(),
      where('userId', '==', userId),
      where('month', '==', `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
    )

    const usageSnapshot = await getDocs(usageQuery)
    const usageData = usageSnapshot.docs[0]?.data() || {
      tasks: 0,
      notes: 0,
      habits: 0,
      events: 0,
      sheets: 0,
    }

    return usageData
  } catch (error) {
    console.error('Error fetching usage data:', error)
    return {
      tasks: 0,
      notes: 0,
      habits: 0,
      events: 0,
      sheets: 0,
    }
  }
}

// Increment usage for a specific feature
export async function incrementUsage(userId, feature) {
  const now = new Date()
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const usageRef = doc(firestore, 'usage', `${userId}-${monthKey}`)
  const usageDoc = await getDoc(usageRef)

  if (usageDoc.exists()) {
    const currentUsage = usageDoc.data()
    await updateDoc(usageRef, {
      [feature]: (currentUsage[feature] || 0) + 1,
      updatedAt: serverTimestamp(),
    })
  } else {
    await setDoc(usageRef, {
      userId,
      month: monthKey,
      [feature]: 1,
      tasks: 0,
      notes: 0,
      habits: 0,
      events: 0,
      sheets: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }
}

// Check if user can perform an action based on their plan and usage
export async function canPerformAction(userId, action) {
  const subscription = await getUserSubscription(userId)
  if (!subscription) {
    return false
  }

  // Trial and Pro users have unlimited access
  if (subscription.plan === PLAN_TYPES.TRIAL || subscription.plan === PLAN_TYPES.PRO) {
    return true
  }

  // Free users have limits
  if (subscription.plan === PLAN_TYPES.FREE) {
    const usage = await getCurrentMonthUsage(userId)
    const limits = DEFAULT_PLAN_LIMITS[PLAN_TYPES.FREE]

    const currentUsage = usage[action] || 0
    const limit = limits[action]

    return currentUsage < limit
  }

  return false
}

// Get plan limits for a user
export function getPlanLimits(plan) {
  return DEFAULT_PLAN_LIMITS[plan] || DEFAULT_PLAN_LIMITS[PLAN_TYPES.FREE]
}

// Listen to user subscription changes
export function listenToUserSubscription(userId, callback) {
  return onSnapshot(doc(firestore, 'users', userId), (doc) => {
    if (doc.exists()) {
      callback(doc.data())
    } else {
      callback(null)
    }
  })
}

// Listen to usage changes
export function listenToUsage(userId, callback) {
  const now = new Date()
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  return onSnapshot(doc(firestore, 'usage', `${userId}-${monthKey}`), (doc) => {
    if (doc.exists()) {
      callback(doc.data())
    } else {
      callback({
        tasks: 0,
        notes: 0,
        habits: 0,
        events: 0,
        sheets: 0,
      })
    }
  })
}

// Auto-downgrade expired trials
export async function checkAndDowngradeExpiredTrials() {
  try {
    const usersQuery = query(usersCol(), where('plan', '==', PLAN_TYPES.TRIAL))

    const usersSnapshot = await getDocs(usersQuery)
    const now = new Date()

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data()
      const trialEnd = userData.trialEndDate?.toDate?.() || new Date(userData.trialEndDate)

      if (now >= trialEnd) {
        await updateUserPlan(userData.userId, PLAN_TYPES.FREE)
        console.log(`Auto-downgraded user ${userData.userId} from trial to free`)
      }
    }
  } catch (error) {
    console.error('Error checking expired trials:', error)
  }
}
