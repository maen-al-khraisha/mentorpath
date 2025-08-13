import { createClient } from '@supabase/supabase-js'

let cachedAdmin = null

export function getSupabaseAdmin() {
  if (cachedAdmin) return cachedAdmin
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !/^https?:\/\//.test(url)) {
    throw new Error('Invalid or missing NEXT_PUBLIC_SUPABASE_URL')
  }
  if (!key) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  }
  cachedAdmin = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
  return cachedAdmin
}

export default getSupabaseAdmin
