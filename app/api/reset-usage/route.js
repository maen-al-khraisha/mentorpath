import { NextResponse } from 'next/server'
import { firestore } from '@/lib/firebaseClient'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

export async function POST(request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Reset usage for current month
    const now = new Date()
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const usageRef = doc(firestore, 'usage', `${userId}-${monthKey}`)

    const resetUsageData = {
      userId,
      month: monthKey,
      tasks: 0,
      notes: 0,
      habits: 0,
      events: 0,
      sheets: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    await setDoc(usageRef, resetUsageData)

    return NextResponse.json({
      success: true,
      message: 'Usage count reset successfully',
      monthKey,
    })
  } catch (error) {
    console.error('Error resetting usage:', error)
    return NextResponse.json({ error: 'Failed to reset usage' }, { status: 500 })
  }
}
