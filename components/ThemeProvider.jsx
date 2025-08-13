'use client'
import { useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { firestore } from '@/lib/firebaseClient'

const THEME_KEYS = [
  'primary',
  'accent',
  'danger',
  'neutral-900',
  'neutral-700',
  'page',
  'card',
  'border',
  'muted1',
  'muted2',
  'radius-md',
  'radius-lg',
  'soft-shadow',
]

export default function ThemeProvider() {
  useEffect(() => {
    if (!firestore) return
    const ref = doc(firestore, 'settings', 'theme')
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.data()
      if (!data) return
      for (const key of THEME_KEYS) {
        if (key in data) {
          document.documentElement.style.setProperty(`--${key}`, data[key])
        }
      }
    })
    return () => unsub()
  }, [])

  return null
}
