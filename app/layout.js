import './globals.css'
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
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop&crop=center', // High-quality Unsplash image for better social sharing
    imageWidth: 1200,
    imageHeight: 630,
    imageAlt: 'MentorPath Dashboard - Productivity app for mentors and makers',
    // Additional properties for better LinkedIn compatibility
    imageType: 'image/jpeg',
    imageSecureUrl:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop&crop=center',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@mentorpath', // Update with your actual Twitter handle if you have one
    creator: '@mentorpath', // Update with your actual Twitter handle if you have one
    title: 'MentorPath - Focused Productivity for Mentors and Makers',
    description:
      'Focused productivity for mentors and makers 🚀 Tasks, notes, habits, calendar, and insights — beautifully organized in one place.',
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop&crop=center', // Same image as Open Graph
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'light';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* LinkedIn-specific meta tags for better sharing */}
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta
          property="og:image:secure_url"
          content="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop&crop=center"
        />
        <meta property="og:site_name" content="MentorPath" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.mentorpath.tech" />
        <meta
          property="og:title"
          content="MentorPath - Focused Productivity for Mentors and Makers"
        />
        <meta
          property="og:description"
          content="Focused productivity for mentors and makers 🚀 Tasks, notes, habits, calendar, and insights — beautifully organized in one place. Perfect for anyone looking to boost their productivity!"
        />
        <meta
          property="og:image"
          content="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop&crop=center"
        />
      </head>
      <body>
        <SidebarProvider>{children}</SidebarProvider>
      </body>
    </html>
  )
}
