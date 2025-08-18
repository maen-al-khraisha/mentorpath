'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CreditCard, Coffee, Heart } from 'lucide-react'

export default function DonationDialog({ isOpen, onClose }) {
  const handleDonate = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Heart className="w-6 h-6 text-red-500" />
            Support Development ❤️
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
            Love this app? Your support keeps it growing! Pick a way to contribute and help me build
            more features. Every little bit counts—thank you!
          </p>

          <div className="space-y-3">
            <Button
              variant="secondary"
              size="lg"
              className="w-full h-16 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200"
              onClick={() => handleDonate('https://paypal.me/maenalkhraisha')}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-blue-600" />
                <span className="text-lg font-medium">Support via PayPal</span>
              </div>
            </Button>

            <Button
              variant="secondary"
              size="lg"
              className="w-full h-16 rounded-2xl hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:border-orange-200 dark:hover:border-orange-800 transition-all duration-200"
              onClick={() => handleDonate('https://buymeacoffee.com/maenalkhrae')}
            >
              <div className="flex items-center gap-3">
                <Coffee className="w-6 h-6 text-orange-600" />
                <span className="text-lg font-medium">Buy me a coffee</span>
              </div>
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Even sharing the app helps a lot! 💡 Thanks for your support.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
