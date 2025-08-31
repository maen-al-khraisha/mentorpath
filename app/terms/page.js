'use client'

import MainHeader from '@/components/MainHeader'
import FooterLegal from '@/components/FooterLegal'
import { Shield, FileText, Clock, CreditCard, UserCheck } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <MainHeader />

      <main className="max-w-4xl mx-auto px-4 py-8 mt-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms & Conditions</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-soft">
          <div className="prose prose-slate max-w-none">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Acceptance of Terms
              </h2>
              <p className="text-gray-700 mb-4">
                By accessing and using MentorPath ("the Service"), operated by Mentor Path, you
                accept and agree to be bound by the terms and provision of this agreement.
              </p>
              <p className="text-gray-700">
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <UserCheck className="h-5 w-5 mr-2 text-green-600" />
                User Accounts
              </h2>
              <p className="text-gray-700 mb-4">
                When you create an account with us, you must provide information that is accurate,
                complete, and current at all times. Failure to do so constitutes a breach of the
                Terms, which may result in immediate termination of your account.
              </p>
              <p className="text-gray-700">
                You are responsible for safeguarding the password and for all activities that occur
                under your account.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-purple-600" />
                Subscription Terms
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Free Trial</h3>
                  <p className="text-gray-700">
                    New users receive a 14-day free trial with full access to all features. No
                    credit card is required during the trial period.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Subscription Plans</h3>
                  <p className="text-gray-700">
                    After the trial period, users are automatically moved to the Free plan with
                    limited features. Users can upgrade to the Pro plan for unlimited access.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Billing</h3>
                  <p className="text-gray-700">
                    Pro subscriptions are billed monthly at $7/month. Billing occurs automatically
                    on the same date each month.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Cancellation</h3>
                  <p className="text-gray-700">
                    You may cancel your subscription at any time. Cancellation takes effect at the
                    end of the current billing period.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-red-600" />
                Acceptable Use
              </h2>
              <p className="text-gray-700 mb-4">You agree not to use the Service to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Upload or transmit malicious code or content</li>
                <li>Attempt to gain unauthorized access to the Service</li>
                <li>Use the Service for any commercial purpose without authorization</li>
              </ul>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-orange-600" />
                Service Availability
              </h2>
              <p className="text-gray-700 mb-4">
                We strive to maintain high availability of the Service, but we do not guarantee
                uninterrupted access. The Service may be temporarily unavailable due to maintenance,
                updates, or technical issues.
              </p>
              <p className="text-gray-700">
                We reserve the right to modify or discontinue the Service at any time with
                reasonable notice.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Data & Privacy</h2>
              <p className="text-gray-700 mb-4">
                Your use of the Service is also governed by our Privacy Policy. By using the
                Service, you consent to the collection and use of information as detailed in our
                Privacy Policy.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                In no event shall Mentor Path (operating as MentorPath), nor its directors,
                employees, partners, agents, suppliers, or affiliates, be liable for any indirect,
                incidental, special, consequential, or punitive damages, including without
                limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right, at our sole discretion, to modify or replace these Terms at
                any time. If a revision is material, we will try to provide at least 30 days notice
                prior to any new terms taking effect.
              </p>
              <p className="text-gray-700">
                What constitutes a material change will be determined at our sole discretion.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-700">
                If you have any questions about these Terms & Conditions, please contact us at:
              </p>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@mentorpath.com
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
                These terms constitute the entire agreement between you and Mentor Path (operating
                as MentorPath) regarding the use of the Service.
              </p>
            </div>
          </div>
        </div>
      </main>

      <FooterLegal />
    </div>
  )
}
