import './globals.css'
import { ThemeProvider } from 'next-themes'
import { SidebarProvider } from '@/lib/SidebarContext'

export const metadata = {
  title: {
    template: '%s | Mentor Path',
    default: 'Mentor Path',
  },
  description: 'Task Timer, Notes, Calendar, Habit Tracker',
  icons: {
    icon: '/favicon-black.svg',
    shortcut: '/favicon-black.svg',
    apple: '/favicon-black.svg',
  },
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
