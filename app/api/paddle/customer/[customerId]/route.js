import { NextResponse } from 'next/server'
import { PADDLE_CONFIG } from '@/lib/paddleApi'

// Get customer details
export async function GET(request, { params }) {
  try {
    const { customerId } = params

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 })
    }

    const response = await fetch(`${PADDLE_CONFIG.apiUrl}/customers/${customerId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${PADDLE_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Paddle API error:', errorData)
      return NextResponse.json(
        { error: 'Failed to fetch customer', details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data.data)
  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
