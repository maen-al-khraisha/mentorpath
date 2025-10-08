'use client'

import { firestore, auth } from '@/lib/firebaseClient'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  getDocs,
  where,
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

// Helper function to get package name by ID
async function getPackageName(packageId) {
  try {
    const packageDoc = await getDoc(doc(firestore, 'packages', packageId))
    if (packageDoc.exists()) {
      return packageDoc.data().name
    }
    return 'Unknown Package'
  } catch (error) {
    console.error('Error fetching package name:', error)
    return 'Unknown Package'
  }
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
    // Do NOT set a package here; admin panel assigns packages explicitly
    current_package: userData.current_package || null,
    package_name: userData.package_name || null,
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

  // If upgrading to pro, set subscription dates; package is assigned explicitly via additionalData
  if (plan === PLAN_TYPES.PRO) {
    updateData.subscriptionStartDate = new Date()
    updateData.subscriptionEndDate = null // Pro plan doesn't expire
    updateData.subscription_status = 'active'
  }

  // If downgrading to free, clear subscription dates; package is assigned explicitly via additionalData
  if (plan === PLAN_TYPES.FREE) {
    updateData.subscriptionStartDate = null
    updateData.subscriptionEndDate = null
    updateData.downgradeDate = new Date()
    updateData.subscription_status = 'active'
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

    // For habits, count all active habits (not just monthly created ones)
    const actualHabits = allHabits.filter((habit) => habit.isActive !== false).length

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

  // Get user's current package - fix package ID mapping
  // Use package id as stored. No hardcoded mapping; treat unknown/missing as not found
  let userPackage = subscription.current_package

  try {
    // Fetch package limits from database
    const packageDoc = await getDoc(doc(firestore, 'packages', userPackage))
    const packageData = packageDoc.data()

    if (!packageData) {
      console.warn(`Package ${userPackage} not found, granting unlimited access`)
      // If package not found, grant unlimited access (default behavior)
      return true
    }

    // Use dynamic package limits - fix field name mapping
    let limitField = `${action}_limit` // e.g., task_limit, notes_limit, habit_limit

    // Fix field name for habits (should be habit_limit, not habits_limit)
    if (action === 'habits') {
      limitField = 'habit_limit'
    }

    // Fix field name for sheets (should be sheet_limit, not sheets_limit)
    if (action === 'sheets') {
      limitField = 'sheet_limit'
    }

    // Fix field name for tasks (should be task_limit, not tasks_limit)
    if (action === 'tasks') {
      limitField = 'task_limit'
    }

    const limit = packageData[limitField]

    // Unlimited check (-1 means unlimited)
    if (limit === -1) {
      return true
    }

    // Special handling for events (daily limit)
    if (action === 'events') {
      const targetDate = date ? new Date(date) : new Date()
      const dailyEventCount = await getCurrentDayEventUsage(userId, targetDate)
      return dailyEventCount < limit
    }

    // Special handling for habits (total active habits, not monthly)
    if (action === 'habits') {
      try {
        const { getHabits } = await import('./habitsApi')
        const allHabits = await getHabits(userId)
        const activeHabits = allHabits.filter((habit) => habit.isActive !== false).length

        return activeHabits < limit
      } catch (error) {
        console.error('Error checking habit limit:', error)
        return false
      }
    }

    // Special handling for sheets (total active sheets, not monthly)
    if (action === 'sheets') {
      try {
        const { getSheets } = await import('./sheetsApi')
        const allSheets = await getSheets(userId)
        const activeSheets = allSheets.filter((sheet) => sheet.isActive !== false).length

        return activeSheets < limit
      } catch (error) {
        console.error('Error checking sheet limit:', error)
        return false
      }
    }

    // Special handling for notes (total active notes, not monthly)
    if (action === 'notes') {
      try {
        const { getNotes } = await import('./notesApi')
        const allNotes = await getNotes(userId)
        const activeNotes = allNotes.filter((note) => note.isActive !== false).length

        return activeNotes < limit
      } catch (error) {
        console.error('Error checking note limit:', error)
        return false
      }
    }

    // Special handling for tasks (monthly limit)
    if (action === 'tasks') {
      try {
        const { getDocs, query, where, collection } = await import('firebase/firestore')
        const { firestore } = await import('./firebaseClient')

        const tasksRef = collection(firestore, 'tasks')
        const q = query(tasksRef, where('ownerId', '==', userId))
        const querySnapshot = await getDocs(q)

        const allTasks = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        // Count tasks created in the current month
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

        const monthlyTasks = allTasks.filter((task) => {
          const createdAt = task.createdAt?.toDate
            ? task.createdAt.toDate()
            : new Date(task.createdAt)
          return createdAt >= startOfMonth && createdAt <= endOfMonth
        })

        // Debug: Count tasks in last 3 months
        const monthlyCounts = []
        for (let i = 0; i < 3; i++) {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
          const monthEnd = new Date(
            monthDate.getFullYear(),
            monthDate.getMonth() + 1,
            0,
            23,
            59,
            59,
            999
          )

          const monthTasks = allTasks.filter((task) => {
            const createdAt = task.createdAt?.toDate
              ? task.createdAt.toDate()
              : new Date(task.createdAt)
            return createdAt >= monthStart && createdAt <= monthEnd
          })

          monthlyCounts.push({
            month: `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`,
            count: monthTasks.length,
          })
        }

        return monthlyTasks.length < limit
      } catch (error) {
        console.error('Error checking task limit:', error)
        return false
      }
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
  } catch (error) {
    console.error('Error fetching package limits:', error)
    // Deny action if database fetch fails
    return false
  }
}

// Get plan limits for a user (now dynamic from packages)
export async function getPlanLimits(userId) {
  try {
    const subscription = await getUserSubscription(userId)
    if (!subscription) {
      throw new Error('User subscription not found')
    }

    // Use package id as stored. No hardcoded mapping; treat unknown/missing as not found
    let userPackage = subscription.current_package

    // Fetch package limits from database
    const packageDoc = await getDoc(doc(firestore, 'packages', userPackage))
    const packageData = packageDoc.data()

    if (packageData) {
      return {
        tasks: packageData.task_limit,
        notes: packageData.notes_limit,
        habits: packageData.habit_limit,
        events: packageData.events_limit,
        sheets: packageData.sheet_limit,
        insights: packageData.insights_enabled,
      }
    }

    // If package not found, return unlimited limits (default behavior)
    console.warn(`Package ${userPackage} not found, returning unlimited limits`)
    return {
      tasks: -1,
      notes: -1,
      habits: -1,
      events: -1,
      sheets: -1,
      insights: true,
    }
  } catch (error) {
    console.error('Error fetching plan limits:', error)
    throw error
  }
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
