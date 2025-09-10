import { NextResponse } from 'next/server'
import { PADDLE_CONFIG } from '@/lib/paddleApi'

// Create Paddle checkout session
export async function POST(request) {
  try {
    const { productId, customerEmail, customerId, customData = {} } = await request.json()

    if (!productId || !customerEmail || !customerId) {
      return NextResponse.json(
        { error: 'Missing required fields: productId, customerEmail, customerId' },
        { status: 400 }
      )
    }

    // Create checkout session with Paddle API v2
    const checkoutData = {
      items: [
        {
          priceId: productId,
          quantity: 1,
        },
      ],
      customer: {
        email: customerEmail,
        customData: {
          user_id: customerId,
          ...customData,
        },
      },
      customData: {
        user_id: customerId,
        ...customData,
      },
      checkoutUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing?checkout=success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing?checkout=cancelled`,
    }

    const response = await fetch(`${PADDLE_CONFIG.apiUrl}/checkout-sessions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PADDLE_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Paddle API error:', errorData)
      return NextResponse.json(
        { error: 'Failed to create checkout session', details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      checkoutUrl: data.data.checkout_url,
      checkoutId: data.data.id,
      expiresAt: data.data.expires_at,
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
