'use client'

import { useState } from 'react'
import { firestore } from '@/lib/firebaseClient'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import Button from '@/components/Button'
import Logo from '@/components/Logo'

export default function FooterLanding() {
  const [form, setForm] = useState({ name: '', email: '', type: 'suggestion', message: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email'
    if (!form.message.trim()) e.message = 'Please enter a message'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setStatus('submitting')
    try {
      if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true' || !firestore) {
        // Mock success
        await new Promise((r) => setTimeout(r, 600))
      } else {
        await addDoc(collection(firestore, 'feedback'), {
          ...form,
          createdAt: serverTimestamp(),
        })
      }
      setForm({ name: '', email: '', type: 'suggestion', message: '' })
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2000)
      // TODO: Integrate email notifications (e.g., SendGrid) on new feedback
    } catch (err) {
      console.error(err)
      setStatus('error')
      setTimeout(() => setStatus('idle'), 2500)
    }
  }

  return (
    <footer className="mt-12 border-t border-[var(--border)] bg-[var(--bg-card)]">
      <div className="mx-auto max-w-6xl px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center gap-2">
            <Logo size="sm" showText={true} animated={false} />
          </div>
          <p className="mt-3 text-sm text-[var(--neutral-700)] max-w-md">
            Built for mentors and makers. We care about momentum and clarity.
          </p>
          <ul className="mt-4 text-sm text-[var(--neutral-700)] space-y-1">
            <li>
              <a href="/login" className="hover:underline">
                Sign in
              </a>
            </li>
            <li>
              <a href="/dashboard" className="hover:underline">
                Dashboard
              </a>
            </li>
            <li>
              <a href="/admin" className="hover:underline">
                Admin
              </a>
            </li>
            <li>
              <a href="/terms" className="hover:underline">
                Terms & Conditions
              </a>
            </li>
          </ul>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4 shadow-soft"
        >
          <h3 className="text-lg font-semibold text-[var(--neutral-900)]">Contact us</h3>
          <p className="text-sm text-[var(--neutral-700)] mb-3">
            Suggestions or complaints welcome.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--neutral-700)] mb-1" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                className="w-full h-10 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-3 text-sm"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
              {errors.name && (
                <div className="text-[var(--danger)] text-xs mt-1">{errors.name}</div>
              )}
            </div>
            <div>
              <label className="block text-xs text-[var(--neutral-700)] mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full h-10 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-3 text-sm"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
              {errors.email && (
                <div className="text-[var(--danger)] text-xs mt-1">{errors.email}</div>
              )}
            </div>
            <div>
              <label className="block text-xs text-[var(--neutral-700)] mb-1" htmlFor="type">
                Type
              </label>
              <select
                id="type"
                className="w-full h-10 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-3 text-sm"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              >
                <option value="suggestion">Suggestion</option>
                <option value="complaint">Complaint</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-[var(--neutral-700)] mb-1" htmlFor="message">
                Message
              </label>
              <textarea
                id="message"
                rows={4}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm"
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                required
              />
              {errors.message && (
                <div className="text-[var(--danger)] text-xs mt-1">{errors.message}</div>
              )}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button type="submit" variant="primary" disabled={status === 'submitting'}>
              {status === 'submitting' ? 'Sending…' : 'Send feedback'}
            </Button>
            {status === 'success' && (
              <span role="status" className="text-sm text-[var(--neutral-700)]">
                Thanks! We received your message.
              </span>
            )}
            {status === 'error' && (
              <span role="alert" className="text-sm text-[var(--danger)]">
                Something went wrong. Try again.
              </span>
            )}
          </div>
        </form>
      </div>
      <div className="text-center pb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Logo size="sm" showText={false} animated={false} />
          <span className="text-[11px] text-[var(--neutral-700)]">MentorPath</span>
        </div>
        <div className="text-[11px] text-[var(--neutral-700)]">
          © {new Date().getFullYear()} All rights reserved
        </div>
      </div>
    </footer>
  )
}
