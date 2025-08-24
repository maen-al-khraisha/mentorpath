'use client'

import Link from 'next/link'
import * as Dialog from '@radix-ui/react-dialog'
import ScreenshotModal from '@/components/ScreenshotModal'
import { useState } from 'react'
import { ArrowRight, Play, Zap, Target, TrendingUp } from 'lucide-react'

export default function Hero() {
  const [open, setOpen] = useState(false)

  return (
    <section className="relative pt-16 md:pt-24 pb-16 md:pb-20 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-indigo-100/40 to-emerald-100/40 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full text-sm font-medium text-slate-700 mb-8 shadow-soft">
            <Zap className="w-4 h-4 text-indigo-500" />
            <span>Built for modern productivity</span>
          </div>

          {/* Main headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6 font-display">
            <span className="text-gradient">Focus.</span> Build.
            <br />
            <span className="text-gradient">Scale.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed font-body">
            The all-in-one productivity platform for freelancers, creators, and
            <span className="font-semibold text-slate-900"> productivity enthusiasts</span> who want
            to
            <span className="font-semibold text-slate-900"> do more with less.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              href="/login"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-2xl shadow-elevated hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              Start Building — Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Dialog.Root open={open} onOpenChange={setOpen}>
              <Dialog.Trigger asChild>
                <button
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 font-semibold rounded-2xl shadow-soft hover:shadow-lg transition-all duration-300 hover:scale-105"
                  aria-haspopup="dialog"
                >
                  <Play className="w-5 h-5 text-indigo-500" />
                  Watch Demo
                </button>
              </Dialog.Trigger>
              <ScreenshotModal onClose={() => setOpen(false)} />
            </Dialog.Root>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-8 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span>10,000+ active users</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span>99.9% uptime</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span>Always free</span>
            </div>
          </div>
        </div>

        {/* Hero visual */}
        <div className="mt-16 relative">
          <div className="relative mx-auto max-w-5xl">
            {/* Main app mockup */}
            <div className="relative bg-white rounded-3xl shadow-elevated border border-slate-200 overflow-hidden">
              {/* Mockup header */}
              <div className="h-12 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 flex items-center px-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-400 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                  <div className="w-3 h-3 bg-green-400 rounded-full" />
                </div>
                <div className="ml-4 text-sm text-slate-600 font-medium">MentorPath Dashboard</div>
              </div>

              {/* Mockup content */}
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left column - Tasks */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="h-8 bg-indigo-100 rounded-lg w-3/4" />
                    <div className="space-y-3">
                      <div className="h-12 bg-slate-100 rounded-lg" />
                      <div className="h-12 bg-slate-100 rounded-lg" />
                      <div className="h-12 bg-emerald-100 rounded-lg" />
                    </div>
                    <div className="h-24 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200" />
                  </div>

                  {/* Right column - Stats */}
                  <div className="space-y-4">
                    <div className="h-32 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200" />
                    <div className="h-24 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200" />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-elevated border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">+47%</div>
                  <div className="text-xs text-slate-500">Productivity</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-elevated border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">12/15</div>
                  <div className="text-xs text-slate-500">Tasks Done</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
