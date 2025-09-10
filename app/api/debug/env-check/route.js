import { NextResponse } from 'next/server'
import { PADDLE_CONFIG } from '@/lib/paddleApi'

// Check server-side environment variables
export async function GET() {
  try {
    const envCheck = {
      // Server-side environment variables
      serverEnvVars: {
        paddleEnvironment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || '❌ Missing',
        paddleClientId: process.env.NEXT_PUBLIC_PADDLE_CLIENT_ID ? '✅ Set' : '❌ Missing',
        paddleApiKey: process.env.PADDLE_API_KEY ? '✅ Set' : '❌ Missing',
        paddleWebhookSecret: process.env.PADDLE_WEBHOOK_SECRET ? '✅ Set' : '❌ Missing',
        paddleMonthlyProductId: process.env.NEXT_PUBLIC_PADDLE_PRO_MONTHLY_ID
          ? '✅ Set'
          : '❌ Missing',
        paddleYearlyProductId: process.env.NEXT_PUBLIC_PADDLE_PRO_YEARLY_ID
          ? '✅ Set'
          : '❌ Missing',
        appUrl: process.env.NEXT_PUBLIC_APP_URL || '❌ Missing',
      },

      // Paddle configuration object
      paddleConfig: {
        environment: PADDLE_CONFIG.environment,
        clientId: PADDLE_CONFIG.clientId ? '✅ Set' : '❌ Missing',
        apiKey: PADDLE_CONFIG.apiKey ? '✅ Set' : '❌ Missing',
        webhookSecret: PADDLE_CONFIG.webhookSecret ? '✅ Set' : '❌ Missing',
        apiUrl: PADDLE_CONFIG.apiUrl,
        checkoutUrl: PADDLE_CONFIG.checkoutUrl,
        monthlyProductId: PADDLE_CONFIG.products.pro_monthly || '❌ Missing',
        yearlyProductId: PADDLE_CONFIG.products.pro_yearly || '❌ Missing',
      },

      // Test API connectivity
      apiTest: await testPaddleApi(),
    }

    return NextResponse.json({
      success: true,
      ...envCheck,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}

// Test Paddle API connectivity
async function testPaddleApi() {
  try {
    if (!PADDLE_CONFIG.apiKey) {
      return {
        status: '❌ Skipped',
        reason: 'No API key configured',
      }
    }

    // Test with a simple API call (list products)
    const response = await fetch(`${PADDLE_CONFIG.apiUrl}/products`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${PADDLE_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()
      return {
        status: '✅ Connected',
        message: `Found ${data.data?.length || 0} products`,
        apiUrl: PADDLE_CONFIG.apiUrl,
      }
    } else {
      const errorData = await response.json().catch(() => ({}))
      return {
        status: '❌ Failed',
        error: `HTTP ${response.status}: ${response.statusText}`,
        details: errorData,
      }
    }
  } catch (error) {
    return {
      status: '❌ Error',
      error: error.message,
    }
  }
}
