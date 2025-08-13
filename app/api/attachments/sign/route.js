export const runtime = 'nodejs'

import getSupabaseAdmin from '@/lib/supabaseAdmin'

const BUCKET = process.env.SUPABASE_BUCKET || 'attachments'
const SIGN_SECONDS = Number(process.env.SUPABASE_SIGNED_URL_SECONDS || 3600) // 1 hour default

export async function POST(req) {
  try {
    const { path } = await req.json()
    if (!path) {
      return new Response(JSON.stringify({ error: 'Missing path' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      })
    }
    const supabaseAdmin = getSupabaseAdmin()
    const signed = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(path, SIGN_SECONDS)
    if (signed.error) {
      return new Response(JSON.stringify({ error: signed.error.message }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      })
    }
    return new Response(JSON.stringify({ url: signed.data?.signedUrl || null }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err?.message || 'Failed to sign URL' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }
}
