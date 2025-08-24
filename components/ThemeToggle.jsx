'use client'
import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'
import Button from '@/components/Button'

export default function ThemeToggle() {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme') || 'light'
    setTheme(savedTheme)

    // Apply the theme immediately
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.setAttribute('data-theme', 'light')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'

    // Update state
    setTheme(newTheme)

    // Update DOM
    document.documentElement.setAttribute('data-theme', newTheme)

    // Save to localStorage
    localStorage.setItem('theme', newTheme)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      {theme === 'light' ? (
        <Moon size={18} className="text-slate-600" />
      ) : (
        <Sun size={18} className="text-slate-600" />
      )}
    </Button>
  )
}
