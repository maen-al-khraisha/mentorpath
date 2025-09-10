#!/usr/bin/env node

const { initializeApp } = require('firebase/app')
const { getFirestore, doc, updateDoc, serverTimestamp } = require('firebase/firestore')

// Firebase configuration (you'll need to add your config here)
const firebaseConfig = {
  // Add your Firebase config here
  // You can find this in your Firebase project settings
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function resetSubscription(userId) {
  try {
    if (!userId) {
      console.error('❌ User ID is required')
      console.log('Usage: node scripts/resetSubscription.js <userId>')
      process.exit(1)
    }

    console.log(`🔄 Resetting subscription for user: ${userId}`)

    await updateDoc(doc(db, 'users', userId), {
      plan: 'free',
      status: 'active',
      paddleCustomerId: null,
      paddleSubscriptionId: null,
      subscriptionStartDate: null,
      subscriptionEndDate: null,
      trialEndDate: null,
      updatedAt: serverTimestamp(),
    })

    console.log('✅ Subscription reset successfully!')
    console.log('📝 User is now on the free plan')
    console.log('🧪 You can now test the upgrade flow again')
  } catch (error) {
    console.error('❌ Error resetting subscription:', error.message)
    process.exit(1)
  }
}

// Get user ID from command line arguments
const userId = process.argv[2]
resetSubscription(userId)
