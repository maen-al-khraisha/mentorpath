'use client'

import { FileText, Shield, RotateCcw, CreditCard } from 'lucide-react'

export default function FooterLegal() {
  const legalLinks = [
    {
      title: 'Terms & Conditions',
      href: '/terms',
      icon: FileText,
      description: 'General terms of service',
    },
    {
      title: 'Privacy Policy',
      href: '/privacy',
      icon: Shield,
      description: 'Data protection and privacy',
    },
    {
      title: 'Refund Policy',
      href: '/refund',
      icon: RotateCcw,
      description: 'Cancellation and refund terms',
    },
    {
      title: 'Subscription Terms',
      href: '/subscription-terms',
      icon: CreditCard,
      description: 'Specific subscription conditions',
    },
  ]

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mentor Path</h3>
            <p className="text-gray-600 mb-4">
              Your productivity companion for tasks, habits, notes, and insights. Start with a free
              trial and upgrade when you're ready.
            </p>
            <div className="flex space-x-4 mb-4">
              <a
                href="/about"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                About Us
              </a>
              <a
                href="mailto:support@mentorpath.com"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                support@mentorpath.com
              </a>
            </div>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Legal Information</h3>
            <div className="space-y-3">
              {legalLinks.map((link) => {
                const Icon = link.icon
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{link.title}</div>
                      <div className="text-sm text-gray-500">{link.description}</div>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-500 mb-4 md:mb-0">
              © {new Date().getFullYear()} MentorPath. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm text-gray-500">
              <span>Powered by Paddle for secure payments</span>
              <span>Hosted on Firebase</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
