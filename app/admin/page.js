'use client'
import AppShell from '@/components/AppShell'
import { useRequireAuth } from '@/utils/protectedRoute'
import { useEffect, useState } from 'react'
import { firestore } from '@/lib/firebaseClient'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import Button from '@/components/Button'

const COLOR_KEYS = [
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
]

export default function AdminPage() {
  const { user, loading } = useRequireAuth()
  const [theme, setTheme] = useState({})
  const [app, setApp] = useState({ habitDefault: 40, habitGoal: 100 })
  const [allowed, setAllowed] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    async function init() {
      if (!user) return
      const adminDoc = await getDoc(doc(firestore, 'admins', user.uid))
      setAllowed(adminDoc.exists())
      const themeSnap = await getDoc(doc(firestore, 'settings', 'theme'))
      if (themeSnap.exists()) setTheme(themeSnap.data())
      const appSnap = await getDoc(doc(firestore, 'settings', 'app'))
      if (appSnap.exists()) setApp((prev) => ({ ...prev, ...appSnap.data() }))
    }
    init()
  }, [user])

  if (loading || !user) return null

  async function save() {
    try {
      setBusy(true)
      await setDoc(doc(firestore, 'settings', 'theme'), theme, { merge: true })
      await setDoc(doc(firestore, 'settings', 'app'), app, { merge: true })
      alert('Saved!')
    } catch (e) {
      console.error(e)
      alert('Save failed')
    } finally {
      setBusy(false)
    }
  }

  if (!allowed) {
    return (
      <AppShell>
        <div className="bg-card border border-border rounded-lg p-6">Access denied</div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-card border border-border rounded-lg p-4 shadow-soft">
          <h2 className="font-semibold mb-3">Theme</h2>
          <div className="grid grid-cols-2 gap-3">
            {COLOR_KEYS.map((k) => (
              <div key={k} className="flex items-center gap-3">
                <label className="w-32 text-sm text-neutral-700">{k}</label>
                <input
                  type="color"
                  value={theme?.[k] || ''}
                  onChange={(e) => setTheme((t) => ({ ...t, [k]: e.target.value }))}
                  className="h-8 w-12"
                />
                <input
                  type="text"
                  value={theme?.[k] || ''}
                  onChange={(e) => setTheme((t) => ({ ...t, [k]: e.target.value }))}
                  className="flex-1 border border-border rounded-md px-2 py-1 text-sm"
                />
              </div>
            ))}
            <div className="flex items-center gap-3">
              <label className="w-32 text-sm text-neutral-700">radius-md</label>
              <input
                type="text"
                value={theme?.['radius-md'] || ''}
                onChange={(e) => setTheme((t) => ({ ...t, ['radius-md']: e.target.value }))}
                className="flex-1 border border-border rounded-md px-2 py-1 text-sm"
                placeholder="8px"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="w-32 text-sm text-neutral-700">radius-lg</label>
              <input
                type="text"
                value={theme?.['radius-lg'] || ''}
                onChange={(e) => setTheme((t) => ({ ...t, ['radius-lg']: e.target.value }))}
                className="flex-1 border border-border rounded-md px-2 py-1 text-sm"
                placeholder="12px"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="w-32 text-sm text-neutral-700">soft-shadow</label>
              <input
                type="text"
                value={theme?.['soft-shadow'] || ''}
                onChange={(e) => setTheme((t) => ({ ...t, ['soft-shadow']: e.target.value }))}
                className="flex-1 border border-border rounded-md px-2 py-1 text-sm"
                placeholder="0 6px 18px rgba(12,15,20,0.06)"
              />
            </div>
          </div>
        </section>

        <section className="bg-card border border-border rounded-lg p-4 shadow-soft">
          <h2 className="font-semibold mb-3">App Settings</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="w-48 text-sm text-neutral-700">Default habit streak</label>
              <input
                type="number"
                value={app.habitDefault}
                onChange={(e) =>
                  setApp((a) => ({ ...a, habitDefault: Number(e.target.value || 0) }))
                }
                className="border border-border rounded-md px-2 py-1 text-sm w-24"
              />
              <span className="text-neutral-700">/</span>
              <input
                type="number"
                value={app.habitGoal}
                onChange={(e) => setApp((a) => ({ ...a, habitGoal: Number(e.target.value || 0) }))}
                className="border border-border rounded-md px-2 py-1 text-sm w-24"
              />
            </div>
          </div>
        </section>
      </div>
      <div className="mt-4">
        <Button variant="primary" onClick={save} disabled={busy}>
          {busy ? 'Saving...' : 'Save to Firestore'}
        </Button>
      </div>
    </AppShell>
  )
}
