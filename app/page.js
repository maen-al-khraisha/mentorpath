// Server Component page; renders client components inside

/*
README (Landing Page):
- Update hero copy in `components/Hero.jsx`.
- Replace placeholder screenshots in `public/` (files: `screenshot-1.svg`, `screenshot-2.svg`, `screenshot-3.svg`).
- Contact form is implemented in `components/FooterLanding.jsx`.
  - If `NEXT_PUBLIC_USE_MOCKS === "true"`, submitting shows a success message only.
  - Otherwise, it writes a document to Firestore collection `feedback` with fields
    `{ name, email, type, message, createdAt }`. TODO: add email notifications.
*/

import Hero from '@/components/Hero'
import FeaturesGrid from '@/components/FeaturesGrid'
import Testimonials from '@/components/Testimonials'
import FooterLanding from '@/components/FooterLanding'
import MainHeader from '@/components/MainHeader'

function HowItWorks() {
  const steps = [
    {
      n: 1,
      title: 'Sign up in seconds',
      desc: 'Use Google, LinkedIn, or Facebook to get started instantly. No credit card required.',
      icon: '🚀',
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      n: 2,
      title: 'Build your system',
      desc: 'Add tasks, notes, and habits. Connect everything together for seamless workflow.',
      icon: '⚡',
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      n: 3,
      title: 'Scale your results',
      desc: 'Track progress, analyze insights, and continuously optimize your productivity system.',
      icon: '📈',
      color: 'from-purple-500 to-purple-600',
    },
  ]

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-indigo-50/30" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 font-display">
            Get started in <span className="text-gradient">3 simple steps</span>
          </h2>
          <p className="text-xl text-slate-600 leading-relaxed font-body">
            From zero to productivity hero in under 5 minutes. No complex setup, no learning curve.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-200 via-emerald-200 to-purple-200 transform -translate-y-1/2" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div key={step.n} className="relative">
                {/* Step number */}
                <div className="relative z-10 mx-auto w-20 h-20 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-3xl mb-6 shadow-elevated">
                  {step.icon}
                </div>

                {/* Step content */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full text-sm font-semibold text-slate-700 mb-4 shadow-soft">
                    Step {step.n}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4 font-display">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed max-w-sm mx-auto font-body">
                    {step.desc}
                  </p>
                </div>

                {/* Arrow (hidden on mobile) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 -right-6 text-slate-300">
                    <svg
                      className="w-12 h-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <a
            href="/login"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-2xl shadow-elevated hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            Start Your Productivity Journey
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}

function DemoScreens() {
  const shots = [
    {
      src: '/screenshots/tasks-dashboard.png',
      alt: 'Smart Task Management Dashboard',
      title: 'Smart Task Management',
      desc: 'Organize, prioritize, and execute with intelligent daily lists',
    },
    {
      src: '/screenshots/notes-dashboard.png',
      alt: 'Linked Notes & Ideas System',
      title: 'Linked Notes & Ideas',
      desc: 'Connect thoughts to actions for seamless execution',
    },
    {
      src: '/screenshots/insights-dashboard.png',
      alt: 'Productivity Insights Dashboard',
      title: 'Productivity Insights',
      desc: 'Track progress and optimize your workflow with data',
    },
  ]

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-white to-emerald-50/30" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 font-display">
            See <span className="text-gradient">MentorPath in action</span>
          </h2>
          <p className="text-xl text-slate-600 leading-relaxed font-body">
            Beautiful, intuitive, and powerful. Experience the difference that thoughtful design
            makes.
          </p>
        </div>

        {/* Screenshots Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {shots.map((shot, index) => (
            <div key={shot.src} className="group">
              <div className="relative bg-white rounded-3xl shadow-soft hover:shadow-elevated transition-all duration-500 hover:-translate-y-2 border border-slate-200 overflow-hidden">
                {/* Screenshot */}
                <div className="relative overflow-hidden">
                  <img
                    src={shot.src}
                    alt={shot.alt}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors font-display">
                    {shot.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed font-body">{shot.desc}</p>
                </div>

                {/* Hover indicator */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                  <svg
                    className="w-4 h-4 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Demo CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-3 px-8 py-4 bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 font-semibold rounded-2xl shadow-soft hover:shadow-lg transition-all duration-300 hover:scale-105">
            <svg
              className="w-5 h-5 text-indigo-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Want to explore more? Try the interactive demo
          </div>
        </div>
      </div>
    </section>
  )
}

function PricingCTA() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-emerald-50/50" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 font-display">
              Start building your <span className="text-gradient">productivity empire</span>
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed font-body">
              Join thousands of freelancers, creators, and productivity enthusiasts who've already
              transformed their workflow
            </p>
          </div>

          {/* Pricing Card */}
          <div className="relative bg-white rounded-3xl shadow-elevated border border-slate-200 overflow-hidden">
            {/* Accent border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-emerald-500 to-purple-500" />

            <div className="p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Left content */}
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-6">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Always Free
                  </div>

                  <h3 className="text-3xl font-bold text-slate-900 mb-4 font-display">
                    Everything you need to get started
                  </h3>

                  <p className="text-lg text-slate-600 mb-6 leading-relaxed font-body">
                    Unlimited tasks, notes, and habits. Calendar and insights included. No hidden
                    fees, no credit card required.
                  </p>

                  {/* Feature list */}
                  <div className="space-y-3 mb-8">
                    {[
                      'Unlimited tasks, notes, and habits',
                      'Full calendar integration',
                      'Productivity insights & analytics',
                      'Meeting agenda management',
                      'Mobile-responsive design',
                      'Real-time sync across devices',
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-emerald-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <span className="text-slate-700 font-body">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right CTA */}
                <div className="text-center lg:text-right">
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 border border-slate-200">
                    <div className="text-4xl font-bold text-slate-900 mb-2 font-display">$0</div>
                    <div className="text-slate-600 mb-6 font-body">Forever</div>

                    <a
                      href="/login"
                      className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-2xl shadow-elevated hover:shadow-lg transition-all duration-300 hover:scale-105 w-full justify-center"
                    >
                      Get Started — Free
                      <svg
                        className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </a>

                    <p className="text-sm text-slate-500 mt-4">
                      No credit card • No commitment • Start in seconds
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="text-center mt-12">
            <div className="flex items-center justify-center gap-8 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-body">10,000+ active users</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-body">99.9% uptime</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-body">24/7 support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export const metadata = {
  title: 'MentorPath — Build Your Productivity Empire | All-in-One Task & Habit Management',
  description:
    'The modern productivity platform for Gen-Z freelancers, creators, and productivity enthusiasts. Tasks, notes, habits, calendar, and insights — beautifully organized in one place. Start free today.',
}

export default function LandingPage() {
  return (
    <main className="bg-slate-50 text-slate-900">
      <MainHeader />
      <Hero />
      <FeaturesGrid />
      <HowItWorks />
      <DemoScreens />
      <Testimonials />
      <PricingCTA />
      <FooterLanding />
    </main>
  )
}
