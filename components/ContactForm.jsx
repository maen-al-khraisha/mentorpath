'use client'

import { useState } from 'react'
import { firestore } from '../lib/firebaseClient'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import Button from './Button'

export default function ContactForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    type: 'suggestion',
    message: '',
  })
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
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err) {
      console.error(err)
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Form Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Send us a message</h2>
        <p className="text-gray-600">We'll get back to you as soon as possible.</p>
      </div>

      {/* Name and Email Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="name">
            Full Name *
          </label>
          <input
            id="name"
            type="text"
            className={`w-full h-12 rounded-xl border-2 px-4 text-gray-900 transition-colors ${
              errors.name
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:bg-white'
                : 'border-gray-200 focus:border-blue-500 focus:bg-white'
            }`}
            value={form.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter your full name"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            className={`w-full h-12 rounded-xl border-2 px-4 text-gray-900 transition-colors ${
              errors.email
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:bg-white'
                : 'border-gray-200 focus:border-blue-500 focus:bg-white'
            }`}
            value={form.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter your email address"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>
      </div>

      {/* Message Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Message Type</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { value: 'suggestion', label: 'Suggestion', emoji: '💡' },
            { value: 'complaint', label: 'Complaint', emoji: '⚠️' },
            { value: 'question', label: 'Question', emoji: '❓' },
          ].map((type) => (
            <label
              key={type.value}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                form.type === type.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="type"
                value={type.value}
                className="sr-only"
                onChange={() => handleInputChange('type', type.value)}
                checked={form.type === type.value}
              />
              <span className="text-lg">{type.emoji}</span>
              <span className="font-medium">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="message">
          Message *
        </label>
        <textarea
          id="message"
          rows={6}
          className={`w-full rounded-xl border-2 px-4 py-3 text-gray-900 transition-colors resize-none ${
            errors.message
              ? 'border-red-300 bg-red-50 focus:border-red-500 focus:bg-white'
              : 'border-gray-200 focus:border-blue-500 focus:bg-white'
          }`}
          value={form.message}
          onChange={(e) => handleInputChange('message', e.target.value)}
          placeholder="Tell us what's on your mind..."
        />
        {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
      </div>

      {/* Submit Button */}
      <div className="text-center">
        <Button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full md:w-auto px-8 py-3 text-lg"
          variant="primary"
        >
          {status === 'submitting' ? 'Sending...' : 'Send Message'}
        </Button>
      </div>

      {/* Status Messages */}
      {status === 'success' && (
        <div className="text-center p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-green-800 font-medium">
            ✅ Thank you! Your message has been sent successfully.
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-800 font-medium">
            ❌ Something went wrong. Please try again or contact us directly.
          </p>
        </div>
      )}
    </form>
  )
}
