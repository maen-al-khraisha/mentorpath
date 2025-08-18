'use client'

import { Heart, CheckCircle, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center space-y-8">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <Sparkles className="w-5 h-5 text-yellow-800" />
              </div>
            </div>
          </div>

          {/* Main Message */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Thank You! 🎉
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-lg mx-auto leading-relaxed">
              Your generous support means the world to us! Every contribution helps keep MentorPath growing and improving.
            </p>
          </div>

          {/* Heart Animation */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2 text-pink-500 animate-pulse">
              <Heart className="w-8 h-8" />
              <span className="text-lg font-semibold">You're amazing!</span>
              <Heart className="w-8 h-8" />
            </div>
          </div>

          {/* What Happens Next */}
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              What happens next?
            </h2>
            <div className="space-y-3 text-left max-w-md mx-auto">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  You'll receive a receipt from Paddle via email
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Your donation helps fund new features and improvements
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  We'll keep you updated on what we're building
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Footer Message */}
          <div className="text-center pt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Have questions? Feel free to <Link href="/contact" className="text-green-600 hover:underline">contact us</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
