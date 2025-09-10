import { NextResponse } from 'next/server'

// Debug endpoint to check production environment variables
export async function GET() {
  try {
    // Only allow this in development or with a secret key
    const secretKey = process.env.DEBUG_SECRET_KEY || 'debug'
    const providedKey = new URLSearchParams(new URL(request.url).search).get('key')

    if (providedKey !== secretKey) {
      return NextResponse.json(
        { error: 'Unauthorized. Provide ?key=debug to access this endpoint.' },
        { status: 401 }
      )
    }

    // Check Paddle-related environment variables
    const paddleEnvVars = {
      // Client-side variables (NEXT_PUBLIC_)
      NEXT_PUBLIC_PADDLE_CLIENT_ID: process.env.NEXT_PUBLIC_PADDLE_CLIENT_ID,
      NEXT_PUBLIC_PADDLE_ENVIRONMENT: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT,
      NEXT_PUBLIC_PADDLE_PRO_MONTHLY_ID: process.env.NEXT_PUBLIC_PADDLE_PRO_MONTHLY_ID,
      NEXT_PUBLIC_PADDLE_VENDOR_ID: process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,

      // Server-side variables
      PADDLE_API_KEY: process.env.PADDLE_API_KEY ? '***SET***' : 'MISSING',
      PADDLE_WEBHOOK_SECRET: process.env.PADDLE_WEBHOOK_SECRET ? '***SET***' : 'MISSING',

      // Other relevant variables
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
    }

    return NextResponse.json({
      success: true,
      message: 'Production environment variables check',
      environment: paddleEnvVars,
      missingVariables: Object.entries(paddleEnvVars)
        .filter(([key, value]) => !value || value === 'MISSING')
        .map(([key]) => key),
      recommendations: [
        'Set NEXT_PUBLIC_PADDLE_PRO_MONTHLY_ID in your production environment',
        'Ensure all NEXT_PUBLIC_ variables are set for client-side access',
        'Verify PADDLE_API_KEY and PADDLE_WEBHOOK_SECRET are set for server-side operations',
      ],
    })
  } catch (error) {
    console.error('Error checking environment variables:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
