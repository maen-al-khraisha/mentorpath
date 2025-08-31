'use client'

import MainHeader from '@/components/MainHeader'
import FooterLegal from '@/components/FooterLegal'
import { CreditCard, Calendar, Clock, AlertCircle, CheckCircle, Shield } from 'lucide-react'

export default function SubscriptionTermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <MainHeader />

      <main className="max-w-4xl mx-auto px-4 py-8 mt-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Terms</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-soft">
          <div className="prose prose-slate max-w-none">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                Overview
              </h2>
              <p className="text-gray-700 mb-4">
                These Subscription Terms govern your use of MentorPath's Pro subscription service,
                operated by Mentor Path. By subscribing to our Pro plan, you agree to these terms in
                addition to our general Terms & Conditions.
              </p>
              <p className="text-gray-700">
                Our subscription model is designed to provide you with flexible access to premium
                features while maintaining transparency about billing and service levels.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Free Trial
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">14-Day Trial Period</h3>
                  <p className="text-gray-700">
                    New users receive a 14-day free trial with full access to all Pro features. No
                    credit card is required during the trial period, and you can cancel at any time
                    without charge.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Trial Features</h3>
                  <p className="text-gray-700">
                    During your trial, you have unlimited access to all MentorPath features,
                    including unlimited tasks, notes, habits, events, and advanced insights.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Trial Conversion</h3>
                  <p className="text-gray-700">
                    If you don't cancel before the trial ends, your account will automatically
                    convert to the Free plan with limited features. You can upgrade to Pro at any
                    time.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-purple-600" />
                Pro Subscription Plans
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Monthly Plan</h3>
                  <p className="text-gray-700">
                    The Pro monthly plan costs $7 per month and provides unlimited access to all
                    features. Billing occurs on the same date each month.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Annual Plan</h3>
                  <p className="text-gray-700">
                    The Pro annual plan costs $60 per year (equivalent to $5/month) and provides the
                    same unlimited access with a significant discount.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Feature Access</h3>
                  <p className="text-gray-700">
                    Pro subscribers enjoy unlimited tasks, notes, habits, events, agenda sheets,
                    advanced insights, priority support, and early access to new features.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-orange-600" />
                Billing & Renewal
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Billing Cycle</h3>
                  <p className="text-gray-700">
                    Subscriptions are billed automatically on the same date each month or year,
                    depending on your chosen plan. Your billing cycle begins when you first
                    subscribe or when your trial converts to a paid plan.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Automatic Renewal</h3>
                  <p className="text-gray-700">
                    Your subscription automatically renews at the end of each billing period unless
                    you cancel before the renewal date. You will be charged the full subscription
                    amount on each renewal.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Payment Processing</h3>
                  <p className="text-gray-700">
                    All payments are processed securely through Paddle, our trusted payment
                    processor. You will receive an email receipt for each successful payment.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                Cancellation & Changes
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">How to Cancel</h3>
                  <p className="text-gray-700">
                    You can cancel your subscription at any time through your account settings or by
                    contacting our support team. Cancellation takes effect at the end of your
                    current billing period.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Plan Changes</h3>
                  <p className="text-gray-700">
                    You can upgrade or downgrade your plan at any time. Changes take effect
                    immediately, and billing will be adjusted accordingly.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    Post-Cancellation Access
                  </h3>
                  <p className="text-gray-700">
                    After cancellation, you'll continue to have access to Pro features until the end
                    of your current billing period. Your account will then revert to the Free plan.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
                Refund Policy
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">14-Day Guarantee</h3>
                  <p className="text-gray-700">
                    New Pro subscriptions come with a 14-day money-back guarantee. If you're not
                    satisfied within the first 14 days, we'll provide a full refund.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No Partial Refunds</h3>
                  <p className="text-gray-700">
                    After the 14-day guarantee period, we do not provide partial refunds for unused
                    portions of your subscription.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Refund Processing</h3>
                  <p className="text-gray-700">
                    Refunds are processed within 5-10 business days and are issued to your original
                    payment method.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Availability</h2>
              <p className="text-gray-700 mb-4">
                We strive to maintain high availability of our service, but we do not guarantee
                uninterrupted access. The service may be temporarily unavailable due to maintenance,
                updates, or technical issues.
              </p>
              <p className="text-gray-700">
                We reserve the right to modify or discontinue features with reasonable notice to
                subscribers.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Data & Privacy</h2>
              <p className="text-gray-700 mb-4">
                Your subscription data is handled in accordance with our Privacy Policy. We
                implement appropriate security measures to protect your information and ensure
                compliance with data protection regulations.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We may update these Subscription Terms from time to time. Material changes will be
                communicated to subscribers via email at least 30 days before they take effect.
              </p>
              <p className="text-gray-700">
                Your continued use of the Pro subscription after changes constitutes acceptance of
                the updated terms.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For subscription-related questions or support, please contact us:
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
                These Subscription Terms are part of our overall Terms & Conditions and are subject
                to change with appropriate notice to subscribers.
              </p>
            </div>
          </div>
        </div>
      </main>

      <FooterLegal />
    </div>
  )
}
