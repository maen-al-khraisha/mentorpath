import { NextResponse } from 'next/server'

// Test webhook endpoint to verify connectivity
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Webhook endpoint is accessible',
    timestamp: new Date().toISOString(),
    notificationSetId: 'ntfset_01k4qvc70wqrh6ggwmwcy4kj68',
  })
}

export async function POST(request) {
  try {
    const body = await request.json()

    return NextResponse.json({
      success: true,
      message: 'Test webhook received',
      receivedData: body,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid JSON payload',
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    )
  }
}
