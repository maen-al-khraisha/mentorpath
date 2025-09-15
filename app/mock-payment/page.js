'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/useAuth'
import { updateUserPlan } from '@/lib/subscriptionApi'
import AppShell from '@/components/AppShell'
import Button from '@/components/Button'
import { CreditCard, Lock, Check, ArrowLeft } from 'lucide-react'

export default function MockPaymentPage() {
  const { user } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    email: user?.email || '',
  })

  const handleInputChange = (field, value) => {
    setPaymentData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const formatCardNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    // Add spaces every 4 digits
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  const formatExpiryDate = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    // Add slash after 2 digits
    if (digits.length >= 2) {
      return digits.substring(0, 2) + '/' + digits.substring(2, 4)
    }
    return digits
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return

    setIsProcessing(true)

    try {
      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock payment success - update user to PRO plan
      await updateUserPlan(user.uid, 'pro', {
        paymentMethod: 'mock',
        paymentDate: new Date(),
        subscriptionStatus: 'active',
      })

      // Redirect to success page
      window.location.href = '/payment-success'
    } catch (error) {
      console.error('Payment processing error:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const isFormValid = () => {
    return (
      paymentData.cardNumber.replace(/\s/g, '').length === 16 &&
      paymentData.expiryDate.length === 5 &&
      paymentData.cvv.length === 3 &&
      paymentData.cardholderName.trim().length > 0 &&
      paymentData.email.trim().length > 0
    )
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="outline" onClick={() => window.history.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upgrade to Pro</h1>
          <p className="text-gray-600">
            Complete your payment to unlock unlimited access to all features.
          </p>
        </div>

        {/* Payment Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-6">
            <Lock className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-sm text-gray-600">
              Your payment information is secure and encrypted
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Card Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={paymentData.cardNumber}
                  onChange={(e) =>
                    handleInputChange('cardNumber', formatCardNumber(e.target.value))
                  }
                  maxLength={19}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Expiry Date and CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={paymentData.expiryDate}
                  onChange={(e) =>
                    handleInputChange('expiryDate', formatExpiryDate(e.target.value))
                  }
                  maxLength={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                <input
                  type="text"
                  placeholder="123"
                  value={paymentData.cvv}
                  onChange={(e) =>
                    handleInputChange('cvv', e.target.value.replace(/\D/g, '').substring(0, 3))
                  }
                  maxLength={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Cardholder Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cardholder Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={paymentData.cardholderName}
                onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                placeholder="john@example.com"
                value={paymentData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Plan Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Plan Summary</h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-900 font-medium">Pro Plan</p>
                  <p className="text-sm text-gray-600">Unlimited access to all features</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">$7</p>
                  <p className="text-sm text-gray-600">per month</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!isFormValid() || isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing Payment...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Complete Payment - $7/month
                </div>
              )}
            </Button>
          </form>

          {/* Mock Notice */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="h-5 w-5 text-yellow-400">⚠️</div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Mock Payment System</h3>
                <p className="mt-1 text-sm text-yellow-700">
                  This is a demonstration payment form. No real payment will be processed. Your
                  account will be upgraded to Pro plan upon completion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
