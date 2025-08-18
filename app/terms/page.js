import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        <Card className="rounded-xl shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
              Terms & Conditions
            </CardTitle>
          </CardHeader>
          
          <CardContent className="prose prose-gray dark:prose-invert max-w-none">
            <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Donation Terms
                </h3>
                <p className="mb-4">
                  By making a donation, you acknowledge this is a voluntary payment to support development.
                </p>
                <p className="mb-4">
                  No physical goods or services are delivered in exchange for donations.
                </p>
                <p className="mb-4">
                  Donations are non-refundable.
                </p>
                <p>
                  Payments are processed securely via Paddle.
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Payment Processing
                </h3>
                <p className="mb-4">
                  All donations are processed securely through Paddle, a trusted payment processor. 
                  Your payment information is encrypted and secure.
                </p>
                <p>
                  You will receive a receipt via email for your donation.
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Use of Donations
                </h3>
                <p className="mb-4">
                  Donations are used to support the ongoing development, hosting, and maintenance of the application.
                </p>
                <p>
                  This includes server costs, development tools, and time invested in new features and improvements.
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Contact
                </h3>
                <p>
                  If you have any questions about these terms or your donation, please contact us through the app.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
