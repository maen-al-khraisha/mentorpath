'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Twitter, Linkedin, Facebook, MessageCircle, Share2, Mail, Instagram } from 'lucide-react'

export default function ShareDialog({ isOpen, onClose }) {
  const shareData = {
    title: 'Check out MentorPath!',
    text: '🚀 Just discovered this amazing productivity app! MentorPath helps me organize tasks, notes, habits, and calendar all in one beautiful place. Perfect for mentors and anyone looking to boost their productivity! Check it out: mentorpath.tech',
    url: 'https://www.mentorpath.tech',
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop&crop=center',
    hashtags: '#ProductivityApp #MentorPath #TaskManagement #HabitTracking',
  }

  const handleShare = (platform) => {
    let shareUrl = ''

    switch (platform) {
      case 'twitter':
        // Twitter with image, text, and hashtags
        const twitterText = `${shareData.text} ${shareData.hashtags}`
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(shareData.url)}`
        break
      case 'linkedin':
        // LinkedIn with title, summary, and image
        const linkedinText = `${shareData.title} - ${shareData.text}`
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}&title=${encodeURIComponent(shareData.title)}&summary=${encodeURIComponent(linkedinText)}`
        break
      case 'facebook':
        // Facebook with pre-filled text and image
        const facebookText = `${shareData.text} ${shareData.hashtags}`
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}&quote=${encodeURIComponent(facebookText)}`
        break
      case 'whatsapp':
        // WhatsApp with pre-filled message
        const whatsappText = `${shareData.text} ${shareData.hashtags} ${shareData.url}`
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`
        break
      case 'instagram':
        // Instagram - redirect to app with pre-filled caption
        const instagramText = `${shareData.text} ${shareData.hashtags} ${shareData.url}`
        shareUrl = `https://www.instagram.com/?caption=${encodeURIComponent(instagramText)}`
        break
      case 'email':
        // Email with pre-filled subject and body
        const emailSubject = shareData.title
        const emailBody = `${shareData.text}\n\n${shareData.hashtags}\n\nCheck it out: ${shareData.url}`
        shareUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
        break
      default:
        return
    }

    window.open(shareUrl, '_blank', 'noopener,noreferrer')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 border-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Share2 className="w-6 h-6 text-blue-500" />
            Share this app 💌
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
            Share MentorPath with your network! Click any platform below to open with pre-filled
            content.
          </p>

          <div className="grid grid-cols-3 gap-3 sm:gap-4">
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

            {/* Instagram */}
            <Button
              variant="secondary"
              size="lg"
              className="h-20 rounded-2xl hover:bg-pink-50 dark:hover:bg-pink-950/20 hover:border-pink-200 dark:hover:border-pink-800 transition-all duration-200 flex flex-col items-center justify-center gap-2"
              onClick={() => handleShare('instagram')}
            >
              <Instagram className="w-6 h-6 text-pink-600" />
              <span className="text-sm font-medium">Instagram</span>
            </Button>

            {/* Email */}
            <Button
              variant="secondary"
              size="lg"
              className="h-20 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-950/20 hover:border-gray-200 dark:hover:border-gray-800 transition-all duration-200 flex flex-col items-center justify-center gap-2"
              onClick={() => handleShare('email')}
            >
              <Mail className="w-6 h-6 text-gray-600" />
              <span className="text-sm font-medium">Email</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
