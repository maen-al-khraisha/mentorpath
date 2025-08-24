'use client'

import {
  CheckSquare,
  NotebookPen,
  Activity,
  CalendarDays,
  ListTodo,
  BarChart3,
  Zap,
  Target,
  Clock,
  TrendingUp,
} from 'lucide-react'

const features = [
  {
    icon: CheckSquare,
    title: 'Smart Task Management',
    desc: 'Plan, prioritize, and execute with intelligent daily lists that adapt to your workflow.',
    color: 'indigo',
    gradient: 'from-indigo-500 to-indigo-600',
  },
  {
    icon: NotebookPen,
    title: 'Linked Notes & Ideas',
    desc: 'Capture thoughts and connect them directly to actionable tasks for seamless execution.',
    color: 'emerald',
    gradient: 'from-emerald-500 to-emerald-600',
  },
  {
    icon: Activity,
    title: 'Habit Building',
    desc: 'Transform good intentions into lasting routines with science-backed habit tracking.',
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600',
  },
  {
    icon: CalendarDays,
    title: 'Visual Calendar',
    desc: 'See your entire day at a glance with an intuitive calendar that keeps you on track.',
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    icon: ListTodo,
    title: 'Meeting Agendas',
    desc: 'Run efficient meetings with structured agendas and action item tracking.',
    color: 'amber',
    gradient: 'from-amber-500 to-amber-600',
  },
  {
    icon: BarChart3,
    title: 'Productivity Insights',
    desc: 'Understand your patterns with lightweight analytics that help you optimize your workflow.',
    color: 'rose',
    gradient: 'from-rose-500 to-rose-600',
  },
]

const productivityStats = [
  { icon: Zap, label: 'Faster', value: '3.2x', desc: 'Task completion' },
  { icon: Target, label: 'More', value: '47%', desc: 'Productivity boost' },
  { icon: Clock, label: 'Save', value: '2.5h', desc: 'Per day' },
  { icon: TrendingUp, label: 'Better', value: '89%', desc: 'Goal achievement' },
]

export default function FeaturesGrid() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-indigo-50/20" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 font-display">
            Everything you need to <span className="text-gradient">crush your goals</span>
          </h2>
          <p className="text-xl text-slate-600 leading-relaxed font-body">
            Six powerful tools designed to work together seamlessly, giving you the productivity
            superpowers you've always wanted.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative bg-white rounded-2xl p-8 shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border border-slate-200"
            >
              {/* Icon */}
              <div
                className={`w-14 h-14 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className="w-7 h-7 text-white" aria-hidden />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors font-display">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed font-body">{feature.desc}</p>

              {/* Hover effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-50/50 to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </div>
          ))}
        </div>

        {/* Productivity Stats */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-elevated border border-slate-200">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-4 font-display">
              Real results from real users
            </h3>
            <p className="text-lg text-slate-600 font-body">
              Join thousands of productivity enthusiasts who've transformed their workflow
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {productivityStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-indigo-600" aria-hidden />
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1 font-display">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-slate-600 mb-1 font-body">
                  {stat.label}
                </div>
                <div className="text-xs text-slate-500 font-body">{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
