# MentorPath

A micro‑SaaS starter built with Next.js (App Router), Tailwind CSS, shadcn UI (Radix), and Firebase. It includes Firebase Auth (Google, Facebook, LinkedIn via OAuthProvider), Firestore, Storage, a live theme system powered by Firestore `settings/theme`, and protected routes with an admin panel.

## Features

- App Router (Next.js) with Inter font and light theme by default
- Tailwind + shadcn UI + Radix primitives
- Firebase Client SDK (Auth, Firestore, Storage)
- Social Logins: Google, Facebook, LinkedIn (custom OAuth provider)
- Admin-editable theme via Firestore (`settings/theme` doc) reflected live across the app
- Protected routes: `/dashboard`, `/tasks`, `/notes`, `/calendar`, `/habits`, `/agenda`, `/insights`
- Admin panel `/admin` with theme editor and sample app settings

## Quickstart

1. Install dependencies:
   ```bash
   cd mentorpath
   npm install
   ```
2. Copy env file and fill values:
   ```bash
   cp .env.local.example .env.local
   ```
3. Run the dev server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000`.

## Environment Variables

Required in `.env.local`:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (optional)
- `NEXT_PUBLIC_LINKEDIN_CLIENT_ID`
- `NEXT_PUBLIC_LINKEDIN_REDIRECT_URI`
- `NEXTAUTH_SECRET` (optional)

## Firebase Setup

1. Create a Firebase project and a Web App. Copy the config to `.env.local`.
2. Storage (ImageKit)
   - Set env vars in `.env.local`:
     - `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`
     - `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`
     - `IMAGEKIT_PRIVATE_KEY` (server only)
   - The app exposes an auth endpoint at `/api/imagekit/auth` for upload signatures.
3. Enable Firestore (Native mode) and Storage.
4. Enable Authentication providers:
   - Google: enable and set app name/logo.
   - Facebook: enable with App ID/Secret from Facebook Developers; add OAuth redirect `https://<your-auth-domain>/__/auth/handler`.
   - LinkedIn: Firebase supports generic OAuth via `OAuthProvider('linkedin.com')`.

### LinkedIn as a Custom OAuth Provider (Firebase)

1. In Firebase Console → Authentication → Sign-in method → Add provider → Select "LinkedIn" or "Custom OAuth" and set:
   - Provider ID: `linkedin.com`
   - Client ID: set your `NEXT_PUBLIC_LINKEDIN_CLIENT_ID`
   - Client Secret: from LinkedIn Developer portal
   - Authorize redirect URI: `https://<your-auth-domain>/__/auth/handler`
2. In app code we use:
   ```js
   import { OAuthProvider, signInWithPopup } from 'firebase/auth'
   const provider = new OAuthProvider('linkedin.com')
   provider.addScope('r_liteprofile')
   provider.addScope('r_emailaddress')
   // Optionally: provider.setCustomParameters({ prompt: 'consent' })
   signInWithPopup(auth, provider)
   ```
3. If LinkedIn via Firebase is not available in your region/plan or causes issues, fallback:
   - Build a minimal OAuth code flow against LinkedIn (Authorization Code)
   - Exchange the LinkedIn access token in a Firebase Cloud Function for a Firebase Custom Token using the Firebase Admin SDK
   - Sign in to the client with `signInWithCustomToken`

> Note: You must configure LinkedIn App (redirect URI must match Firebase handler above). For local dev you can test with `http://localhost:3000/login` for client state and rely on popup handler.

## Admin Users and Security

- See `firestore.rules` for a sample policy; only admins can write to `/settings/*`.
- To seed an admin, create a document at `admins/{uid}` with any value. You can:
  - Use the script `scripts/seedAdmin.js` (requires Firebase Admin credentials), or
  - Manually create the doc in Firestore Console.

### Seed Admin via Script

1. Create a Firebase service account JSON and set env var `GOOGLE_APPLICATION_CREDENTIALS` to its path, or edit the script to pass the path.
2. Run:
   ```bash
   node scripts/seedAdmin.js <UID>
   ```

## Theme System

- CSS variables are defined in `app/globals.css` using the tokens:
  - `--primary: #C0DB11`
  - `--accent: #11D72D`
  - `--danger: #CE4233`
  - `--neutral-900: #0B0B0C`
  - `--neutral-700: #636257`
  - `--page: #F5F6EA`
  - `--card: #FFFFFF`
  - `--border: #E6E8D8`
  - `--muted1: #E9EEDB`
  - `--muted2: #D0D3B9`
  - `--radius-md: 8px`, `--radius-lg: 12px`
  - `--soft-shadow: 0 6px 18px rgba(12,15,20,0.06)`
- The `components/ThemeProvider.jsx` subscribes to Firestore `settings/theme` and updates these variables at runtime using `document.documentElement.style.setProperty(...)`.
- Tailwind consumes these via `tailwind.config.js` so classes like `bg-page`, `text-neutral-900`, `shadow-soft`, `rounded-lg` will reflect changes live.

### Editing Theme in Admin Panel

- Go to `/admin` as an admin; tweak colors and save. Changes persist to Firestore and reflect immediately across the app.

## Auth UI

- Use the Login page `/login` to sign in with Google, Facebook, or LinkedIn. Auth uses `signInWithPopup`.
- Protected pages use a client guard hook to redirect to `/login` if not authenticated.

## Scripts

- `scripts/seedAdmin.js`: create an `admins/{uid}` doc in Firestore.

## Roadmap / TODOs

- Task timer, calendar sync (Google Calendar), file uploads, richer insights and charts
- Offline caching, collaborative notes, mobile responsiveness refinements

## License

MIT
