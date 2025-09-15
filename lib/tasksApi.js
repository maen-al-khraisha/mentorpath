'use client'

import { firestore, auth } from '@/lib/firebaseClient'
import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
// Supabase upload via Next API route (private bucket)

// Firestore collections
const tasksCol = () => collection(firestore, 'tasks')
const workSessionsCol = () => collection(firestore, 'taskWorkSessions')
const shiftsCol = () => collection(firestore, 'taskShifts')

function normalizeDate(input) {
  if (!input) return new Date()
  if (input instanceof Date) return input
  // Firestore Timestamp has toDate
  if (typeof input === 'object' && typeof input.toDate === 'function') {
    try {
      return input.toDate()
    } catch {
      return new Date()
    }
  }
  // Numeric timestamp (ms) or string
  const d = new Date(input)
  if (isNaN(d.getTime())) return new Date()
  return d
}

export function dayKey(date) {
  const d = normalizeDate(date)
  // Use local date parts to avoid UTC shifting across days
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function listenTasksByDate(date, userId, cb) {
  if (!userId) {
    console.warn('listenTasksByDate: userId is required')
    cb([])
    return () => {}
  }

  const dk = dayKey(date)
  const q = query(tasksCol(), where('ownerId', '==', userId), where('dateKey', '==', dk))
  return onSnapshot(
    q,
    (snap) => {
      const items = []
      snap.forEach((d) => items.push({ id: d.id, ...d.data() }))
      cb(items)
    },
    (err) => {
      console.error('listenTasksByDate error - Full details:', {
        code: err.code,
        message: err.message,
        details: err.details,
        userId,
        dateKey: dk,
      })
      cb([])
    }
  )
}

export function listenWorkSessionsByDate(date, userId, cb) {
  const dk = dayKey(date)
  const qy = query(
    workSessionsCol(),
    where('userId', '==', userId || null),
    where('dateKey', '==', dk)
  )
  return onSnapshot(qy, (snap) => {
    const items = []
    snap.forEach((d) => items.push({ id: d.id, ...d.data() }))
    cb(items)
  })
}

export function subscribeToTasks(userId, callback) {
  try {
    // Check if userId is provided and valid
    if (!userId) {
      return () => {}
    }

    const tasksRef = collection(firestore, 'tasks')
    const q = query(tasksRef, where('ownerId', '==', userId))

    return onSnapshot(
      q,
      (querySnapshot) => {
        const tasks = []
        querySnapshot.forEach((doc) => {
          tasks.push({
            id: doc.id,
            ...doc.data(),
          })
        })

        callback(tasks)
      },
      (error) => {
        console.error('Error in tasks subscription:', error)
      }
    )
  } catch (error) {
    console.error('Error setting up tasks subscription:', error)
    return () => {}
  }
}

// Get all tasks for a user (for usage counting)
export async function getTasks(userId) {
  if (!userId) {
    throw new Error('getTasks: userId is required')
  }

  const tasksRef = collection(firestore, 'tasks')
  const q = query(tasksRef, where('ownerId', '==', userId))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}

export async function createTask(input) {
  const user = auth?.currentUser
  if (!user) {
    throw new Error('User must be authenticated to create tasks')
  }

  // Check if user can create tasks based on their plan
  const { canPerformAction } = await import('./subscriptionApi')
  const canCreate = await canPerformAction(user.uid, 'tasks')

  if (!canCreate) {
    throw new Error(
      'You have reached your task limit for this month. Please upgrade to Pro for unlimited tasks.'
    )
  }

  const data = {
    title: input.title,
    description: input.description || '',
    date: normalizeDate(input.date || new Date()),
    dateKey: dayKey(input.date || new Date()),
    priority: input.priority || 'Medium',
    labels: input.labels || [],
    checklist: input.checklist || [],
    completed: false,
    ownerId: user.uid,
    originalDate: normalizeDate(input.date || new Date()),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    attachments: [],
  }

  const refDoc = await addDoc(tasksCol(), data)

  // Increment usage for tasks
  const { incrementUsage } = await import('./subscriptionApi')
  try {
    await incrementUsage(user.uid, 'tasks')
  } catch (error) {
    console.error('Failed to increment usage (non-critical):', error)
    // Don't throw error as task was created successfully
  }

  return refDoc.id
}

export async function updateTask(id, patch) {
  const user = auth?.currentUser
  if (!user) {
    throw new Error('User must be authenticated to update tasks')
  }
  await updateDoc(doc(firestore, 'tasks', id), { ...patch, updatedAt: serverTimestamp() })
}

export async function toggleTaskCompleted(id, completed) {
  await updateTask(id, { completed: !!completed })
}

export async function deleteTask(id, userId = 'current-user') {
  await deleteDoc(doc(firestore, 'tasks', id))

  // Decrement usage count when deleting a task
  try {
    const { decrementUsage } = await import('./subscriptionApi')
    await decrementUsage(userId, 'tasks')
  } catch (error) {
    // Don't fail the deletion if usage tracking fails
    console.error('Failed to decrement usage for task deletion:', error)
  }
}

export async function addAttachment(taskId, file) {
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY
  const authEndpoint = '/api/imagekit/auth'

  if (!urlEndpoint || !publicKey) {
    throw new Error('Image uploads not configured. Missing ImageKit keys.')
  }

  // Get signature from server
  const authRes = await fetch(authEndpoint, { method: 'GET' })
  if (!authRes.ok) {
    const data = await authRes.json().catch(() => ({}))
    throw new Error(data?.error || 'Failed to get upload signature')
  }
  const { token, expire, signature } = await authRes.json()
  if (!token || !expire || !signature) {
    throw new Error('Invalid upload signature response')
  }

  // Build upload request to ImageKit upload API
  const uploadUrl = 'https://upload.imagekit.io/api/v1/files/upload'
  const form = new FormData()
  form.append('file', file)
  form.append('fileName', file.name || 'upload')
  form.append('token', token)
  form.append('expire', String(expire))
  form.append('signature', signature)
  form.append('publicKey', publicKey)
  // Optional folder organization by task
  form.append('folder', `/tasks/${taskId}`)

  const uploadRes = await fetch(uploadUrl, {
    method: 'POST',
    body: form,
  })
  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => ({}))
    throw new Error(err?.message || err?.error || 'Upload failed')
  }
  const data = await uploadRes.json()

  const url = data?.url || `${urlEndpoint}${data?.filePath || ''}`
  const path = data?.filePath || data?.fileId || null

  await updateDoc(doc(firestore, 'tasks', taskId), {
    attachments: arrayUnion({ name: file.name, path, url }),
    updatedAt: serverTimestamp(),
  })

  return url
}

