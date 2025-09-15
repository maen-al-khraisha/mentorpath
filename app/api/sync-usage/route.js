import { syncUsageWithActualCount } from '@/lib/subscriptionApi'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const syncedCounts = await syncUsageWithActualCount(userId)

    return NextResponse.json({
      success: true,
      message: 'Usage count synced successfully',
      counts: syncedCounts,
    })
  } catch (error) {
    console.error('Error syncing usage:', error)
    return NextResponse.json(
      {
        error: 'Failed to sync usage count',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
