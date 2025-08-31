'use client'

import MainHeader from '@/components/MainHeader'
import FooterLegal from '@/components/FooterLegal'
import { RotateCcw, CreditCard, Clock, AlertCircle, CheckCircle } from 'lucide-react'

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <MainHeader />

      <main className="max-w-4xl mx-auto px-4 py-8 mt-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Refund Policy</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-soft">
          <div className="prose prose-slate max-w-none">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <RotateCcw className="h-5 w-5 mr-2 text-blue-600" />
                Overview
              </h2>
              <p className="text-gray-700 mb-4">
                At MentorPath, operated by Mentor Path, we want you to be completely satisfied with
                your subscription. This refund policy outlines the terms and conditions for refunds
                and cancellations.
              </p>
              <p className="text-gray-700">
                We believe in transparency and fair treatment of our customers, which is why we
                offer a 14-day money-back guarantee for new Pro subscriptions.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                14-Day Money-Back Guarantee
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">New Subscriptions</h3>
                  <p className="text-gray-700">
                    If you're not completely satisfied with your Pro subscription within the first
                    14 days, we'll provide a full refund, no questions asked. This applies to new
                    Pro subscriptions only.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">What's Covered</h3>
                  <p className="text-gray-700">
                    The 14-day guarantee covers the full subscription amount, including any setup
                    fees or initial charges. You'll receive a complete refund to your original
                    payment method.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">How to Request</h3>
                  <p className="text-gray-700">
                    To request a refund within the 14-day period, contact our support team at
                    support@mentorpath.com with your account details and reason for the refund.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-orange-600" />
                Cancellation Policy
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Free Trial Period</h3>
                  <p className="text-gray-700">
                    During your 14-day free trial, you can cancel at any time without any charges.
                    Your account will automatically revert to the Free plan when the trial ends.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Active Subscriptions</h3>
                  <p className="text-gray-700">
                    You can cancel your Pro subscription at any time through your account settings
                    or by contacting support. Cancellation takes effect at the end of your current
                    billing period.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No Partial Refunds</h3>
                  <p className="text-gray-700">
                    After the 14-day guarantee period, we do not provide partial refunds for unused
                    portions of your subscription. You'll continue to have access to Pro features
                    until the end of your billing period.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-purple-600" />
                Refund Processing
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Processing Time</h3>
                  <p className="text-gray-700">
                    Refunds are typically processed within 5-10 business days. The time it takes for
                    the refund to appear in your account depends on your payment method and
                    financial institution.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Payment Method</h3>
                  <p className="text-gray-700">
                    Refunds are issued to the original payment method used for the subscription. If
                    you used a credit card, the refund will appear as a credit on your statement.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Notification</h3>
                  <p className="text-gray-700">
                    You'll receive an email confirmation when your refund is processed, including
                    the refund amount and expected timeline for the funds to appear in your account.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
                Exceptions
              </h2>
              <p className="text-gray-700 mb-4">
                The following situations are not eligible for refunds:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Subscriptions cancelled after the 14-day guarantee period</li>
                <li>Accounts suspended for violation of our Terms of Service</li>
                <li>Fraudulent or abusive usage patterns</li>
                <li>Technical issues caused by user error or incompatible systems</li>
                <li>Requests made after the subscription has been cancelled</li>
              </ul>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Account Access After Refund
              </h2>
              <p className="text-gray-700 mb-4">
                When a refund is processed, your Pro subscription is immediately cancelled and your
                account is downgraded to the Free plan. You'll lose access to Pro features but can
                continue using the Free plan features.
              </p>
              <p className="text-gray-700">
                If you change your mind after receiving a refund, you can always resubscribe to the
                Pro plan at any time.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Dispute Resolution</h2>
              <p className="text-gray-700 mb-4">
                If you believe you're entitled to a refund but your request was denied, you can
                escalate the issue by contacting our customer support team. We're committed to
                resolving disputes fairly and promptly.
              </p>
              <p className="text-gray-700">
                For payment-related disputes, you may also contact your payment provider or
                financial institution directly.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For refund requests or questions about this policy, please contact us:
              </p>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> support@mentorpath.com
                  <br />
                  <strong>Company:</strong> Mentor Path
                  <br />
                  <strong>Address:</strong> [Your Company Address]
                  <br />
                  <strong>Phone:</strong> [Your Phone Number]
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-500 text-center">
                This refund policy is part of our Terms & Conditions and is subject to change with
                appropriate notice to users.
              </p>
            </div>
          </div>
        </div>
      </main>

      <FooterLegal />
    </div>
  )
}
