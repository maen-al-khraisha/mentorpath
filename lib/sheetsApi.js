'use client'

import { firestore, auth } from '@/lib/firebaseClient'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  getDocs,
  getDoc,
} from 'firebase/firestore'

const sheetsCol = () => collection(firestore, 'sheets')

export async function createSheet(sheetData) {
  const user = auth?.currentUser
  if (!user) {
    throw new Error('User must be authenticated to create sheets')
  }

  // Check if user can create sheets based on their plan
  const { canPerformAction } = await import('./subscriptionApi')
  const canCreate = await canPerformAction(user.uid, 'sheets')

  if (!canCreate) {
    throw new Error(
      'You have reached your agenda limit. Please upgrade to Pro for unlimited agenda sheets.'
    )
  }

  const sheet = {
    ...sheetData,
    userId: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    rows: [], // Start with empty rows
    isActive: true, // Mark as active (similar to habits)
  }

  const docRef = await addDoc(sheetsCol(), sheet)

  // Don't increment usage for sheets (they are total active, not monthly)
  // Similar to habits - we count total active sheets, not monthly usage

  return { id: docRef.id, ...sheet }
}

export async function getSheets(userId) {
  const q = query(sheetsCol(), where('userId', '==', userId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}

export async function updateSheet(sheetId, updates) {
  const user = auth?.currentUser
  if (!user) {
    throw new Error('User must be authenticated to update sheets')
  }

  await updateDoc(doc(firestore, 'sheets', sheetId), {
    ...updates,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteSheet(sheetId) {
  const user = auth?.currentUser
  if (!user) {
    throw new Error('User must be authenticated to delete sheets')
  }

  await deleteDoc(doc(firestore, 'sheets', sheetId))
}

export async function addRowToSheet(sheetId, rowData) {
  const user = auth?.currentUser
  if (!user) {
    throw new Error('User must be authenticated to add rows')
  }

  const sheetRef = doc(firestore, 'sheets', sheetId)
  const sheetDoc = await getDoc(sheetRef)

  if (!sheetDoc.exists()) {
    throw new Error('Sheet not found')
  }

  const sheet = sheetDoc.data()
  if (sheet.userId !== user.uid) {
    throw new Error('You can only add rows to your own sheets')
  }

  const newRow = {
    id: Date.now().toString(), // Simple ID for now
    data: rowData,
    createdAt: new Date().toISOString(), // Use client timestamp instead of serverTimestamp
  }

  const updatedRows = [...(sheet.rows || []), newRow]

  await updateDoc(sheetRef, {
    rows: updatedRows,
    updatedAt: serverTimestamp(),
  })

  return newRow
}

export async function updateRowInSheet(sheetId, rowId, rowData) {
  const user = auth?.currentUser
  if (!user) {
    throw new Error('User must be authenticated to update rows')
  }

  const sheetRef = doc(firestore, 'sheets', sheetId)
  const sheetDoc = await getDoc(sheetRef)

  if (!sheetDoc.exists()) {
    throw new Error('Sheet not found')
  }

  const sheet = sheetDoc.data()
  if (sheet.userId !== user.uid) {
    throw new Error('You can only update rows in your own sheets')
  }

  const updatedRows = (sheet.rows || []).map((row) =>
    row.id === rowId ? { ...row, data: rowData, updatedAt: new Date().toISOString() } : row
  )

  await updateDoc(sheetRef, {
    rows: updatedRows,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteRowFromSheet(sheetId, rowId) {
  const user = auth?.currentUser
  if (!user) {
    throw new Error('User must be authenticated to delete rows')
  }

  const sheetRef = doc(firestore, 'sheets', sheetId)
  const sheetDoc = await getDoc(sheetRef)

  if (!sheetDoc.exists()) {
    throw new Error('Sheet not found')
  }

  const sheet = sheetDoc.data()
  if (sheet.userId !== user.uid) {
    throw new Error('You can only delete rows from your own sheets')
  }

  const updatedRows = (sheet.rows || []).filter((row) => row.id !== rowId)

  await updateDoc(sheetRef, {
    rows: updatedRows,
    updatedAt: serverTimestamp(),
  })
}

export function subscribeToSheets(userId, callback) {
  try {
    // Check if userId is provided and valid
    if (!userId) {
      return () => {}
    }

    const sheetsRef = collection(firestore, 'sheets')
    const q = query(sheetsRef, where('userId', '==', userId))

    return onSnapshot(
      q,
      (querySnapshot) => {
        const sheets = []
        querySnapshot.forEach((doc) => {
          sheets.push({
            id: doc.id,
            ...doc.data(),
          })
        })

        callback(sheets)
      },
      (error) => {
        console.error('Error in sheets subscription:', error)
      }
    )
  } catch (error) {
    console.error('Error setting up sheets subscription:', error)
    return () => {}
  }
}
