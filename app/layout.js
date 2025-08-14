import './globals.css'
import { ThemeProvider } from 'next-themes'

export const metadata = {
  title: 'MaenStack',
  description: 'Task Timer, Notes, Calendar, Habit Tracker',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
