'use client'

import {
  collection, doc, addDoc, updateDoc, deleteDoc, query, where, onSnapshot, serverTimestamp, getDocs, getDoc
} from 'firebase/firestore'
import { firestore, auth } from './firebaseClient'

const eventsCol = () => collection(firestore, 'events')

export async function createEvent(eventData) {
  const user = auth?.currentUser
  if (!user) {
    throw new Error('User must be authenticated to create events')
  }

  const docRef = await addDoc(eventsCol(), {
    ...eventData,
    userId: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })

  return { id: docRef.id, ...eventData }
}

export async function getEvents(userId) {
  try {
    const user = auth?.currentUser
    if (!user) throw new Error('User must be authenticated to fetch events')

    const eventsRef = collection(firestore, 'events')
    const q = query(
      eventsRef,
      where('userId', '==', userId)
    )
    
    const querySnapshot = await getDocs(q)
    const events = []
    
    querySnapshot.forEach((doc) => {
      events.push({
        id: doc.id,
        ...doc.data()
      })
    })

    return events
  } catch (error) {
    console.error('Error fetching events:', error)
    throw error
  }
}

export async function updateEvent(eventId, updates) {
  const user = auth?.currentUser
  if (!user) {
    throw new Error('User must be authenticated to update events')
  }

  const eventRef = doc(firestore, 'events', eventId)
  const eventDoc = await getDoc(eventRef)
  
  if (!eventDoc.exists()) {
    throw new Error('Event not found')
  }

  const event = eventDoc.data()
  if (event.userId !== user.uid) {
    throw new Error('You can only update your own events')
  }

  await updateDoc(eventRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })
}

export async function deleteEvent(eventId) {
  const user = auth?.currentUser
  if (!user) {
    throw new Error('User must be authenticated to delete events')
  }

  const eventRef = doc(firestore, 'events', eventId)
  const eventDoc = await getDoc(eventRef)
  
  if (!eventDoc.exists()) {
    throw new Error('Event not found')
  }

  const event = eventDoc.data()
  if (event.userId !== user.uid) {
    throw new Error('You can only delete your own events')
  }

  await deleteDoc(eventRef)
}

export async function clearEventsForDate(userId, date) {
  const user = auth?.currentUser
  if (!user) {
    throw new Error('User must be authenticated to clear events')
  }

  const eventsRef = collection(firestore, 'events')
  const q = query(
    eventsRef,
    where('userId', '==', userId),
    where('date', '==', date)
  )
  
  const querySnapshot = await getDocs(q)
  const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref))
  
  await Promise.all(deletePromises)
}

export function subscribeToEvents(userId, callback) {
  try {
    const user = auth?.currentUser
    if (!user) {
      console.error('User must be authenticated to subscribe to events')
      return () => {}
    }

    const eventsRef = collection(firestore, 'events')
    const q = query(
      eventsRef,
      where('userId', '==', userId)
    )
    
    return onSnapshot(q, (querySnapshot) => {
      const events = []
      querySnapshot.forEach((doc) => {
        events.push({
          id: doc.id,
          ...doc.data()
        })
      })

      callback(events)
    }, (error) => {
      console.error('Error in events subscription:', error)
    })
  } catch (error) {
    console.error('Error setting up events subscription:', error)
    return () => {}
  }
}
