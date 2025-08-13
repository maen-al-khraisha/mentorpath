export const metadata = {
  title: 'Contact — MentorPath',
  description: 'Send suggestions or complaints to the MentorPath team.',
}

import MainHeader from '@/components/MainHeader'
import FooterLanding from '@/components/FooterLanding'

export default function ContactPage() {
  return (
    <main className="bg-[var(--bg-page)] text-[var(--neutral-900)] min-h-screen">
      <MainHeader />
      <section className="py-10 md:py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="text-3xl font-semibold">Contact</h1>
          <p className="text-[var(--neutral-700)] mt-1">We respond to every message.</p>
        </div>
      </section>
      {/* Reuse the landing footer which includes the contact form */}
      <FooterLanding />
    </main>
  )
}
