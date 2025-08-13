# LinkedIn OAuth via Firebase Custom Provider

1. In Firebase Console → Authentication → Sign-in method, add provider `linkedin.com` (Custom OAuth if LinkedIn is not directly listed in your console variant).
2. Set Client ID/Secret from LinkedIn Developer Portal.
3. Set redirect URI to `https://<your-auth-domain>/__/auth/handler`.
4. In the app, use:

```js
import { OAuthProvider, signInWithPopup } from 'firebase/auth'
const provider = new OAuthProvider('linkedin.com')
provider.addScope('r_liteprofile')
provider.addScope('r_emailaddress')
await signInWithPopup(auth, provider)
```

Fallback: Use a Cloud Function to exchange LinkedIn token for a Firebase Custom Token if needed.
