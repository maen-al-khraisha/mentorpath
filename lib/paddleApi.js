// Paddle integration for billing
import { initializePaddle as initPaddle, getPaddleInstance } from '@paddle/paddle-js'
import {
  PaymentError,
  PAYMENT_ERROR_CODES,
  handlePaymentError,
  retryPaymentOperation,
} from './paymentErrors'

export const PADDLE_CONFIG = {
  // Paddle environment (sandbox or production)
  environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox',

  // Paddle client ID
  clientId: process.env.NEXT_PUBLIC_PADDLE_CLIENT_ID,

  // Paddle API key for server-side operations
  apiKey: process.env.PADDLE_API_KEY,

  // Webhook secret for signature verification
  webhookSecret: process.env.PADDLE_WEBHOOK_SECRET,

  // Product IDs for different plans
  products: {
    pro_monthly: process.env.NEXT_PUBLIC_PADDLE_PRO_MONTHLY_ID,
    pro_yearly: process.env.NEXT_PUBLIC_PADDLE_PRO_YEARLY_ID,
  },

  // Paddle checkout URL
  checkoutUrl:
    process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'production'
      ? 'https://checkout.paddle.com'
      : 'https://sandbox-checkout.paddle.com',

  // Paddle API base URL
  apiUrl:
    process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'production'
      ? 'https://api.paddle.com/v2'
      : 'https://sandbox-api.paddle.com/v2',
}

// Initialize Paddle SDK
export function initializePaddle() {
  if (typeof window === 'undefined') {
    return null
  }

  if (PADDLE_CONFIG.clientId) {
    return initPaddle({
      environment: PADDLE_CONFIG.environment,
      token: PADDLE_CONFIG.clientId,
    })
  }

  return null
}

// Get Paddle instance
export function getPaddle() {
  if (typeof window === 'undefined') {
    return null
  }

  return getPaddleInstance()
}

// Create Paddle checkout session
export async function createCheckoutSession(productId, customerEmail, customerId, customData = {}) {
  // Validate required parameters
  if (!productId) {
    throw new PaymentError('Product ID is required', PAYMENT_ERROR_CODES.INVALID_PRODUCT_ID)
  }

  if (!customerEmail || !customerId) {
    throw new PaymentError(
      'Customer email and ID are required',
      PAYMENT_ERROR_CODES.MISSING_CUSTOMER_DATA
    )
  }

  return retryPaymentOperation(async () => {
    try {
      const response = await fetch('/api/paddle/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          customerEmail,
          customerId,
          customData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new PaymentError(
          `Checkout creation failed: ${response.statusText}`,
          PAYMENT_ERROR_CODES.CHECKOUT_CREATION_FAILED,
          errorData
        )
      }

      const data = await response.json()

      if (!data.success) {
        throw new PaymentError(
          data.error || 'Checkout creation failed',
          PAYMENT_ERROR_CODES.CHECKOUT_CREATION_FAILED,
          data
        )
      }

      return data
    } catch (error) {
      if (error instanceof PaymentError) {
        throw error
      }

      throw new PaymentError(
        error.message || 'Failed to create checkout session',
        PAYMENT_ERROR_CODES.PADDLE_API_ERROR,
        error
      )
    }
  })
}

// Initialize Paddle checkout (legacy function for backward compatibility)
export function initializePaddleCheckout(productId, customerEmail, customerId) {
  return createCheckoutSession(productId, customerEmail, customerId)
}

// Handle Paddle webhook (to be implemented in API route)
export async function handlePaddleWebhook(webhookData) {
  // This would be implemented in an API route like /api/paddle/webhook
  // It would:
  // 1. Verify the webhook signature
  // 2. Update user subscription status
  // 3. Handle subscription lifecycle events

  const { event_type, data } = webhookData

  switch (event_type) {
    case 'subscription.created':
      // Handle new subscription
      await updateUserSubscription(data.subscription_id, 'active')
      break

    case 'subscription.updated':
      // Handle subscription updates
      await updateUserSubscription(data.subscription_id, 'active')
      break

    case 'subscription.cancelled':
      // Handle subscription cancellation
      await updateUserSubscription(data.subscription_id, 'cancelled')
      break

    case 'subscription.paused':
      // Handle subscription pause
      await updateUserSubscription(data.subscription_id, 'paused')
      break

    default:
      console.log('Unhandled webhook event:', event_type)
  }
}

// Update user subscription based on Paddle data
async function updateUserSubscription(subscriptionId, status) {
  // This would update the user's subscription in your database
  // Implementation depends on your database structure

  try {
    // Find user by subscription ID and update their plan
    // This is a simplified example
    console.log(`Updating subscription ${subscriptionId} to status: ${status}`)
  } catch (error) {
    console.error('Error updating subscription:', error)
  }
}

// Get subscription details from Paddle
export async function getPaddleSubscription(subscriptionId) {
  try {
    const response = await fetch(`/api/paddle/subscription/${subscriptionId}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch subscription: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return null
  }
}

// Cancel subscription
export async function cancelPaddleSubscription(subscriptionId) {
  try {
    const response = await fetch(`/api/paddle/subscription/${subscriptionId}/cancel`, {
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error(`Failed to cancel subscription: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw error
  }
}

// Pause subscription
export async function pausePaddleSubscription(subscriptionId) {
  try {
    const response = await fetch(`/api/paddle/subscription/${subscriptionId}/pause`, {
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error(`Failed to pause subscription: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error pausing subscription:', error)
    throw error
  }
}

// Resume subscription
export async function resumePaddleSubscription(subscriptionId) {
  try {
    const response = await fetch(`/api/paddle/subscription/${subscriptionId}/resume`, {
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error(`Failed to resume subscription: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error resuming subscription:', error)
    throw error
  }
}

// Get customer details from Paddle
export async function getPaddleCustomer(customerId) {
  try {
    const response = await fetch(`/api/paddle/customer/${customerId}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch customer: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching customer:', error)
    return null
  }
}
