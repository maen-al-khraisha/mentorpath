import MainHeader from '@/components/MainHeader'
import FooterLegal from '@/components/FooterLegal'
import ContactForm from './ContactForm'

export const metadata = {
  title: 'Contact — MentorPath',
  description: 'Send suggestions or complaints to the MentorPath team.',
}

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

      {/* Contact Form Section */}
      <section className="py-10 md:py-14">
        <div className="mx-auto max-w-4xl px-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-8 shadow-soft">
            <h2 className="text-2xl font-semibold text-[var(--neutral-900)] mb-2">Get in Touch</h2>
            <p className="text-[var(--neutral-700)] mb-6">
              Suggestions or complaints welcome. We'd love to hear from you.
            </p>

            <ContactForm />
          </div>
        </div>
      </section>

      <FooterLegal />
    </main>
  )
}
