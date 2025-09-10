'use client'

import { Palette } from 'lucide-react'
import Button from '@/components/Button'
import { useLayout } from '@/lib/LayoutContext'

export default function StyleToggle() {
  const { currentLayout, switchLayout } = useLayout()

  const toggleLayout = () => {
    const newLayout = currentLayout === 'modern' ? 'retro' : 'modern'
    switchLayout(newLayout)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLayout}
      className="relative"
      aria-label={`Switch to ${currentLayout === 'modern' ? 'retro' : 'modern'} layout`}
      title={`Current: ${currentLayout} layout`}
    >
      <Palette size={18} className="text-slate-600" />
      {/* Layout indicator */}
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
    </Button>
  )
}
