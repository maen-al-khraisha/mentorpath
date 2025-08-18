'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CreditCard, Globe, Coffee, Heart } from 'lucide-react'

export default function DonationDialog({ isOpen, onClose }) {
  const handleDonate = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[var(--bg-card)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Heart className="w-6 h-6 text-red-500" />
            Support Development ❤️
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
            Choose the way you'd like to support. Every contribution helps keep the app growing 🚀.
          </p>

          <div className="space-y-3">
            <Button
              variant="primary"
              size="lg"
              className="w-full h-16 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => handleDonate('https://buy.paddle.com/checkout/12345')}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6" />
                <span className="text-lg font-medium">Donate via Paddle</span>
              </div>
            </Button>

            <Button
              variant="secondary"
              size="lg"
              className="w-full h-16 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => handleDonate('https://paypal.me/maenalkhraisha')}
            >
              <div className="flex items-center gap-3">
                <Globe className="w-6 h-6" />
                <span className="text-lg font-medium">Support via PayPal.me</span>
              </div>
            </Button>

            <Button
              variant="secondary"
              size="lg"
              className="w-full h-16 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => handleDonate('https://buymeacoffee.com/maenalkhrae')}
            >
              <div className="flex items-center gap-3">
                <Coffee className="w-6 h-6" />
                <span className="text-lg font-medium">Buy me a coffee</span>
              </div>
            </Button>
          </div>

          <div className="text-center pt-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Thank you for supporting indie development 🙏
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
