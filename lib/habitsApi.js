import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore'
import { firestore, auth } from './firebaseClient'

// Collection references
const habitsCol = () => collection(firestore, 'habits')
const habitDoc = (id) => doc(firestore, 'habits', id)

// Create a new habit
export async function createHabit(habitData) {
  const user = auth?.currentUser
  if (!user) {
    throw new Error('User must be authenticated to create habits')
  }

  // Check if user can create habits based on their plan
  const { canPerformAction } = await import('./subscriptionApi')
  const canCreate = await canPerformAction(user.uid, 'habits')

  if (!canCreate) {
    throw new Error(
      'You have reached your habit limit for this month. Please upgrade to Pro for unlimited habits.'
    )
  }

  const habit = {
    ...habitData,
    userId: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    currentStreak: 0,
    longestStreak: 0,
    totalCompletedDays: 0,
    completedDates: [],
    isActive: true,
  }

  const docRef = await addDoc(habitsCol(), habit)

  // Increment usage for habits
  const { incrementUsage } = await import('./subscriptionApi')
  await incrementUsage(user.uid, 'habits')

  return { id: docRef.id, ...habit }
}

// Get all habits for a user
export async function getHabits(userId) {
  try {
    const user = auth?.currentUser
    if (!user) throw new Error('User must be authenticated to fetch habits')

    const habitsRef = collection(firestore, 'habits')
    const q = query(
      habitsRef,
      where('userId', '==', userId)
      // Removed orderBy to avoid index requirement
    )

    const querySnapshot = await getDocs(q)
    const habits = []

    querySnapshot.forEach((doc) => {
      habits.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    // Sort client-side instead of in the query
    return habits.sort((a, b) => {
      // Sort by category first, then by name
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category)
      }
      return a.name.localeCompare(b.name)
    })
  } catch (error) {
    console.error('Error fetching habits:', error)
    throw error
  }
}

// Update a habit
export async function updateHabit(habitId, updates) {
  const user = auth?.currentUser
  if (!user) {
    throw new Error('User must be authenticated to update habits')
  }

  await updateDoc(habitDoc(habitId), {
    ...updates,
    updatedAt: serverTimestamp(),
  })
}

// Delete a habit
export async function deleteHabit(habitId) {
  const user = auth?.currentUser
  if (!user) {
    throw new Error('User must be authenticated to delete habits')
  }

  const habitRef = doc(firestore, 'habits', habitId)
  const habitDoc = await getDoc(habitRef)

  if (!habitDoc.exists()) {
    throw new Error('Habit not found')
  }

  const habit = habitDoc.data()
  if (habit.userId !== user.uid) {
    throw new Error('You can only delete your own habits')
  }

  await deleteDoc(habitRef)
}

// Mark a habit as completed for a specific date
export async function markHabitCompleted(habitId, date) {
  const user = auth?.currentUser
  if (!user) {
    throw new Error('User must be authenticated to mark habits')
  }

  const habitRef = habitDoc(habitId)
  const habitSnapshot = await getDoc(habitRef)

  if (!habitSnapshot.exists()) {
    throw new Error('Habit not found')
  }

  const habit = habitSnapshot.data()
  const dateKey = date.toISOString().split('T')[0]

  // Check if already completed for this date
  if (habit.completedDates?.includes(dateKey)) {
    throw new Error('Habit already completed for this date')
  }

  const completedDates = [...(habit.completedDates || []), dateKey]
  const currentStreak = calculateCurrentStreak(completedDates, date)

  // Recalculate longest streak from all completed dates
  const longestStreak = calculateLongestStreak(completedDates)
  const totalCompletedDays = completedDates.length

  await updateDoc(habitRef, {
    completedDates,
    currentStreak,
    longestStreak,
    totalCompletedDays,
    updatedAt: serverTimestamp(),
  })

  return { currentStreak, longestStreak, totalCompletedDays }
}

// Mark a habit as not completed for a specific date
export async function markHabitIncomplete(habitId, date) {
  const user = auth?.currentUser
  if (!user) {
    throw new Error('User must be authenticated to mark habits')
  }

  const habitRef = habitDoc(habitId)
  const habitSnapshot = await getDoc(habitRef)

  if (!habitSnapshot.exists()) {
    throw new Error('Habit not found')
  }

  const habit = habitSnapshot.data()
  const dateKey = date.toISOString().split('T')[0]

  const completedDates = (habit.completedDates || []).filter((d) => d !== dateKey)
  const currentStreak = calculateCurrentStreak(completedDates, date)

  // Recalculate longest streak from all completed dates
  const longestStreak = calculateLongestStreak(completedDates)
  const totalCompletedDays = completedDates.length

  await updateDoc(habitRef, {
    completedDates,
    currentStreak,
    longestStreak,
    totalCompletedDays,
    updatedAt: serverTimestamp(),
  })

  return { currentStreak, longestStreak, totalCompletedDays }
}

