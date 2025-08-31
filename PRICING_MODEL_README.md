# Hybrid Pricing Model Implementation

This document outlines the implementation of a comprehensive hybrid pricing model for the MentorPath SaaS application, featuring a 14-day free trial, freemium plan, and Pro subscription via Paddle.

## 🏗️ Architecture Overview

### Database Schema

#### Users Collection (`users`)

```javascript
{
  userId: string,
  email: string,
  name: string,
  plan: 'trial' | 'free' | 'pro',
  trialStartDate: Date,
  trialEndDate: Date,
  subscriptionStartDate: Date | null,
  subscriptionEndDate: Date | null,
  paddleCustomerId: string | null,
  paddleSubscriptionId: string | null,
  status: 'active' | 'inactive' | 'cancelled',
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### Usage Collection (`usage`)

```javascript
{
  userId: string,
  month: string, // Format: "YYYY-MM"
  tasks: number,
  notes: number,
  habits: number,
  events: number,
  sheets: number,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### Settings Collection (`settings`)

```javascript
{
  planLimits: {
    free: {
      tasks: 20,
      notes: 5,
      habits: 3,
      events: 1,
      sheets: 2,
      insights: false
    },
    pro: {
      tasks: -1, // unlimited
      notes: -1,
      habits: -1,
      events: -1,
      sheets: -1,
      insights: true
    }
  }
}
```

## 🎯 Plan Features

### 1. Trial Plan (14 Days)

- **Duration**: 14 days from signup
- **Features**: Unlimited access to all features
- **Auto-downgrade**: Automatically converts to Free plan after expiration

### 2. Free Plan (Forever)

- **Tasks**: 20 per month
- **Notes**: 5 per month
- **Habits**: 3 per month
- **Events**: 1 per day
- **Agenda Sheets**: 2 total
- **Insights**: ❌ Not available

### 3. Pro Plan ($7/month)

- **All Features**: Unlimited
- **Insights Dashboard**: ✅ Available
- **Priority Support**: ✅ Available
- **Data Export**: ✅ Available
- **Custom Themes**: ✅ Available

## 🔧 Implementation Details

### Core Files

1. **`lib/subscriptionApi.js`** - Main subscription management
2. **`lib/usePlanEnforcement.js`** - React hook for plan enforcement
3. **`components/TrialBanner.jsx`** - Trial countdown banner
4. **`components/UsageMeter.jsx`** - Usage tracking widget
5. **`app/billing/page.js`** - Billing page with Paddle integration
6. **`lib/paddleApi.js`** - Paddle payment integration stub
7. **`middleware.ts`** - Plan enforcement middleware

### Key Functions

#### Subscription Management

```javascript
// Create user subscription (called on signup)
await createUserSubscription(userId, userData)

// Check if user can perform action
const canCreate = await canPerformAction(userId, 'tasks')

// Increment usage
await incrementUsage(userId, 'tasks')

// Update user plan
await updateUserPlan(userId, 'pro', additionalData)
```

#### Plan Enforcement

```javascript
// Check trial status
const isTrial = isInTrial(subscription)
const daysRemaining = getTrialDaysRemaining(subscription)

// Get usage data
const usage = await getCurrentMonthUsage(userId)
const limits = getPlanLimits(plan)
```

## 🚀 Usage Examples

### Adding Plan Enforcement to Existing APIs

All creation APIs now include plan enforcement:

```javascript
// In tasksApi.js
export async function createTask(taskData) {
  // Check if user can create tasks
  const canCreate = await canPerformAction(user.uid, 'tasks')
  if (!canCreate) {
    throw new Error('You have reached your task limit. Please upgrade to Pro.')
  }

  // Create task
  const docRef = await addDoc(tasksCol(), task)

  // Increment usage
  await incrementUsage(user.uid, 'tasks')

  return docRef.id
}
```

### Using the Plan Enforcement Hook

```javascript
import { usePlanEnforcement } from '@/lib/usePlanEnforcement'

function MyComponent() {
  const {
    subscription,
    usage,
    planLimits,
    isTrial,
    trialDaysRemaining,
    checkAction,
    redirectToBilling,
  } = usePlanEnforcement()

  const handleCreateTask = async () => {
    const canCreate = await checkAction('tasks')
    if (!canCreate) {
      redirectToBilling()
      return
    }
    // Create task logic
  }

  return (
    <div>
      {isTrial && <div>Trial ends in {trialDaysRemaining} days</div>}
      <UsageMeter />
    </div>
  )
}
```

## 🔒 Security & Firestore Rules

```javascript
// Users collection
match /users/{uid} {
  allow read, write: if request.auth != null && request.auth.uid == uid;
  allow read, write: if isDesignatedAdmin();
}

// Usage collection
match /usage/{usageId} {
  allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
  allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
}
```

## 💳 Paddle Integration

### Environment Variables

```bash
NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox
NEXT_PUBLIC_PADDLE_CLIENT_ID=your_client_id
NEXT_PUBLIC_PADDLE_PRO_MONTHLY_ID=your_monthly_product_id
NEXT_PUBLIC_PADDLE_PRO_YEARLY_ID=your_yearly_product_id
```

### Webhook Handler (API Route)

Create `/api/paddle/webhook.js` to handle Paddle webhooks:

```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verify webhook signature
  // Update user subscription based on webhook data

  res.status(200).json({ success: true })
}
```

### Required Legal Pages for Paddle Compliance

The following pages are required for Paddle to approve your subscription system:

1. **Terms & Conditions** (`/terms`) - General terms of service
2. **Privacy Policy** (`/privacy`) - Data protection and privacy
3. **Refund Policy** (`/refund`) - Cancellation and refund terms
4. **Subscription Terms** (`/subscription-terms`) - Specific subscription conditions

All pages are implemented and accessible from the billing page and footer.

```

## 🎨 UI Components

### Trial Banner

- Shows trial countdown
- Displays upgrade CTA
- Auto-dismissible
- Different states for trial ending soon/ending today

### Usage Meter

- Shows current usage vs limits
- Visual progress bars
- Color-coded (green/yellow/red)
- Upgrade button when limits reached

### Billing Page

- Plan comparison
- Paddle checkout integration
- Current plan status
- Upgrade/downgrade options

## 🔧 Admin Features

### Plan Management Dashboard

- View all users and their plans
- Edit user plans manually
- Set trial end dates
- Monitor usage across users

### Plan Limits Configuration

- Configure free plan limits
- Set feature restrictions
- Enable/disable features per plan

## 📊 Monitoring & Analytics

### Usage Tracking

- Monthly usage per user
- Feature usage breakdown
- Conversion tracking (trial → pro)
- Churn analysis

### Revenue Metrics

- Monthly recurring revenue (MRR)
- Trial conversion rate
- Average revenue per user (ARPU)
- Customer lifetime value (CLV)

## 🚀 Deployment Checklist

1. **Database Setup**
   - Deploy Firestore rules
   - Create initial plan limits document
   - Set up usage collection indexes

2. **Environment Variables**
   - Configure Paddle credentials
   - Set up webhook endpoints
   - Configure admin email

3. **Testing**
   - Test trial creation and expiration
   - Verify plan enforcement
   - Test usage tracking
   - Validate admin functions

4. **Monitoring**
   - Set up usage alerts
   - Monitor trial conversions
   - Track subscription metrics

## 🔄 Future Enhancements

1. **Advanced Analytics**
   - Cohort analysis
   - Feature adoption tracking
   - Predictive churn modeling

2. **Flexible Pricing**
   - Custom plan limits
   - Usage-based pricing
   - Promotional codes

3. **Enterprise Features**
   - Team management
   - SSO integration
   - Advanced permissions

4. **Payment Options**
   - Multiple payment providers
   - Invoicing for enterprise
   - Subscription management portal

## 📝 Notes

- The implementation uses Firebase/Firestore for data storage
- Paddle integration is stubbed - implement actual API calls for production
- All plan enforcement happens client-side for UX - add server-side validation for security
- Usage tracking resets monthly
- Trial auto-downgrade runs daily via scheduled function (to be implemented)

## 🏛️ **Paddle Compliance Requirements - COMPLETED ✅**

### **Required Legal Pages for Paddle Compliance**
All required pages are now implemented and accessible:

1. **Terms & Conditions** (`/terms`) - ✅ **COMPLETED**
   - General terms of service
   - Company name "Mentor Path" clearly mentioned
   - Comprehensive legal coverage

2. **Privacy Policy** (`/privacy`) - ✅ **COMPLETED**
   - Data protection and privacy
   - Company name "Mentor Path" clearly mentioned
   - GDPR compliant

3. **Refund Policy** (`/refund`) - ✅ **COMPLETED**
   - Cancellation and refund terms
   - Company name "Mentor Path" clearly mentioned
   - Follows Paddle's 14-day policy

4. **Subscription Terms** (`/subscription-terms`) - ✅ **COMPLETED**
   - Specific subscription conditions
   - Company name "Mentor Path" clearly mentioned
   - Comprehensive subscription terms

5. **Pricing Page** (`/pricing`) - ✅ **COMPLETED**
   - Dedicated pricing page (separate from billing)
   - Clear pricing structure
   - Feature comparison
   - No donation references (Paddle compliant)

### **Company Legal Information**
- **Legal Name**: Mentor Path (operating as MentorPath)
- **Company Name**: Clearly mentioned in all legal pages
- **Contact Information**: Provided in all legal pages
- **Address**: Placeholder for company address

### **Navigation Integration**
- **Sidebar**: Added Pricing and Billing links
- **Footer**: Legal links accessible from all pages
- **Billing Page**: Links to pricing page
- **Cross-linking**: All legal pages reference each other
```
