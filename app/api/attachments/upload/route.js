export const runtime = 'nodejs'

import getSupabaseAdmin from '@/lib/supabaseAdmin'

const BUCKET = process.env.SUPABASE_BUCKET || 'attachments'
const MAX_BYTES = Number(process.env.SUPABASE_MAX_FILE_BYTES || 6 * 1024 * 1024) // 6MB default
const SIGN_SECONDS = Number(process.env.SUPABASE_SIGNED_URL_SECONDS || 3600) // 1 hour default

const ALLOWED_MIME_PREFIXES = ['image/']
const ALLOWED_MIME_EXACT = ['text/plain']

function isMimeAllowed(mime) {
  if (!mime) return false
  if (ALLOWED_MIME_EXACT.includes(mime)) return true
  return ALLOWED_MIME_PREFIXES.some((p) => mime.startsWith(p))
}

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_')
}

export async function POST(req) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return new Response(
        JSON.stringify({ error: 'Supabase server credentials are not configured.' }),
        {
          status: 500,
          headers: { 'content-type': 'application/json' },
        }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file')
    const taskId = String(formData.get('taskId') || '')

    if (!file || !taskId) {
      return new Response(JSON.stringify({ error: 'Missing file or taskId' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      })
    }

    const fileSize = Number(file.size || 0)
    const contentType = file.type || 'application/octet-stream'

    if (fileSize <= 0) {
      return new Response(JSON.stringify({ error: 'Empty file' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      })
    }

    if (fileSize > MAX_BYTES) {
      return new Response(
        JSON.stringify({
          error: `File too large. Max ${(MAX_BYTES / (1024 * 1024)).toFixed(1)}MB`,
        }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      )
    }

    if (!isMimeAllowed(contentType)) {
      return new Response(
        JSON.stringify({ error: 'Unsupported file type. Allowed: images and plain text.' }),
        { status: 415, headers: { 'content-type': 'application/json' } }
      )
    }

    const prefix = `tasks/${taskId}`
    const supabaseAdmin = getSupabaseAdmin()
    const listResp = await supabaseAdmin.storage.from(BUCKET).list(prefix, { limit: 100 })
    if (listResp.error && listResp.error.message !== 'The resource was not found') {
      return new Response(JSON.stringify({ error: listResp.error.message }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      })
    }

    const existingFiles = Array.isArray(listResp.data) ? listResp.data : []
    if (existingFiles.length >= 3) {
      return new Response(JSON.stringify({ error: 'Attachment limit reached (max 3 per task)' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      })
    }

    const originalName = String(file.name || 'file')
    const sanitized = sanitizeFilename(originalName)
    let finalName = sanitized
    if (existingFiles.some((f) => f.name === sanitized)) {
      const parts = sanitized.split('.')
      const base = parts.slice(0, -1).join('.') || sanitized
      const ext = parts.length > 1 ? `.${parts[parts.length - 1]}` : ''
      finalName = `${base}-${Date.now()}${ext}`
    }

    const objectPath = `${prefix}/${finalName}`

    // Use ArrayBuffer body for Supabase upload
    const arrayBuffer = await file.arrayBuffer()
    const uploadResp = await supabaseAdmin.storage.from(BUCKET).upload(objectPath, arrayBuffer, {
      contentType,
      cacheControl: '3600',
      upsert: false,
    })

    if (uploadResp.error) {
      return new Response(JSON.stringify({ error: uploadResp.error.message }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      })
    }

    const signed = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUrl(objectPath, SIGN_SECONDS)
    if (signed.error) {
      return new Response(JSON.stringify({ error: signed.error.message }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      })
    }

    return new Response(
      JSON.stringify({
        name: finalName,
        path: objectPath,
        url: signed.data?.signedUrl || null,
        contentType,
        size: fileSize,
      }),
      { status: 200, headers: { 'content-type': 'application/json' } }
    )
  } catch (err) {
    return new Response(JSON.stringify({ error: err?.message || 'Upload failed' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }
}
