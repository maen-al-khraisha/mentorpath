import './globals.css'
import { ThemeProvider } from 'next-themes'
import { SidebarProvider } from '@/lib/SidebarContext'

export const metadata = {
  title: {
    template: '%s | MentorPath',
    default: 'MentorPath - Focused Productivity for Mentors and Makers',
  },
  description:
    'Focused productivity for mentors and makers 🚀 Tasks, notes, habits, calendar, and insights — beautifully organized in one place. Perfect for anyone looking to boost their productivity!',
  keywords: 'productivity, mentor, task management, notes, habits, calendar, productivity app',
  authors: [{ name: 'Maen Al-Khraisha' }],
  creator: 'Maen Al-Khraisha',
  publisher: 'MentorPath',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.mentorpath.tech',
    siteName: 'MentorPath',
    title: 'MentorPath - Focused Productivity for Mentors and Makers',
    description:
      'Focused productivity for mentors and makers 🚀 Tasks, notes, habits, calendar, and insights — beautifully organized in one place. Perfect for anyone looking to boost their productivity!',
    image: 'https://www.mentorpath.tech/og-image.png', // You need to add this image to your public folder
    imageWidth: 1200,
    imageHeight: 630,
    imageAlt: 'MentorPath Dashboard - Productivity app for mentors and makers',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@mentorpath', // Update with your actual Twitter handle if you have one
    creator: '@mentorpath', // Update with your actual Twitter handle if you have one
    title: 'MentorPath - Focused Productivity for Mentors and Makers',
    description:
      'Focused productivity for mentors and makers 🚀 Tasks, notes, habits, calendar, and insights — beautifully organized in one place.',
    image: 'https://www.mentorpath.tech/og-image.png', // Same image as Open Graph
    imageAlt: 'MentorPath Dashboard - Productivity app for mentors and makers',
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  metadataBase: new URL('https://www.mentorpath.tech'),
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
