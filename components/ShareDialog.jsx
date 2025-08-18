'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Twitter, Linkedin, Facebook, MessageCircle, Share2 } from 'lucide-react'

export default function ShareDialog({ isOpen, onClose }) {
  const shareData = {
    title: "Check out this app!",
    text: "I'm using this productivity app, it's awesome 🚀",
    url: "https://yourapp.com" // Update this with your actual app URL
  }

  const handleShare = (platform) => {
    let shareUrl = ''
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`
        break
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}`
        break
      default:
        return
    }
    
    window.open(shareUrl, '_blank', 'noopener,noreferrer')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Share2 className="w-6 h-6 text-blue-500" />
            Share this app 💌
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
            Help spread the word and support the project.
          </p>
          
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Twitter */}
            <Button
              variant="secondary"
              size="lg"
              className="h-20 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200 flex flex-col items-center justify-center gap-2"
              onClick={() => handleShare('twitter')}
            >
              <Twitter className="w-6 h-6 text-blue-500" />
              <span className="text-sm font-medium">Twitter</span>
            </Button>
            
            {/* LinkedIn */}
            <Button
              variant="secondary"
              size="lg"
              className="h-20 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200 flex flex-col items-center justify-center gap-2"
              onClick={() => handleShare('linkedin')}
            >
              <Linkedin className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-medium">LinkedIn</span>
            </Button>
            
            {/* Facebook */}
            <Button
              variant="secondary"
              size="lg"
              className="h-20 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200 flex flex-col items-center justify-center gap-2"
              onClick={() => handleShare('facebook')}
            >
              <Facebook className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-medium">Facebook</span>
            </Button>
            
            {/* WhatsApp */}
            <Button
              variant="secondary"
              size="lg"
              className="h-20 rounded-2xl hover:bg-green-50 dark:hover:bg-green-950/20 hover:border-green-200 dark:hover:border-green-800 transition-all duration-200 flex flex-col items-center justify-center gap-2"
              onClick={() => handleShare('whatsapp')}
            >
              <MessageCircle className="w-6 h-6 text-green-600" />
              <span className="text-sm font-medium">WhatsApp</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
