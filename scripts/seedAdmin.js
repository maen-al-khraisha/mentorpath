#!/usr/bin/env node

const { initializeApp } = require('firebase/app')
const { getFirestore, doc, setDoc, getDoc } = require('firebase/firestore')
require('dotenv').config({ path: '.env.local' })

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function seedAdmin() {
  try {
    console.log('🌱 Starting admin user seeding...')

    // Check if environment variables are set
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      console.error('❌ Firebase environment variables not found!')
      console.log('Please create a .env.local file with your Firebase configuration.')
      process.exit(1)
    }

    // Admin user data - UPDATE THIS EMAIL TO YOUR EMAIL
    const adminUser = {
      id: 'admin-user-001', // You can change this to any unique ID
      email: 'maen@mentorpath.com', // ← CHANGE THIS TO YOUR EMAIL
      name: 'Admin User',
      role: 'admin',
      subscription_status: 'active',
      task_limit: 1000,
      habit_limit: 100,
      sheet_limit: 50,
      created_at: new Date(),
      updated_at: new Date(),
    }

    console.log('📧 Admin email:', adminUser.email)
    console.log('⚠️  Make sure to update this email in the script if needed!')

    // Check if admin user already exists
    const existingAdmin = await getDoc(doc(db, 'users', adminUser.id))

    if (existingAdmin.exists()) {
      console.log('⚠️  Admin user already exists!')
      console.log('Existing admin data:', existingAdmin.data())
      return
    }

    // Create admin user
    await setDoc(doc(db, 'users', adminUser.id), adminUser)
    console.log('✅ Admin user created successfully!')
    console.log('Admin user details:', adminUser)

    // Create default app settings
    const defaultSettings = {
      trial: {
        default_duration_days: 7,
        max_extensions: 1,
      },
      limits: {
        default_task_limit: 50,
        default_habit_limit: 10,
        default_sheet_limit: 5,
        max_task_limit: 1000,
        max_habit_limit: 100,
        max_sheet_limit: 50,
      },
      features: {
        enable_analytics: true,
        enable_export: true,
        enable_sharing: true,
        enable_backup: true,
      },
      security: {
        max_login_attempts: 5,
        session_timeout_minutes: 60,
        require_email_verification: true,
        enable_two_factor: false,
      },
      created_at: new Date(),
      updated_at: new Date(),
    }

    await setDoc(doc(db, 'settings', 'app'), defaultSettings)
    console.log('✅ Default app settings created successfully!')

    // Create default packages
    const defaultPackages = [
      {
        id: 'free-tier',
        name: 'Free Tier',
        price: 0,
        trial_period_days: 0,
        task_limit: 10,
        habit_limit: 3,
        sheet_limit: 2,
        description: 'Basic features for getting started',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'basic-plan',
        name: 'Basic Plan',
        price: 9.99,
        trial_period_days: 7,
        task_limit: 100,
        habit_limit: 20,
        sheet_limit: 10,
        description: 'Perfect for individual users and small teams',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'pro-plan',
        name: 'Pro Plan',
        price: 19.99,
        trial_period_days: 14,
        task_limit: 500,
        habit_limit: 50,
        sheet_limit: 25,
        description: 'Advanced features for power users and growing teams',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 49.99,
        trial_period_days: 30,
        task_limit: 1000,
        habit_limit: 100,
        sheet_limit: 50,
        description: 'Unlimited features for large organizations',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]

    for (const pkg of defaultPackages) {
      await setDoc(doc(db, 'packages', pkg.id), pkg)
    }
    console.log('✅ Default packages created successfully!')

    console.log('🎉 Seeding completed successfully!')
    console.log('\n📋 Next steps:')
    console.log('1. Sign up with the admin email:', adminUser.email)
    console.log('2. Navigate to /admin to access the admin panel')
    console.log('3. The user will automatically have admin privileges')
  } catch (error) {
    console.error('❌ Error seeding admin user:', error)
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Check that your .env.local file exists with Firebase config')
    console.log('2. Verify your Firebase project is set up correctly')
    console.log('3. Ensure Firestore is enabled in your Firebase project')
    process.exit(1)
  }
}

// Run the seeding
seedAdmin()
  .then(() => {
    console.log('✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
