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

// Paddle webhook handler for subscription events
export async function POST(request) {
  try {
    const body = await request.json()
    const { event_type, data } = body

    console.log('Paddle webhook received:', { event_type, data })

    // Verify webhook signature (implement proper verification in production)
    // const signature = request.headers.get('paddle-signature')
    // if (!verifyPaddleSignature(body, signature)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }

    switch (event_type) {
      case 'subscription.created':
        await handleSubscriptionCreated(data)
        break

      case 'subscription.updated':
        await handleSubscriptionUpdated(data)
        break

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(data)
        break

      case 'subscription.paused':
        await handleSubscriptionPaused(data)
        break

      case 'subscription.resumed':
        await handleSubscriptionResumed(data)
        break

      case 'payment.succeeded':
        await handlePaymentSucceeded(data)
        break

      case 'payment.failed':
        await handlePaymentFailed(data)
        break

      default:
        console.log('Unhandled webhook event:', event_type)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing Paddle webhook:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Handle new subscription creation
async function handleSubscriptionCreated(data) {
  const { subscription_id, customer_id, status, next_billing_date } = data

  try {
    // Find user by Paddle customer ID
    const userQuery = query(
      collection(firestore, 'users'),
      where('paddleCustomerId', '==', customer_id)
    )

    const userSnapshot = await getDocs(userQuery)

    if (!userSnapshot.empty) {
      const userDoc = userSnapshot.docs[0]
      const userData = userDoc.data()

      // Update user to Pro plan
      await updateDoc(doc(firestore, 'users', userDoc.id), {
        plan: 'pro',
        status: 'active',
        paddleSubscriptionId: subscription_id,
        subscriptionStartDate: new Date(),
        subscriptionEndDate: next_billing_date ? new Date(next_billing_date) : null,
        updatedAt: serverTimestamp(),
      })

      console.log(`User ${userData.email} upgraded to Pro plan`)
    } else {
      console.log(`No user found with Paddle customer ID: ${customer_id}`)
    }
  } catch (error) {
    console.error('Error handling subscription created:', error)
  }
}

// Handle subscription updates
async function handleSubscriptionUpdated(data) {
  const { subscription_id, customer_id, status, next_billing_date } = data

  try {
    // Find user by Paddle customer ID
    const userQuery = query(
      collection(firestore, 'users'),
      where('paddleCustomerId', '==', customer_id)
    )

    const userSnapshot = await getDocs(userQuery)

    if (!userSnapshot.empty) {
      const userDoc = userSnapshot.docs[0]

      // Update subscription status
      await updateDoc(doc(firestore, 'users', userDoc.id), {
        status: status === 'active' ? 'active' : 'inactive',
        subscriptionEndDate: next_billing_date ? new Date(next_billing_date) : null,
        updatedAt: serverTimestamp(),
      })

      console.log(`Subscription ${subscription_id} updated for user ${userDoc.id}`)
    }
  } catch (error) {
    console.error('Error handling subscription updated:', error)
  }
}

// Handle subscription cancellation
async function handleSubscriptionCancelled(data) {
  const { subscription_id, customer_id } = data

  try {
    // Find user by Paddle customer ID
    const userQuery = query(
      collection(firestore, 'users'),
      where('paddleCustomerId', '==', customer_id)
    )

    const userSnapshot = await getDocs(userQuery)

    if (!userSnapshot.empty) {
      const userDoc = userSnapshot.docs[0]

      // Downgrade user to Free plan
      await updateDoc(doc(firestore, 'users', userDoc.id), {
        plan: 'free',
        status: 'inactive',
        paddleSubscriptionId: null,
        subscriptionEndDate: new Date(),
        updatedAt: serverTimestamp(),
      })

      console.log(`User ${userDoc.id} downgraded to Free plan`)
    }
  } catch (error) {
    console.error('Error handling subscription cancelled:', error)
  }
}

// Handle subscription pause
async function handleSubscriptionPaused(data) {
  const { subscription_id, customer_id } = data

  try {
    // Find user by Paddle customer ID
    const userQuery = query(
      collection(firestore, 'users'),
      where('paddleCustomerId', '==', customer_id)
    )

    const userSnapshot = await getDocs(userQuery)

    if (!userSnapshot.empty) {
      const userDoc = userSnapshot.docs[0]

      // Mark subscription as paused
      await updateDoc(doc(firestore, 'users', userDoc.id), {
        status: 'paused',
        updatedAt: serverTimestamp(),
      })

      console.log(`Subscription ${subscription_id} paused for user ${userDoc.id}`)
    }
  } catch (error) {
    console.error('Error handling subscription paused:', error)
  }
}

// Handle subscription resume
async function handleSubscriptionResumed(data) {
  const { subscription_id, customer_id } = data

  try {
    // Find user by Paddle customer ID
    const userQuery = query(
      collection(firestore, 'users'),
      where('paddleCustomerId', '==', customer_id)
    )

    const userSnapshot = await getDocs(userQuery)

    if (!userSnapshot.empty) {
      const userDoc = userSnapshot.docs[0]

      // Reactivate subscription
      await updateDoc(doc(firestore, 'users', userDoc.id), {
        status: 'active',
        updatedAt: serverTimestamp(),
      })

      console.log(`Subscription ${subscription_id} resumed for user ${userDoc.id}`)
    }
  } catch (error) {
    console.error('Error handling subscription resumed:', error)
  }
}

// Handle successful payment
async function handlePaymentSucceeded(data) {
  const { subscription_id, customer_id, amount, currency } = data

  try {
    // Log successful payment
    console.log(`Payment succeeded: ${amount} ${currency} for subscription ${subscription_id}`)

    // You can add payment logging here if needed
    // await addPaymentLog(data)
  } catch (error) {
    console.error('Error handling payment succeeded:', error)
  }
}

// Handle failed payment
async function handlePaymentFailed(data) {
  const { subscription_id, customer_id, amount, currency, failure_reason } = data

  try {
    console.log(
      `Payment failed: ${amount} ${currency} for subscription ${subscription_id}. Reason: ${failure_reason}`
    )

    // Find user and mark subscription as having payment issues
    const userQuery = query(
      collection(firestore, 'users'),
      where('paddleCustomerId', '==', customer_id)
    )

    const userSnapshot = await getDocs(userQuery)

    if (!userSnapshot.empty) {
      const userDoc = userSnapshot.docs[0]

      await updateDoc(doc(firestore, 'users', userDoc.id), {
        status: 'payment_failed',
        updatedAt: serverTimestamp(),
      })

      console.log(`User ${userDoc.id} marked as payment failed`)
    }
  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}

// Verify Paddle webhook signature (implement in production)
function verifyPaddleSignature(payload, signature) {
  // TODO: Implement proper signature verification
  // This should verify the webhook signature using Paddle's public key
  // For now, we'll return true (implement proper verification)
  return true
}
