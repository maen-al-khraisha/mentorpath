// Payment error handling utilities

export class PaymentError extends Error {
  constructor(message, code, details = null) {
    super(message)
    this.name = 'PaymentError'
    this.code = code
    this.details = details
  }
}

export const PAYMENT_ERROR_CODES = {
  CHECKOUT_CREATION_FAILED: 'CHECKOUT_CREATION_FAILED',
  INVALID_PRODUCT_ID: 'INVALID_PRODUCT_ID',
  MISSING_CUSTOMER_DATA: 'MISSING_CUSTOMER_DATA',
  PADDLE_API_ERROR: 'PADDLE_API_ERROR',
  WEBHOOK_VERIFICATION_FAILED: 'WEBHOOK_VERIFICATION_FAILED',
  SUBSCRIPTION_NOT_FOUND: 'SUBSCRIPTION_NOT_FOUND',
  SUBSCRIPTION_UPDATE_FAILED: 'SUBSCRIPTION_UPDATE_FAILED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INVALID_RESPONSE: 'INVALID_RESPONSE',
}

export function handlePaymentError(error) {
  console.error('Payment error:', error)

  // Handle different types of errors
  if (error instanceof PaymentError) {
    return {
      message: error.message,
      code: error.code,
      details: error.details,
      userMessage: getUserFriendlyMessage(error.code),
    }
  }

  // Handle network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return {
      message: 'Network error occurred',
      code: PAYMENT_ERROR_CODES.NETWORK_ERROR,
      userMessage:
        'Unable to connect to payment service. Please check your internet connection and try again.',
    }
  }

  // Handle API errors
  if (error.response) {
    return {
      message: error.response.data?.message || 'API error occurred',
      code: PAYMENT_ERROR_CODES.PADDLE_API_ERROR,
      details: error.response.data,
      userMessage: 'Payment service error. Please try again or contact support.',
    }
  }

  // Default error
  return {
    message: error.message || 'Unknown error occurred',
    code: 'UNKNOWN_ERROR',
    userMessage: 'An unexpected error occurred. Please try again or contact support.',
  }
}

export function getUserFriendlyMessage(errorCode) {
  const messages = {
    [PAYMENT_ERROR_CODES.CHECKOUT_CREATION_FAILED]:
      'Unable to start checkout process. Please try again.',
    [PAYMENT_ERROR_CODES.INVALID_PRODUCT_ID]:
      'Invalid product selected. Please refresh the page and try again.',
    [PAYMENT_ERROR_CODES.MISSING_CUSTOMER_DATA]:
      'Missing customer information. Please ensure you are logged in.',
    [PAYMENT_ERROR_CODES.PADDLE_API_ERROR]:
      'Payment service temporarily unavailable. Please try again in a few minutes.',
    [PAYMENT_ERROR_CODES.WEBHOOK_VERIFICATION_FAILED]:
      'Payment verification failed. Please contact support.',
    [PAYMENT_ERROR_CODES.SUBSCRIPTION_NOT_FOUND]: 'Subscription not found. Please contact support.',
    [PAYMENT_ERROR_CODES.SUBSCRIPTION_UPDATE_FAILED]:
      'Unable to update subscription. Please try again.',
    [PAYMENT_ERROR_CODES.NETWORK_ERROR]:
      'Network error. Please check your connection and try again.',
    [PAYMENT_ERROR_CODES.INVALID_RESPONSE]:
      'Invalid response from payment service. Please try again.',
  }

  return messages[errorCode] || 'An unexpected error occurred. Please try again or contact support.'
}

export function logPaymentError(error, context = {}) {
  const errorInfo = handlePaymentError(error)

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Payment Error Details:', {
      ...errorInfo,
      context,
      stack: error.stack,
    })
  }

  // In production, you might want to send this to an error tracking service
  // Example: Sentry.captureException(error, { extra: { ...errorInfo, context } })

  return errorInfo
}

export function isRetryableError(error) {
  const retryableCodes = [PAYMENT_ERROR_CODES.NETWORK_ERROR, PAYMENT_ERROR_CODES.PADDLE_API_ERROR]

  return (
    retryableCodes.includes(error.code) ||
    (error.name === 'TypeError' && error.message.includes('fetch'))
  )
}

export async function retryPaymentOperation(operation, maxRetries = 3, delay = 1000) {
  let lastError

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error

      if (!isRetryableError(error) || attempt === maxRetries) {
        throw error
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay * attempt))
    }
  }

  throw lastError
}