// Calculate current streak based on completed dates
function calculateCurrentStreak(completedDates, currentDate) {
  if (!completedDates || completedDates.length === 0) return 0

  const today = new Date(currentDate)
  today.setHours(0, 0, 0, 0)

  let streak = 0
  let checkDate = new Date(today)

  while (true) {
    const dateKey = checkDate.toISOString().split('T')[0]
    if (completedDates.some((d) => d === dateKey)) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

// Calculate longest streak from all completed dates
function calculateLongestStreak(completedDates) {
  if (!completedDates || completedDates.length === 0) return 0

  const sortedDates = completedDates.map((d) => new Date(d)).sort((a, b) => a - b) // Sort from oldest to newest

  let longestStreak = 0
  let currentStreak = 0
  let previousDate = null

  for (const date of sortedDates) {
    if (previousDate === null) {
      currentStreak = 1
    } else {
      const daysDiff = Math.floor((date - previousDate) / (1000 * 60 * 60 * 24))
      if (daysDiff === 1) {
        // Consecutive day
        currentStreak++
      } else {
        // Gap in streak, reset
        longestStreak = Math.max(longestStreak, currentStreak)
        currentStreak = 1
      }
    }
    previousDate = date
  }

  // Check final streak
  longestStreak = Math.max(longestStreak, currentStreak)
  return longestStreak
}

// Get habit categories
export const habitCategories = [
  'Health & Fitness',
  'Learning & Education',
  'Productivity',
  'Mindfulness',
  'Relationships',
  'Finance',
  'Creativity',
  'Other',
]

// Get habit icons
export const habitIcons = [
  // Health & Fitness
  '🏃‍♂️',
  '🧘‍♀️',
  '💪',
  '🚴‍♂️',
  '🏋️‍♂️',
  '🧘‍♂️',
  '🏊‍♀️',
  '⚽',
  '🏀',
  '🎾',
  '🏓',
  '🏸',
  '🥊',
  '🥋',
  '🧗‍♀️',
  '🏃‍♀️',
  '🚶‍♂️',
  '🚴‍♀️',
  '🏊‍♂️',

  // Learning & Education
  '📚',
  '💻',
  '🧠',
  '✍️',
  '📝',
  '📖',
  '🎓',
  '🔬',
  '🧪',
  '📊',
  '📈',
  '📉',
  '🔍',
  '💡',
  '🎯',
  '📱',
  '⌨️',
  '🖥️',
  '📷',
  '🎥',
  '🎬',
  '🎭',
  '🎨',

  // Productivity & Work
  '⚡',
  '🚀',
  '💼',
  '📋',
  '✅',
  '📅',
  '⏰',
  '⏳',
  '🎪',
  '🏆',
  '🥇',
  '🥈',
  '🥉',
  '💎',
  '🌟',
  '⭐',
  '🔥',
  '💫',
  '✨',
  '🎊',
  '🎉',
  '🎈',
  '🎁',
  '🎀',

  // Mindfulness & Wellness
  '🌿',
  '🌸',
  '🌺',
  '🌻',
  '🌼',
  '🌷',
  '🌹',
  '🌱',
  '🌲',
  '🌳',
  '🌴',
  '🌵',
  '🌾',
  '☘️',
  '🍀',
  '🌍',
  '🌎',
  '🌏',
  '🌕',
  '🌖',
  '🌗',
  '🌘',

  // Relationships & Social
  '❤️',
  '💕',
  '💖',
  '💗',
  '💘',
  '💙',
  '💚',
  '💛',
  '💜',
  '🖤',
  '🤍',
  '🤎',
  '💔',
  '💞',
  '💟',
  '💌',
  '💋',
  '💍',
  '💐',

  // Finance & Money
  '💰',
  '💵',
  '💸',
  '💳',
  '🏦',
  '🔒',
  '🔓',

  // Creativity & Arts
  '🎵',
  '🎶',
  '🎤',
  '🎧',
  '🎹',
  '🎸',
  '🎷',
  '🎺',
  '🥁',
  '🎻',
  '🎼',

  // Food & Nutrition
  '🍎',
  '🍊',
  '🍋',
  '🍌',
  '🍉',
  '🍇',
  '🍓',
  '🫐',
  '🍒',
  '🍑',
  '🥭',
  '🍍',
  '🥥',
  '🥝',
  '🍅',
  '🥑',
  '🥦',
  '🥬',
  '🥒',
  '🌶️',
  '🌽',
  '🥕',
  '🥔',
  '🍠',
  '🥐',

  // Technology & Digital
  '🖨️',
  '📹',
  '📺',
  '📻',
  '🎙️',
  '🎚️',
  '🎛️',
  '📡',
  '🔌',
  '🔋',
  '🔦',
  '🕯️',
  '🪔',
  '🧯',
  '🛢️',

  // Nature & Environment
  '🌑',
  '🌒',
  '🌓',
  '🌔',
  '🌙',
  '🌞',
  '☄️',
  '🌠',
  '🌌',
  '🌉',
  '🌃',
  '🌆',
  '🌇',
  '🌅',

  // Sports & Activities
  '🏈',
  '⚾',
  '🥎',
  '🏐',
  '🏉',
  '🥏',
  '🎱',
  '🏒',
  '🏑',
  '🥍',
  '🏏',
  '🥅',
  '⛳',
  '🏌️‍♂️',
  '🏌️‍♀️',
  '🚣‍♂️',
  '🚣‍♀️',
  '🏄‍♂️',

  // Travel & Adventure
  '✈️',
  '🚁',
  '🚂',
  '🚃',
  '🚄',
  '🚅',
  '🚆',
  '🚇',
  '🚈',
  '🚉',
  '🚊',
  '🚝',
  '🚞',
  '🚋',
  '🚌',
  '🚍',
  '🚎',
  '🚐',
  '🚑',
  '🚒',
  '🚓',
  '🚔',
  '🚕',
  '🚖',
  '🚗',

  // Home & Lifestyle
  '🏠',
  '🏡',
  '🏘️',
  '🏚️',
  '🏗️',
  '🏭',
  '🏢',
  '🏬',
  '🏣',
  '🏤',
  '🏥',
  '🏨',
  '🏩',
  '🏪',
  '🏫',
  '🏰',
  '💒',
  '🗼',
  '🗽',
  '⛪',
  '🕌',
  '🛕',
  '🕍',
  '⛩️',

  // Emotions & Expressions
  '😀',
  '😃',
  '😄',
  '😁',
  '😆',
  '😅',
  '😂',
  '🤣',
  '😊',
  '😇',
  '🙂',
  '🙃',
  '😉',
  '😌',
  '😍',
  '🥰',
  '😘',
  '😗',
  '😙',
  '😚',
  '😋',
  '😛',
  '😝',
  '😜',
  '🤪',

  // Objects & Tools
  '🔧',
  '🔨',
  '⚒️',
  '🛠️',
  '⛏️',
  '🔩',
  '⚙️',
  '🧱',
  '⛓️',
  '🧲',
  '🔫',
  '💣',
  '🧨',
  '🪓',
  '🔪',
  '🗡️',
  '⚔️',
  '🛡️',
  '🚬',
  '⚰️',
  '⚱️',
  '🏺',
  '🔮',
  '📿',
  '🧿',

  // Symbols & Shapes
  '🧡',
  '❣️',
  '☮️',
  '✝️',
  '☪️',
  '🕉️',
  '☸️',
  '✡️',
]

export function subscribeToHabits(userId, callback) {
  try {
    // Check if userId is provided and valid
    if (!userId) {
      console.log('No userId provided for habits subscription')
      return () => {}
    }

    const habitsRef = collection(firestore, 'habits')
    const q = query(habitsRef, where('userId', '==', userId))

    return onSnapshot(
      q,
      (querySnapshot) => {
        const habits = []
        querySnapshot.forEach((doc) => {
          habits.push({
            id: doc.id,
            ...doc.data(),
          })
        })

        // Sort client-side
        habits.sort((a, b) => {
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category)
          }
          return a.name.localeCompare(b.name)
        })

        callback(habits)
      },
      (error) => {
        console.error('Error in habits subscription:', error)
      }
    )
  } catch (error) {
    console.error('Error setting up habits subscription:', error)
    return () => {}
  }
}
