import { NextResponse } from 'next/server'
import { PADDLE_CONFIG } from '@/lib/paddleApi'

// Test checkout session creation
export async function POST(request) {
  try {
    const { productId, customerEmail, customerId } = await request.json()

    if (!productId || !customerEmail || !customerId) {
      return NextResponse.json(
        { error: 'Missing required fields: productId, customerEmail, customerId' },
        { status: 400 }
      )
    }

    console.log('🧪 Test Checkout - Input:', {
      productId,
      customerEmail,
      customerId,
      apiKey: PADDLE_CONFIG.apiKey ? 'Set' : 'Missing',
      apiUrl: PADDLE_CONFIG.apiUrl,
    })

    // Create checkout session with Paddle API
    const checkoutData = {
      items: [
        {
          price_id: productId,
          quantity: 1,
        },
      ],
      customer: {
        email: customerEmail,
        custom_data: {
          user_id: customerId,
          test: true,
        },
      },
      custom_data: {
        user_id: customerId,
        test: true,
      },
      checkout_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?checkout=cancelled`,
    }

    console.log('🧪 Test Checkout - Request Data:', checkoutData)

    const response = await fetch(`${PADDLE_CONFIG.apiUrl}/checkout-sessions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PADDLE_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutData),
    })

    console.log('🧪 Test Checkout - Response Status:', response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('🧪 Test Checkout - Error:', errorData)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create checkout session',
          details: errorData,
          status: response.status,
          statusText: response.statusText,
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('🧪 Test Checkout - Success:', data)

    return NextResponse.json({
      success: true,
      checkoutUrl: data.data.checkout_url,
      checkoutId: data.data.id,
      expiresAt: data.data.expires_at,
      fullResponse: data,
    })
  } catch (error) {
    console.error('🧪 Test Checkout - Exception:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
