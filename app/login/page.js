'use client'
import { auth } from '@/lib/firebaseClient'
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  TwitterAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()

  async function signIn(providerId) {
    try {
      let provider
      if (providerId === 'google') provider = new GoogleAuthProvider()
      if (providerId === 'facebook') provider = new FacebookAuthProvider()
      if (providerId === 'github') provider = new GithubAuthProvider()
      if (providerId === 'twitter') provider = new TwitterAuthProvider()
      await signInWithPopup(auth, provider)
      router.replace('/dashboard')
    } catch (e) {
      console.error(e)
      alert('Sign-in failed: ' + (e?.message || e))
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-card border border-border rounded-lg p-8 w-full max-w-md shadow-soft">
        {/* Logo Section */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-card font-bold text-xl">M</span>
              </div>
              <span className="text-2xl font-bold text-neutral-900">MentorPath</span>
            </div>
          </Link>
        </div>

        <h1 className="text-xl font-semibold mb-6">Sign in to MentorPath</h1>
        <div className="space-y-3">
          <button
            onClick={() => signIn('google')}
            className="w-full rounded-md px-4 py-2 bg-neutral-900 text-card hover:opacity-90"
          >
            Sign in with Google
          </button>
          <button
            onClick={() => signIn('facebook')}
            className="w-full rounded-md px-4 py-2 bg-[#1877F2] text-white hover:opacity-90"
          >
            Sign in with Facebook
          </button>
          <button
            onClick={() => signIn('github')}
            className="w-full rounded-md px-4 py-2 bg-[#24292E] text-white hover:opacity-90"
          >
            Sign in with GitHub
          </button>
          <button
            onClick={() => signIn('twitter')}
            className="w-full rounded-md px-4 py-2 bg-[#1DA1F2] text-white hover:opacity-90"
          >
            Sign in with Twitter
          </button>
        </div>
        <p className="text-xs text-neutral-700 mt-4">
          Enable Google, Facebook, GitHub, and Twitter providers in Firebase Console →
          Authentication → Sign-in method. Configure authorized domains and each provider's callback
          URL.
        </p>
      </div>
    </main>
  )
}
