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
}

// Create or update user subscription data
export async function createUserSubscription(userId, userData = {}) {
  const user = auth?.currentUser
  if (!user) {
    throw new Error('User must be authenticated to create subscription')
  }

  const subscriptionData = {
    userId,
    email: userData.email || user.email,
    name: userData.name || user.displayName,
    plan: PLAN_TYPES.FREE,
    subscriptionStartDate: null,
    subscriptionEndDate: null,
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
      // If user doesn't have a subscription record, create one
      await createUserSubscription(userId)
      // Return the newly created subscription
      const newUserDoc = await getDoc(doc(firestore, 'users', userId))
      return newUserDoc.data()
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
    updateData.subscriptionEndDate = null // Pro plan doesn't expire
  }

  // If downgrading to free, clear subscription dates
  if (plan === PLAN_TYPES.FREE) {
    updateData.subscriptionStartDate = null
    updateData.subscriptionEndDate = null
    updateData.downgradeDate = new Date()
  }

  await updateDoc(doc(firestore, 'users', userId), updateData)
  return updateData
}

// Downgrade user from Pro to Free plan
export async function downgradeToFree(userId) {
  const user = auth?.currentUser
  if (!user) {
    throw new Error('User must be authenticated to downgrade')
  }

  // Get current subscription
  const subscription = await getUserSubscription(userId)
  if (!subscription || subscription.plan !== PLAN_TYPES.PRO) {
    throw new Error('User is not currently on Pro plan')
  }

  // Downgrade to free plan
  await updateUserPlan(userId, PLAN_TYPES.FREE, {
    downgradeReason: 'user_requested',
    downgradeDate: new Date(),
  })

  return { success: true, message: 'Successfully downgraded to Free plan' }
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
  const user = auth?.currentUser
  if (!user) {
    throw new Error('User must be authenticated to increment usage')
  }

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
    const newUsageData = {
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
    }
    await setDoc(usageRef, newUsageData)
  }
}

// Decrement usage for a specific feature
export async function decrementUsage(userId, feature) {
  const user = auth?.currentUser
  if (!user) {
    throw new Error('User must be authenticated to decrement usage')
  }

  const now = new Date()
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const usageRef = doc(firestore, 'usage', `${userId}-${monthKey}`)

  const usageDoc = await getDoc(usageRef)

  if (usageDoc.exists()) {
    const currentUsage = usageDoc.data()
    const currentCount = currentUsage[feature] || 0
    const newCount = Math.max(0, currentCount - 1) // Don't go below 0

    await updateDoc(usageRef, {
      [feature]: newCount,
      updatedAt: serverTimestamp(),
    })
  }
  // If usage doc doesn't exist, there's nothing to decrement
}

// Sync usage count with actual number of items
export async function syncUsageWithActualCount(userId) {
  const user = auth?.currentUser
  if (!user) {
    throw new Error('User must be authenticated to sync usage')
  }

  try {
    // Get actual counts from IndexedDB and Firestore
    const { getNotes } = await import('./notesApi')
    const { getTasks } = await import('./tasksApi')
    const { getHabits } = await import('./habitsApi')
    const { getEvents } = await import('./eventsApi')

    // Get current month boundaries
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const [allNotes, allTasks, allHabits, allEvents] = await Promise.all([
      getNotes(userId),
      getTasks(userId),
      getHabits(userId),
      getEvents(userId),
    ])

    // Filter to only count items created in the current month
    const actualNotes = allNotes.filter((note) => {
      const createdAt = new Date(note.createdAt)
      return createdAt >= startOfMonth && createdAt <= endOfMonth
    }).length

    const actualTasks = allTasks.filter((task) => {
      const createdAt = task.createdAt?.toDate ? task.createdAt.toDate() : new Date(task.createdAt)
      return createdAt >= startOfMonth && createdAt <= endOfMonth
    }).length

    const actualHabits = allHabits.filter((habit) => {
      const createdAt = habit.createdAt?.toDate
        ? habit.createdAt.toDate()
        : new Date(habit.createdAt)
      return createdAt >= startOfMonth && createdAt <= endOfMonth
    }).length

    const actualEvents = allEvents.filter((event) => {
      const createdAt = event.createdAt?.toDate
        ? event.createdAt.toDate()
        : new Date(event.createdAt)
      return createdAt >= startOfMonth && createdAt <= endOfMonth
    }).length

    // Update Firestore usage count to match actual counts
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const usageRef = doc(firestore, 'usage', `${userId}-${monthKey}`)

    const usageDoc = await getDoc(usageRef)

    if (usageDoc.exists()) {
      await updateDoc(usageRef, {
        notes: actualNotes,
        tasks: actualTasks,
        habits: actualHabits,
        events: actualEvents,
        updatedAt: serverTimestamp(),
      })
    } else {
      const newUsageData = {
        userId,
        month: monthKey,
        notes: actualNotes,
        tasks: actualTasks,
        habits: actualHabits,
        events: actualEvents,
        sheets: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
      await setDoc(usageRef, newUsageData)
    }

    return {
      notes: actualNotes,
      tasks: actualTasks,
      habits: actualHabits,
      events: actualEvents,
    }
  } catch (error) {
    console.error('Error syncing usage with actual count:', error)
    throw error
  }
}

// Get current day usage for events (daily limit)
export async function getCurrentDayEventUsage(userId, date = new Date()) {
  try {
    const { getEvents } = await import('./eventsApi')
    const allEvents = await getEvents(userId)

    // Filter events for the specific date
    const dateString = date.toISOString().split('T')[0] // YYYY-MM-DD format
    const dayEvents = allEvents.filter((event) => event.date === dateString)

    return dayEvents.length
  } catch (error) {
    console.error('Error fetching daily event usage:', error)
    return 0
  }
}

// Check if user can perform an action based on their plan and usage
export async function canPerformAction(userId, action, date = null) {
  const subscription = await getUserSubscription(userId)
  if (!subscription) {
    return false
  }

  // Pro users have unlimited access
  if (subscription.plan === PLAN_TYPES.PRO) {
    return true
  }

  // Free users have limits
  if (subscription.plan === PLAN_TYPES.FREE) {
    const limits = DEFAULT_PLAN_LIMITS[PLAN_TYPES.FREE]
    const limit = limits[action]

    // Special handling for events (daily limit)
    if (action === 'events') {
      const targetDate = date ? new Date(date) : new Date()
      const dailyEventCount = await getCurrentDayEventUsage(userId, targetDate)
      return dailyEventCount < limit
    }

    // For other features (monthly limits)
    const usage = await getCurrentMonthUsage(userId)
    const currentUsage = usage[action] || 0

    // If we're at or over the limit, try to sync with actual count
    if (currentUsage >= limit) {
      try {
        const syncedCounts = await syncUsageWithActualCount(userId)
        const actualCount = syncedCounts[action] || 0

        // Return true if actual count is below limit
        return actualCount < limit
      } catch (error) {
        console.error('Error syncing usage during limit check:', error)
        // Fall back to original logic if sync fails
        return currentUsage < limit
      }
    }

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