export async function removeAttachment(taskId, attachmentToRemove) {
  const user = auth?.currentUser
  if (!user) {
    throw new Error('User must be authenticated to remove attachments')
  }

  // Get current task to find the attachment
  const taskDoc = await getDoc(doc(firestore, 'tasks', taskId))
  if (!taskDoc.exists()) {
    throw new Error('Task not found')
  }

  const task = taskDoc.data()
  const currentAttachments = task.attachments || []

  // Filter out the attachment to remove
  const updatedAttachments = currentAttachments.filter(
    (attachment) =>
      !(attachment.name === attachmentToRemove.name && attachment.url === attachmentToRemove.url)
  )

  // Update the task with the new attachments array
  await updateDoc(doc(firestore, 'tasks', taskId), {
    attachments: updatedAttachments,
    updatedAt: serverTimestamp(),
  })
}

// Work sessions (timers)
export async function startWorkSession(taskId) {
  const user = auth?.currentUser
  if (!user) {
    throw new Error('User must be authenticated to start work sessions')
  }
  return await addDoc(workSessionsCol(), {
    taskId,
    userId: user.uid,
    startAt: serverTimestamp(),
    endAt: null,
    durationSec: null,
    dateKey: dayKey(new Date()),
  })
}

export async function stopWorkSession(sessionId) {
  const user = auth?.currentUser
  if (!user) {
    throw new Error('User must be authenticated to stop work sessions')
  }
  // We cannot compute duration server-side without serverTimestamp diff. Client computes.
  const end = new Date()
  await updateDoc(doc(firestore, 'taskWorkSessions', sessionId), {
    endAt: end,
    updatedAt: serverTimestamp(),
  })
}

// Shifts
export async function shiftTaskToTomorrow(taskId, currentDate, reason) {
  const user = auth?.currentUser
  if (!user) {
    throw new Error('User must be authenticated to shift tasks')
  }
  const fromDate = normalizeDate(currentDate || new Date())
  const toDate = new Date(fromDate)
  toDate.setDate(toDate.getDate() + 1)
  await updateTask(taskId, { date: toDate, dateKey: dayKey(toDate) })
  await addDoc(shiftsCol(), {
    taskId,
    userId: user.uid,
    fromDate,
    toDate,
    reason: reason || '',
    createdAt: serverTimestamp(),
  })
}

export async function shiftTaskToDate(taskId, targetDate, reason) {
  const user = auth?.currentUser
  if (!user) {
    throw new Error('User must be authenticated to shift tasks')
  }
  const toDate = normalizeDate(targetDate || new Date())
  const fromDate = new Date()
  await updateTask(taskId, { date: toDate, dateKey: dayKey(toDate) })
  await addDoc(shiftsCol(), {
    taskId,
    userId: user.uid,
    fromDate,
    toDate,
    reason: reason || '',
    createdAt: serverTimestamp(),
  })
}

export async function addManualWorkSession(taskId, startAtInput, endAtInput) {
  const user = auth?.currentUser
  if (!user) {
    throw new Error('User must be authenticated to add work sessions')
  }
  const startAt = normalizeDate(startAtInput)
  const endAt = normalizeDate(endAtInput)
  if (!(startAt instanceof Date) || isNaN(startAt) || !(endAt instanceof Date) || isNaN(endAt)) {
    throw new Error('Invalid start or end time')
  }
  if (endAt <= startAt) {
    throw new Error('End time must be after start time')
  }
  const durationSec = Math.max(0, Math.floor((endAt.getTime() - startAt.getTime()) / 1000))
  await addDoc(workSessionsCol(), {
    taskId,
    userId: user.uid,
    startAt,
    endAt,
    durationSec,
    dateKey: dayKey(startAt),
    createdAt: serverTimestamp(),
  })
}
