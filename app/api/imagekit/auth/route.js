export const runtime = 'nodejs'

import crypto from 'crypto'

function generateToken() {
  try {
    return crypto.randomUUID()
  } catch {
    return crypto.randomBytes(16).toString('hex')
  }
}

function createSignature(privateKey, token, expire) {
  const hmac = crypto.createHmac('sha1', privateKey)
  hmac.update(token + expire)
  return hmac.digest('hex')
}

async function handle() {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY
  if (!privateKey) {
    return new Response(
      JSON.stringify({ error: 'IMAGEKIT_PRIVATE_KEY is not configured on the server.' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    )
  }
  const token = generateToken()
  const expire = Math.floor(Date.now() / 1000) + 30 * 60 // 30 minutes
  const signature = createSignature(privateKey, token, String(expire))
  return new Response(
    JSON.stringify({ token, expire, signature }),
    { status: 200, headers: { 'content-type': 'application/json' } }
  )
}

export async function GET() {
  return handle()
}

export async function POST() {
  return handle()
}


