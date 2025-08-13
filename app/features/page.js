export const metadata = {
  title: 'Features — MentorPath',
  description: 'Explore MentorPath features: Tasks, Notes, Habits, Calendar, Agenda, and Insights.',
}

import FeaturesGrid from '@/components/FeaturesGrid'
import MainHeader from '@/components/MainHeader'
import FooterLanding from '@/components/FooterLanding'

export default function FeaturesPage() {
  return (
    <main className="bg-[var(--bg-page)] text-[var(--neutral-900)] min-h-screen">
      <MainHeader />
      <section className="pt-8">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="text-3xl font-semibold">Features</h1>
          <p className="text-[var(--neutral-700)] mt-1">Simple, fast, and focused.</p>
        </div>
      </section>
      <FeaturesGrid />
      <FooterLanding />
    </main>
  )
}
