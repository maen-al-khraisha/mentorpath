'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Twitter, Linkedin, Facebook, MessageCircle, Share2 } from 'lucide-react'

export default function ShareDialog({ isOpen, onClose }) {
  const shareData = {
    title: 'Check out MentorPath!',
    text: '🚀 Just discovered this amazing productivity app! MentorPath helps me organize tasks, notes, habits, and calendar all in one beautiful place. Perfect for mentors and anyone looking to boost their productivity! Check it out: mentorpath.tech',
    url: 'https://www.mentorpath.tech',
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
      <DialogContent className="sm:max-w-md  bg-[var(--bg-card)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Share2 className="w-6 h-6 text-blue-500" />
            Share this app 💌
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
            Help spread the word about MentorPath! Share this amazing productivity app with your
            network.
          </p>

          {/* Pre-written Post Preview */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-lg font-bold">MP</span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">MentorPath</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Just now</div>
              </div>
            </div>
            <div className="mt-3 text-gray-700 dark:text-gray-300">
              🚀 Just discovered this amazing productivity app! MentorPath helps me organize tasks,
              notes, habits, and calendar all in one beautiful place. Perfect for mentors and anyone
              looking to boost their productivity!
              <br />
              <br />
              Check it out:{' '}
              <span className="text-blue-600 dark:text-blue-400 font-medium">mentorpath.tech</span>
            </div>
          </div>

          {/* App Screenshot */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
              App Preview
            </div>
            <div className="bg-gradient-to-br from-green-400 to-blue-500 rounded-lg p-4 text-center text-white">
              <div className="text-2xl mb-2">📱</div>
              <div className="font-medium">MentorPath Dashboard</div>
              <div className="text-sm opacity-90">Tasks • Notes • Habits • Calendar</div>
            </div>
          </div>

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
