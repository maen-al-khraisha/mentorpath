import { NextResponse } from 'next/server'
import { PADDLE_CONFIG } from '@/lib/paddleApi'

// Simple checkout redirect using Paddle's hosted checkout
export async function POST(request) {
  try {
    const { productId, customerEmail, customerId, customData = {} } = await request.json()

    if (!productId || !customerEmail || !customerId) {
      return NextResponse.json(
        { error: 'Missing required fields: productId, customerEmail, customerId' },
        { status: 400 }
      )
    }

    // Create a simple checkout URL using Paddle's hosted checkout
    // This bypasses the API issues and uses Paddle's direct checkout
    const baseUrl =
      PADDLE_CONFIG.environment === 'production'
        ? 'https://checkout.paddle.com'
        : 'https://sandbox-checkout.paddle.com'

    // Build the checkout URL with parameters
    // Note: Paddle requires vendor ID for hosted checkout
    const vendorId = process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID || PADDLE_CONFIG.clientId

    const params = new URLSearchParams({
      vendor: vendorId,
      product: productId,
      email: customerEmail,
      customer_id: customerId,
      custom_data: JSON.stringify({
        user_id: customerId,
        ...customData,
      }),
      success_url: `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}/billing?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}/billing?checkout=cancelled`,
    })

    const checkoutUrl = `${baseUrl}/checkout?${params.toString()}`

    console.log('🚀 Simple checkout URL:', checkoutUrl)

    return NextResponse.json({
      success: true,
      checkoutUrl,
      message: 'Redirecting to Paddle checkout',
    })
  } catch (error) {
    console.error('Error creating simple checkout:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
