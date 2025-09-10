import { NextResponse } from 'next/server'
import { firestore } from '@/lib/firebaseClient'
import {
  doc,
  updateDoc,
  serverTimestamp,
  query,
  collection,
  where,
  getDocs,
} from 'firebase/firestore'

// Reset user subscription for testing
export async function POST(request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Reset user to free plan
    await updateDoc(doc(firestore, 'users', userId), {
      plan: 'free',
      status: 'active',
      paddleCustomerId: null,
      paddleSubscriptionId: null,
      subscriptionStartDate: null,
      subscriptionEndDate: null,
      trialEndDate: null,
      updatedAt: serverTimestamp(),
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription reset to free plan',
      userId,
    })
  } catch (error) {
    console.error('Error resetting subscription:', error)
    return NextResponse.json({ error: 'Failed to reset subscription' }, { status: 500 })
  }
}

// Get all users with Pro subscriptions (for testing)
export async function GET() {
  try {
    const usersQuery = query(collection(firestore, 'users'), where('plan', '==', 'pro'))

    const usersSnapshot = await getDocs(usersQuery)
    const proUsers = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json({
      success: true,
      proUsers,
      count: proUsers.length,
    })
  } catch (error) {
    console.error('Error fetching pro users:', error)
    return NextResponse.json({ error: 'Failed to fetch pro users' }, { status: 500 })
  }
}
