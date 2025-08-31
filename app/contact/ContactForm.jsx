'use client'

import { useState } from 'react'
import { firestore } from '@/lib/firebaseClient'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import Button from '@/components/Button'

export default function ContactForm() {
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
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            className="block text-sm font-medium text-[var(--neutral-700)] mb-2"
            htmlFor="name"
          >
            Name
          </label>
          <input
            id="name"
            className="w-full h-12 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          {errors.name && <div className="text-[var(--danger)] text-sm mt-1">{errors.name}</div>}
        </div>
        <div>
          <label
            className="block text-sm font-medium text-[var(--neutral-700)] mb-2"
            htmlFor="email"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full h-12 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
          {errors.email && <div className="text-[var(--danger)] text-sm mt-1">{errors.email}</div>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--neutral-700)] mb-2" htmlFor="type">
          Type
        </label>
        <select
          id="type"
          className="w-full h-12 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={form.type}
          onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
        >
          <option value="suggestion">Suggestion</option>
          <option value="complaint">Complaint</option>
          <option value="question">Question</option>
          <option value="feedback">General Feedback</option>
        </select>
      </div>

      <div>
        <label
          className="block text-sm font-medium text-[var(--neutral-700)] mb-2"
          htmlFor="message"
        >
          Message
        </label>
        <textarea
          id="message"
          rows={6}
          className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          required
          placeholder="Tell us what's on your mind..."
        />
        {errors.message && (
          <div className="text-[var(--danger)] text-sm mt-1">{errors.message}</div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" variant="primary" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Sending…' : 'Send Message'}
        </Button>
        {status === 'success' && (
          <span role="status" className="text-sm text-green-600 font-medium">
            ✓ Thanks! We received your message.
          </span>
        )}
        {status === 'error' && (
          <span role="alert" className="text-sm text-[var(--danger)] font-medium">
            ✗ Something went wrong. Try again.
          </span>
        )}
      </div>
    </form>
  )
}
