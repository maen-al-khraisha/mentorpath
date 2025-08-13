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
    { n: 1, title: 'Sign up', desc: 'Use Google, LinkedIn, or Facebook to get started.' },
    { n: 2, title: 'Create', desc: 'Add tasks, notes, and habits. Keep it simple.' },
    { n: 3, title: 'Track', desc: 'Review progress and insights to improve.' },
  ]
  return (
    <section className="py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-[var(--neutral-900)]">
          How it works
        </h2>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((s) => (
            <div
              key={s.n}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4 shadow-soft"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[var(--primary)] text-[var(--neutral-900)] text-xs font-bold inline-flex items-center justify-center">
                  {s.n}
                </div>
                <div className="font-medium text-[var(--neutral-900)]">{s.title}</div>
              </div>
              <div className="mt-2 text-sm text-[var(--neutral-700)]">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function DemoScreens() {
  const shots = [
    { src: '/screenshot-1.svg', alt: 'Tasks board screenshot' },
    { src: '/screenshot-2.svg', alt: 'Notes list screenshot' },
    { src: '/screenshot-3.svg', alt: 'Insights dashboard screenshot' },
  ]
  return (
    <section className="py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-[var(--neutral-900)]">
          See the product
        </h2>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {shots.map((s) => (
            <figure
              key={s.src}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-3 shadow-soft"
            >
              <img src={s.src} alt={s.alt} className="w-full h-48 object-cover rounded" />
              <figcaption className="sr-only">{s.alt}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

function PricingCTA() {
  return (
    <section className="py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-4">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-6 shadow-soft flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-[var(--neutral-900)]">Free plan</h3>
            <p className="text-sm text-[var(--neutral-700)]">
              Unlimited tasks, notes, and habits. Calendar and insights included.
            </p>
          </div>
          <a
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg px-5 py-3 bg-[var(--primary)] text-[var(--neutral-900)] font-semibold shadow-soft focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            Get started — Free
          </a>
        </div>
      </div>
    </section>
  )
}

export const metadata = {
  title: 'MentorPath — Focused productivity for mentors and makers',
  description: 'Tasks, notes, habits, calendar, and insights — beautifully organized in one place.',
}

export default function LandingPage() {
  return (
    <main className="bg-[var(--bg-page)] text-[var(--neutral-900)]">
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
