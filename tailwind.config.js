/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        accent: 'var(--accent)',
        danger: 'var(--danger)',
        'neutral-900': 'var(--neutral-900)',
        'neutral-700': 'var(--neutral-700)',
        page: 'var(--page)',
        card: 'var(--card)',
        border: 'var(--border)',
        muted1: 'var(--muted1)',
        muted2: 'var(--muted2)',
      },
      borderRadius: {
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      boxShadow: {
        soft: 'var(--soft-shadow)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
