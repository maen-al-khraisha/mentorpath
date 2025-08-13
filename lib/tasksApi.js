'use client'

import { firestore, auth } from '@/lib/firebaseClient'
import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
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

export function dayKey(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10) // YYYY-MM-DD
}

export function listenTasksByDate(date, userId, cb) {
  if (!userId) {
    console.warn('listenTasksByDate: userId is required')
    cb([])
    return () => {}
  }

  console.log('listenTasksByDate: Starting listener for', { date, userId, dateKey: dayKey(date) })

  const dk = dayKey(date)
  const q = query(tasksCol(), where('ownerId', '==', userId), where('dateKey', '==', dk))
  return onSnapshot(
    q,
    (snap) => {
      console.log('listenTasksByDate: Success, got', snap.size, 'tasks')
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

export async function createTask(input) {
  const user = auth?.currentUser
  if (!user) {
    throw new Error('User must be authenticated to create tasks')
  }

  const data = {
    title: input.title,
    description: input.description || '',
    date: input.date || new Date(),
    dateKey: dayKey(input.date || new Date()),
    priority: input.priority || 'Medium',
    labels: input.labels || [],
    checklist: input.checklist || [],
    completed: false,
    ownerId: user.uid,
    originalDate: input.date || new Date(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    attachments: [],
  }
  const refDoc = await addDoc(tasksCol(), data)
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

export async function deleteTask(id) {
  await deleteDoc(doc(firestore, 'tasks', id))
}

export async function addAttachment(taskId, file) {
  // Uploads are disabled. This function intentionally errors to signal the UI.
  throw new Error('File uploads are disabled in this deployment.')
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
  const fromDate = currentDate || new Date()
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
