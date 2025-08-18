'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function DonatePage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      {/* Back Button */}
      <div className="max-w-md mx-auto mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>
      </div>
      
      <div className="flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="rounded-xl shadow-lg bg-white dark:bg-gray-800 p-6">
            <div className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl">❤️</span>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Support Development ❤️
              </h1>
            </div>

            <div className="space-y-6">
              <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                This is a one-time contribution to support the ongoing development of my app. This
                payment is a voluntary donation and not tied to physical goods. All contributions help
                cover hosting, updates, and new features.
              </p>

              <div className="flex justify-center">
                <button
                  className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-xl bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  onClick={() =>
                    window.open(
                      'https://buy.paddle.com/checkout/12345',
                      '_blank',
                      'noopener,noreferrer'
                    )
                  }
                >
                  <span className="mr-2">💳</span>
                  Donate via Paddle 💳
                </button>
              </div>

              <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Thank you for supporting indie development 🙏
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
