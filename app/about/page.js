'use client'

import MainHeader from '@/components/MainHeader'
import FooterLegal from '@/components/FooterLegal'

export default function AboutPage() {
  const values = [
    {
      icon: '🚀',
      title: 'Innovation First',
      description: 'We believe in pushing boundaries and exploring new ways to enhance productivity.',
    },
    {
      icon: '🤝',
      title: 'User-Centric Design',
      description: 'Every feature is built with our users in mind, ensuring intuitive and powerful experiences.',
    },
    {
      icon: '🔒',
      title: 'Privacy & Security',
      description: 'Your data is sacred. We implement enterprise-grade security to protect your information.',
    },
    {
      icon: '🌱',
      title: 'Continuous Growth',
      description: 'We\'re constantly evolving, learning from our community to improve our platform.',
    },
  ]

  const team = [
    {
      name: 'Alex Chen',
      role: 'Founder & CEO',
      avatar: '/avatar.svg',
      bio: 'Productivity enthusiast with 10+ years in software development. Believes in the power of organized thinking.',
    },
    {
      name: 'Sarah Kim',
      role: 'Head of Product',
      avatar: '/avatar.svg',
      bio: 'UX expert passionate about creating intuitive interfaces that make complex tasks feel simple.',
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Lead Developer',
      avatar: '/avatar.svg',
      bio: 'Full-stack developer focused on building scalable, performant systems that users love.',
    },
  ]

  const milestones = [
    {
      year: '2023',
      title: 'Project Started',
      description: 'Initial concept and research phase began.',
    },
    {
      year: '2024',
      title: 'Beta Launch',
      description: 'First users joined our beta program.',
    },
    {
      year: '2025',
      title: 'Public Launch',
      description: 'MentorPath officially launched to the public.',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <MainHeader />

      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-28 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-white to-emerald-50/30" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 font-display">
                About <span className="text-gradient">MentorPath</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 leading-relaxed font-body mb-8">
                We're on a mission to transform how people think about and approach productivity.
                Born from the belief that everyone deserves tools that actually work.
              </p>
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Founded in 2023
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 md:py-28 relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 font-display">
                  Our <span className="text-gradient">Mission</span>
                </h2>
                <p className="text-xl text-slate-600 leading-relaxed font-body mb-6">
                  In a world filled with productivity apps that promise the moon but deliver complexity, 
                  we're building something different. MentorPath is designed to be the productivity 
                  companion that actually understands your workflow.
                </p>
                <p className="text-xl text-slate-600 leading-relaxed font-body mb-8">
                  We believe productivity isn't about doing more—it's about doing what matters, 
                  when it matters, with clarity and purpose. Our platform helps you build systems 
                  that work for you, not against you.
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">10,000+ Active Users</div>
                    <div className="text-sm text-slate-600">Trusting us with their productivity</div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-indigo-100 to-emerald-100 rounded-3xl p-8 md:p-12">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎯</div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4 font-display">
                      Simplify. Organize. Execute.
                    </h3>
                    <p className="text-slate-600 font-body">
                      Three simple principles that guide everything we build.
                    </p>
                  </div>
                </div>
                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                </div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 md:py-28 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-indigo-50/30" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 font-display">
                Our <span className="text-gradient">Values</span>
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed font-body">
                The principles that guide every decision we make and every feature we build.
              </p>
            </div>

            {/* Values Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-soft border border-slate-200 hover:shadow-elevated transition-all duration-300 text-center">
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 font-display">{value.title}</h3>
                  <p className="text-slate-600 font-body leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 md:py-28 relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 font-display">
                Meet Our <span className="text-gradient">Team</span>
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed font-body">
                The passionate individuals behind MentorPath, dedicated to revolutionizing productivity.
              </p>
            </div>

            {/* Team Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-soft border border-slate-200 hover:shadow-elevated transition-all duration-300 text-center">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-20 h-20 rounded-full bg-slate-200 mx-auto mb-4"
                  />
                  <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">{member.name}</h3>
                  <div className="text-indigo-600 font-semibold mb-4">{member.role}</div>
                  <p className="text-slate-600 font-body leading-relaxed">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Journey Section */}
        <section className="py-20 md:py-28 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 via-white to-indigo-50/30" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 font-display">
                Our <span className="text-gradient">Journey</span>
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed font-body">
                From concept to reality, here's how MentorPath came to life.
              </p>
            </div>

            {/* Timeline */}
            <div className="relative">
              {/* Connection line */}
              <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-200 via-indigo-200 to-purple-200 transform -translate-y-1/2" />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                {milestones.map((milestone, index) => (
                  <div key={milestone.year} className="relative">
                    {/* Year badge */}
                    <div className="relative z-10 mx-auto w-20 h-20 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-6 shadow-elevated">
                      {milestone.year}
                    </div>

                    {/* Content */}
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-slate-900 mb-4 font-display">
                        {milestone.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed max-w-sm mx-auto font-body">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28 relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-12 text-white">
                <h3 className="text-3xl font-bold mb-4 font-display">
                  Ready to Join Our Mission?
                </h3>
                <p className="text-xl text-slate-300 mb-8 font-body max-w-2xl mx-auto">
                  Be part of the productivity revolution. Start building your productivity empire today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/login"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition-all duration-300"
                  >
                    Get Started Free
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                  <a
                    href="/pricing"
                    className="inline-flex items-center gap-3 px-8 py-4 border border-white text-white font-semibold rounded-xl hover:bg-white hover:text-slate-900 transition-all duration-300"
                  >
                    View Plans
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <FooterLegal />
    </div>
  )
}
