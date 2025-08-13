'use client'

export default function Testimonials() {
  const items = [
    {
      name: 'Alex Carter',
      role: 'Dev Mentor @ Atlas',
      quote: 'MentorPath keeps my week on track without friction. The insights are just right.',
    },
    {
      name: 'Priya N.',
      role: 'Founder, StudioN',
      quote: 'The tasks + notes combo is perfect. I finally stopped context-switching.',
    },
    {
      name: 'Marco',
      role: 'Engineering Lead',
      quote: 'Lightweight, fast, and focused. Our 1:1s are better with Agenda.',
    },
  ]

  return (
    <section className="py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-[var(--neutral-900)]">
          People are loving it
        </h2>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((t) => (
            <figure
              key={t.name}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4 shadow-soft"
            >
              <blockquote className="text-[var(--neutral-900)]">“{t.quote}”</blockquote>
              <figcaption className="mt-3 text-sm text-[var(--neutral-700)]">
                <span className="font-medium text-[var(--neutral-900)]">{t.name}</span> — {t.role}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
