import { NextResponse } from 'next/server'
import { PADDLE_CONFIG } from '@/lib/paddleApi'

// Cancel subscription
export async function POST(request, { params }) {
  try {
    const { subscriptionId } = params

    if (!subscriptionId) {
      return NextResponse.json({ error: 'Subscription ID is required' }, { status: 400 })
    }

    const response = await fetch(`${PADDLE_CONFIG.apiUrl}/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PADDLE_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Paddle API error:', errorData)
      return NextResponse.json(
        { error: 'Failed to cancel subscription', details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data.data)
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
