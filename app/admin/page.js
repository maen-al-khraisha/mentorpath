'use client'
import AppShell from '@/components/AppShell'
import { useRequireAuth } from '@/utils/protectedRoute'
import { useEffect, useState } from 'react'
import { firestore, auth } from '@/lib/firebaseClient'
import { doc, getDoc, setDoc, collection, getDocs, writeBatch, deleteDoc } from 'firebase/firestore'
import { updateUserPlan, PLAN_TYPES } from '@/lib/subscriptionApi'
import Button from '@/components/Button'
import Logo from '@/components/Logo'
import Link from 'next/link'
import Modal from '@/components/ui/Modal'
import {
  Users,
  Package,
  Settings,
  Palette,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Eye,
  Save,
  RefreshCw,
  Download,
  Upload,
  DollarSign,
  Calendar,
  Target,
  FileText,
  Shield,
} from 'lucide-react'

const COLOR_KEYS = [
  'primary',
  'accent',
  'danger',
  'neutral-900',
  'neutral-700',
  'page',
  'card',
  'border',
  'muted1',
  'muted2',
]

const THEME_SECTIONS = {
  colors: [
    'primary',
    'accent',
    'danger',
    'neutral-900',
    'neutral-700',
    'page',
    'card',
    'border',
    'muted1',
    'muted2',
  ],
  spacing: ['radius-md', 'radius-lg', 'soft-shadow', 'elevated-shadow'],
  typography: ['font-family', 'font-size-base', 'font-size-lg', 'font-size-xl'],
  layout: ['container-max-width', 'sidebar-width', 'header-height'],
}

export default function AdminPage() {
  const { user, loading } = useRequireAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [theme, setTheme] = useState({})
  const [app, setApp] = useState({
    habitDefault: 40,
    habitGoal: 100,
    trialDuration: 7,
    maxUsers: 1000,
    enableAnalytics: true,
    enableExport: true,
  })
  const [users, setUsers] = useState([])
  const [packages, setPackages] = useState([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
  })
  const [allowed, setAllowed] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)
  const [busy, setBusy] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [editingPackage, setEditingPackage] = useState(null)
  const [editPackageData, setEditPackageData] = useState({})
  const [showCreatePackageModal, setShowCreatePackageModal] = useState(false)
  const [newPackageData, setNewPackageData] = useState({
    name: '',
    price: 0,
    trial_period_days: 7,
    task_limit: 50,
    habit_limit: 10,
    sheet_limit: 5,
    notes_limit: 10,
    events_limit: 5,
    insights_enabled: false,
    description: '',
  })
  const [editingUserPlan, setEditingUserPlan] = useState(null)
  const [editUserPlanData, setEditUserPlanData] = useState({})
  const [showPlanLimitsModal, setShowPlanLimitsModal] = useState(false)
  const [planLimitsData, setPlanLimitsData] = useState({})

  useEffect(() => {
    async function init() {
      if (!user) return

      try {
        // 🔒 SECURITY: Only proceed if user is admin (checked by layout)
        setAllowed(true)

        // Load theme and app settings
        const themeSnap = await getDoc(doc(firestore, 'settings', 'theme'))
        if (themeSnap.exists()) setTheme(themeSnap.data())

        const appSnap = await getDoc(doc(firestore, 'settings', 'app'))
        if (appSnap.exists()) setApp((prev) => ({ ...prev, ...appSnap.data() }))

        // Load users and packages
        await loadUsers()
        await loadPackages()
        await loadStats()
      } catch (error) {
        console.error('Error loading admin data:', error)
      } finally {
        setCheckingAdmin(false)
      }
    }
    init()
  }, [user])

  const loadUsers = async () => {
    try {
      setLoadingData(true)

      // Try multiple collections to find all users
      const collections = ['users', 'customers', 'profiles']
      let allUsers = []

      for (const collectionName of collections) {
        try {
          const snapshot = await getDocs(collection(firestore, collectionName))

          const usersFromCollection = snapshot.docs.map((doc) => {
            const userData = doc.data()

            return {
              id: doc.id,
              email: userData.email || userData.emailAddress || 'No email',
              name: userData.name || userData.displayName || userData.fullName || 'No name',
              displayName:
                userData.displayName || userData.name || userData.fullName || 'No display name',
              subscription_status: userData.subscription_status || userData.status || 'inactive',
              current_package: userData.current_package || userData.packageId || null,
              package_name: userData.package_name || userData.packageName,
              plan: userData.plan || 'free', // Add plan field
              subscription_start: userData.subscription_start || userData.subscriptionStart || null,
              subscription_end: userData.subscription_end || userData.subscriptionEnd || null,
              created_at: userData.created_at || userData.createdAt || userData.created || null,
              updated_at: userData.updated_at || userData.updatedAt || userData.updated || null,
              uid: userData.uid || doc.id,
              photoURL: userData.photoURL || userData.avatar || null,
              emailVerified: userData.emailVerified || userData.verified || false,
              lastSignInTime: userData.lastSignInTime || userData.lastLogin || null,
              // Add collection source for debugging
              source: collectionName,
            }
          })

          allUsers = [...allUsers, ...usersFromCollection]
        } catch (error) {
          console.error(
            `Collection ${collectionName} not accessible or doesn't exist:`,
            error.message
          )
        }
      }

      // Remove duplicates based on email or uid
      const uniqueUsers = allUsers.filter(
        (user, index, self) =>
          index === self.findIndex((u) => u.email === user.email || u.uid === user.uid)
      )

      // Debug: Log each user's details
      uniqueUsers.forEach((user, index) => {
        console.log(`User ${index + 1}:`, {
          id: user.id,
          email: user.email,
          name: user.name,
          displayName: user.displayName,
          subscription_status: user.subscription_status,
          current_package: user.current_package,
          package_name: user.package_name,
          source: user.source,
        })
      })

      setUsers(uniqueUsers)
      // ✅ Clean: No nested state updates - stats will be updated via useEffect
    } catch (error) {
      console.error('Error loading customers:', error)
      alert('Failed to load customers: ' + error.message)
    } finally {
      setLoadingData(false)
    }
  }

  const loadPackages = async () => {
    try {
      const packagesSnapshot = await getDocs(collection(firestore, 'packages'))
      const packagesData = packagesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      // If no packages exist, create default ones
      if (packagesData.length === 0) {
        await createDefaultPackages()
        // Reload packages after creating defaults
        const newPackagesSnapshot = await getDocs(collection(firestore, 'packages'))
        const newPackagesData = newPackagesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setPackages(newPackagesData)
      } else {
        setPackages(packagesData)
      }
    } catch (error) {
      console.error('Error loading packages:', error)
    }
  }

  const createDefaultPackages = async () => {
    try {
      const defaultPackages = [
        {
          id: 'free-plan',
          name: 'Free Plan',
          price: 0,
          trial_period_days: 0,
          task_limit: 20,
          habit_limit: 3,
          sheet_limit: 2,
          notes_limit: 5,
          events_limit: 1,
          insights_enabled: false,
          description: 'Basic features with limited usage',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'pro-plan',
          name: 'Pro Plan',
          price: 7,
          trial_period_days: 14,
          task_limit: -1, // unlimited
          habit_limit: -1, // unlimited
          sheet_limit: -1, // unlimited
          notes_limit: -1, // unlimited
          events_limit: -1, // unlimited
          insights_enabled: true,
          description: 'Unlimited access to all features',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]

      const batch = writeBatch(firestore)
      defaultPackages.forEach((pkg) => {
        const packageRef = doc(firestore, 'packages', pkg.id)
        batch.set(packageRef, pkg)
      })

      await batch.commit()
      console.log('Default packages created successfully')
    } catch (error) {
      console.error('Error creating default packages:', error)
    }
  }

  const loadStats = async () => {
    try {
      const totalCustomers = users.length
      const activeSubscriptions = users.filter((u) => u.subscription_status === 'active').length
      const customersWithPackages = users.filter((u) => u.current_package).length
      const verifiedEmails = users.filter((u) => u.emailVerified).length

      // Calculate revenue from active subscriptions
      const activeUsers = users.filter((u) => u.subscription_status === 'active')
      const totalRevenue = activeUsers.reduce((sum, user) => {
        // Find the package price for this user
        const userPackage = packages.find((pkg) => pkg.id === user.current_package)
        return sum + (userPackage?.price || 0)
      }, 0)

      // Calculate growth (mock data for now)
      const monthlyGrowth = 12.5

      setStats({
        totalCustomers,
        activeSubscriptions,
        customersWithPackages,
        totalRevenue,
        monthlyGrowth,
      })

      console.log('Stats updated:', {
        totalCustomers,
        activeSubscriptions,
        customersWithPackages,
        totalRevenue,
        monthlyGrowth,
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  // ✅ Clean: Add useEffect to automatically update stats when users or packages change
  useEffect(() => {
    // Only update stats when we have both users and packages data
    if (users.length > 0 && packages.length > 0) {
      loadStats()
    }
  }, [users, packages]) // Dependencies are clear and explicit

  const syncFirebaseAuthUsers = async () => {
    try {
      setLoadingData(true)

      // Get current user to check if they're admin
      if (!user || user.email !== 'maen.alkhraisha@gmail.com') {
        alert('Only admin can sync users')
        return
      }

      // Create Firestore documents for the 4 users you showed me
      const authUsers = [
        {
          email: 'maen.khraisha92@gmail.com',
          name: 'Maen Khraisha',
          displayName: 'Maen Khraisha',
          uid: 'GrHlrN0pAZZr5KJPxa2Hk0PY...', // You'll need the full UID
        },
        {
          email: 's.alkadri@sakan.co',
          name: 'S. Alkadri',
          displayName: 'S. Alkadri',
          uid: '127Uo9hmiVUKpIEzBCZk5oX...', // You'll need the full UID
        },
        {
          email: 'mjd.722122@gmail.com',
          name: 'MJD User',
          displayName: 'MJD User',
          uid: 'VQ6knlsV3QePtkpRqfrX6URvj...', // You'll need the full UID
        },
        {
          email: 'maen.alkhraisha@gmail.com',
          name: 'Maen Alkhraisha',
          displayName: 'Maen Alkhraisha',
          uid: '6CQpsOVVLNdrFelFKylKCLgpvDV2', // This one we have
        },
      ]

      // Create documents in Firestore
      const batch = writeBatch(firestore)

      for (const authUser of authUsers) {
        // Skip if we already have this user in Firestore
        const existingUser = users.find((u) => u.email === authUser.email)
        if (existingUser) {
          continue
        }

        const userRef = doc(firestore, 'users', authUser.uid)
        batch.set(userRef, {
          email: authUser.email,
          name: authUser.name,
          displayName: authUser.displayName,
          uid: authUser.uid,
          subscription_status: 'inactive',
          current_package: null,
          package_name: '',
          subscription_start: null,
          subscription_end: null,
          created_at: new Date(),
          updated_at: new Date(),
          photoURL: null,
          emailVerified: true,
          lastSignInTime: null,
        })
      }

      await batch.commit()

      // Reload users to show the new ones
      await loadUsers()

      alert('Successfully synced Firebase Auth users to Firestore!')
    } catch (error) {
      console.error('Error syncing users:', error)
      alert('Failed to sync users: ' + error.message)
    } finally {
      setLoadingData(false)
    }
  }

  const cleanupTestData = async () => {
    try {
      setLoadingData(true)

      // Get current user to check if they're admin
      if (!user || user.email !== 'maen.alkhraisha@gmail.com') {
        alert('Only admin can cleanup test data')
        return
      }

      // Find test users (customers with example.com emails or customer_ IDs)
      const testUsers = users.filter(
        (u) =>
          u.email.includes('example.com') ||
          u.id.startsWith('customer_') ||
          u.name === 'John Doe' ||
          u.name === 'Jane Smith' ||
          u.name === 'Bob Wilson' ||
          u.name === 'Alice Johnson'
      )

      if (testUsers.length === 0) {
        alert('No test users found to remove')
        return
      }

      // Confirm deletion
      if (
        !confirm(
          `Are you sure you want to remove ${testUsers.length} test users? This action cannot be undone.`
        )
      ) {
        return
      }

      // Remove test users
      const batch = writeBatch(firestore)
      testUsers.forEach((testUser) => {
        const userRef = doc(firestore, 'users', testUser.id)
        batch.delete(userRef)
      })

      await batch.commit()

      // Reload users to reflect changes
      await loadUsers()

      alert(`Successfully removed ${testUsers.length} test users!`)
    } catch (error) {
      console.error('Error cleaning up test data:', error)
      alert('Failed to cleanup test data: ' + error.message)
    } finally {
      setLoadingData(false)
    }
  }

  const subscribeToFree = async (userId) => {
    try {
      setLoadingData(true)

      // Get current user to check if they're admin
      if (!user || user.email !== 'maen.alkhraisha@gmail.com') {
        alert('Only admin can subscribe users to free plan')
        return
      }

      // Update the user document directly with all necessary fields
      const userRef = doc(firestore, 'users', userId)
      await setDoc(
        userRef,
        {
          plan: PLAN_TYPES.FREE,
          package_name: 'Free Plan',
          current_package: 'free',
          subscription_status: 'active',
          subscriptionStartDate: null,
          subscriptionEndDate: null,
          updatedAt: new Date(),
        },
        { merge: true }
      )

      alert('Successfully subscribed user to free plan!')
      // Reload users to reflect changes
      await loadUsers()
    } catch (error) {
      console.error('Error subscribing user to free plan:', error)
      alert('Failed to subscribe user to free plan: ' + error.message)
    } finally {
      setLoadingData(false)
    }
  }

  const updateUserPackage = async (userId, packageId) => {
    try {
      setLoadingData(true)

      // Get current user to check if they're admin
      if (!user || user.email !== 'maen.alkhraisha@gmail.com') {
        alert('Only admin can update user packages')
        return
      }

      // Find the package details
      const selectedPackage = packages.find((pkg) => pkg.id === packageId)
      if (!selectedPackage) {
        alert('Package not found')
        return
      }

      const userRef = doc(firestore, 'users', userId)
      await setDoc(
        userRef,
        {
          current_package: packageId,
          package_name: selectedPackage.name,
          plan: selectedPackage.name.toLowerCase().replace(' ', '-'), // Convert to plan format
          subscription_status: 'active',
          updatedAt: new Date(),
        },
        { merge: true }
      )

      alert(`Successfully updated user to ${selectedPackage.name} package!`)
      // Reload users to reflect changes
      await loadUsers()
    } catch (error) {
      console.error('Error updating user package:', error)
      alert('Failed to update user package: ' + error.message)
    } finally {
      setLoadingData(false)
    }
  }

  const updateUserPlan = async (userId, newPlan) => {
    try {
      setLoadingData(true)

      // Get current user to check if they're admin
      if (!user || user.email !== 'maen.alkhraisha@gmail.com') {
        alert('Only admin can update user plans')
        return
      }

      const userRef = doc(firestore, 'users', userId)

      let updateData = {
        plan: newPlan,
        updatedAt: new Date(),
      }

      // Set plan-specific data
      if (newPlan === PLAN_TYPES.FREE) {
        updateData = {
          ...updateData,
          package_name: 'Free Plan',
          current_package: 'free',
          subscription_status: 'active',
          subscriptionStartDate: null,
          subscriptionEndDate: null,
        }
      } else if (newPlan === PLAN_TYPES.PRO) {
        updateData = {
          ...updateData,
          package_name: 'Pro Plan',
          current_package: 'pro',
          subscription_status: 'active',
          subscriptionStartDate: new Date(),
          subscriptionEndDate: null, // Pro plan doesn't expire
        }
      }

      await setDoc(userRef, updateData, { merge: true })

      alert(`Successfully updated user to ${newPlan} plan!`)
      // Reload users to reflect changes
      await loadUsers()
    } catch (error) {
      console.error('Error updating user plan:', error)
      alert('Failed to update user plan: ' + error.message)
    } finally {
      setLoadingData(false)
    }
  }

  const openCreatePackageModal = () => {
    setShowCreatePackageModal(true)
    setNewPackageData({
      name: '',
      price: 0,
      trial_period_days: 7,
      task_limit: 50,
      habit_limit: 10,
      sheet_limit: 5,
      notes_limit: 10,
      events_limit: 5,
      insights_enabled: false,
      description: '',
    })
  }

  const createPackage = async () => {
    try {
      if (!newPackageData.name.trim()) {
        alert('Package name is required!')
        return
      }

      const newPackage = {
        id: `package-${Date.now()}`,
        ...newPackageData,
        created_at: new Date(),
        updated_at: new Date(),
      }

      await setDoc(doc(firestore, 'packages', newPackage.id), newPackage)

      await loadPackages() // Refresh packages list

      // Close modal and reset form
      setShowCreatePackageModal(false)
      setNewPackageData({
        name: '',
        price: 0,
        trial_period_days: 7,
        task_limit: 50,
        habit_limit: 10,
        sheet_limit: 5,
        description: '',
      })

      alert('Package created successfully!')
    } catch (error) {
      console.error('Error creating package:', error)
      alert('Failed to create package: ' + error.message)
    }
  }

  const cancelCreatePackage = () => {
    setShowCreatePackageModal(false)
    setNewPackageData({
      name: '',
      price: 0,
      trial_period_days: 7,
      task_limit: 50,
      habit_limit: 10,
      sheet_limit: 5,
      description: '',
    })
  }

  const editPackage = (pkg) => {
    setEditingPackage(pkg.id)
    setEditPackageData({
      name: pkg.name,
      price: pkg.price,
      trial_period_days: pkg.trial_period_days,
      task_limit: pkg.task_limit,
      habit_limit: pkg.habit_limit,
      sheet_limit: pkg.sheet_limit,
      notes_limit: pkg.notes_limit,
      events_limit: pkg.events_limit,
      description: pkg.description,
    })
  }

  const savePackageEdit = async () => {
    try {
      setLoadingData(true)

      const updatedPackage = {
        ...editPackageData,
        updated_at: new Date(),
      }

      await setDoc(doc(firestore, 'packages', editingPackage), updatedPackage, { merge: true })

      // Refresh packages list
      await loadPackages()

      // Reset editing state
      setEditingPackage(null)
      setEditPackageData({})

      alert('Package updated successfully!')
    } catch (error) {
      console.error('Error updating package:', error)
      alert('Failed to update package')
    } finally {
      setLoadingData(false)
    }
  }

  const cancelPackageEdit = () => {
    setEditingPackage(null)
    setEditPackageData({})
  }

  const deletePackage = async (packageId) => {
    if (!confirm('Are you sure you want to delete this package? This action cannot be undone.'))
      return

    try {
      await deleteDoc(doc(firestore, 'packages', packageId))
      await loadPackages() // Refresh packages list
      alert('Package deleted successfully!')
    } catch (error) {
      console.error('Error deleting package:', error)
      alert('Failed to delete package')
    }
  }

  async function save() {
    try {
      setBusy(true)
      await setDoc(doc(firestore, 'settings', 'theme'), theme, { merge: true })
      await setDoc(doc(firestore, 'settings', 'app'), app, { merge: true })
      alert('Settings saved successfully!')
    } catch (e) {
      console.error(e)
      alert('Save failed')
    } finally {
      setBusy(false)
    }
  }

  const exportData = async () => {
    try {
      const data = {
        users,
        packages,
        theme,
        app,
        exportDate: new Date().toISOString(),
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `admin-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)

      alert('Data exported successfully!')
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Failed to export data')
    }
  }

  if (loading || checkingAdmin) {
    return (
      <AppShell>
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading admin panel...</p>
        </div>
      </AppShell>
    )
  }

  if (!allowed) {
    return (
      <AppShell>
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          {/* Logo Header - Click to return to main app */}
          <div className="bg-card border-b border-border px-6 py-4 mb-6">
            <Link
              href="/"
              className="inline-block hover:scale-105 transition-transform duration-200"
            >
              <Logo size="lg" showText={true} animated={true} />
            </Link>
            <div className="text-sm text-muted-foreground mt-2">
              Click logo to return to main application
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            You do not have administrative privileges to access this panel.
          </p>

          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              If you believe you should have access, please contact the system administrator.
            </p>

            <div className="flex gap-3 justify-center">
              <Link href="/dashboard">
                <Button variant="primary">Go to Dashboard</Button>
              </Link>

              <Link href="/">
                <Button variant="secondary">Return Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </AppShell>
    )
  }

  const renderDashboardTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stats Cards */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold text-slate-900">{stats.activeUsers}</p>
            </div>
            <Shield className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-900">${stats.totalRevenue}</p>
            </div>
            <DollarSign className="h-8 w-8 text-emerald-600" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Monthly Growth</p>
              <p className="text-2xl font-bold text-slate-900">+{stats.monthlyGrowth}%</p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-soft">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={loadUsers} disabled={loadingData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button variant="secondary" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="primary" onClick={() => setActiveTab('users')}>
            <Users className="h-4 w-4 mr-2" />
            Manage Users
          </Button>
          <Button variant="primary" onClick={() => setActiveTab('packages')}>
            <Package className="h-4 w-4 mr-2" />
            Manage Packages
          </Button>
        </div>
      </div>
    </div>
  )

  const renderUsersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900">Customer Management</h3>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={loadUsers} disabled={loadingData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="primary" onClick={syncFirebaseAuthUsers} disabled={loadingData}>
            <Users className="h-4 w-4 mr-2" />
            Sync Auth Users
          </Button>
        </div>
      </div>

      {/* Customer Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-soft">
          <div className="text-2xl font-bold text-slate-900">{users.length}</div>
          <div className="text-sm text-slate-600">Total Customers</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-soft">
          <div className="text-2xl font-bold text-green-600">
            {users.filter((u) => u.subscription_status === 'active').length}
          </div>
          <div className="text-sm text-slate-600">Active Subscriptions</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-soft">
          <div className="text-2xl font-bold text-blue-600">
            {users.filter((u) => u.current_package).length}
          </div>
          <div className="text-sm text-slate-600">With Packages</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-soft">
          <div className="text-2xl font-bold text-orange-600">${stats.totalRevenue}</div>
          <div className="text-sm text-slate-600">Monthly Revenue</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-soft">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search customers by name or email..."
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm"
              onChange={(e) => {
                const searchTerm = e.target.value.toLowerCase()
                const filteredUsers = users.filter(
                  (user) =>
                    user.name?.toLowerCase().includes(searchTerm) ||
                    user.email?.toLowerCase().includes(searchTerm)
                )
                setUsers(filteredUsers)
                if (searchTerm === '') loadUsers() // Reload all users if search is cleared
              }}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="border border-slate-200 rounded-md px-3 py-2 text-sm"
              onChange={(e) => {
                const status = e.target.value
                if (status === 'all') {
                  loadUsers()
                } else {
                  const filteredUsers = users.filter((user) => user.subscription_status === status)
                  setUsers(filteredUsers)
                }
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              className="border border-slate-200 rounded-md px-3 py-2 text-sm"
              onChange={(e) => {
                const packageId = e.target.value
                if (packageId === 'all') {
                  loadUsers()
                } else {
                  const filteredUsers = users.filter((user) => user.current_package === packageId)
                  setUsers(filteredUsers)
                }
              }}
            >
              <option value="all">All Packages</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Subscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    {loadingData ? (
                      <div className="flex items-center justify-center">
                        <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                        Loading customers...
                      </div>
                    ) : (
                      'No customers found'
                    )}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center text-sm font-semibold text-white mr-3">
                          {user.name?.[0] ?? user.email?.[0] ?? 'C'}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {user.name || 'No Name'}
                          </div>
                          <div className="text-sm text-slate-500">{user.email}</div>
                          {user.displayName && user.displayName !== user.name && (
                            <div className="text-xs text-slate-400">
                              Display: {user.displayName}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {user.current_package && (
                          <div className="text-lg text-slate-900 mt-1">{user.current_package}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.subscription_status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.subscription_status || 'inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <div>
                        {user.subscription_start
                          ? `Started: ${new Date(
                              user.subscription_start.toDate
                                ? user.subscription_start.toDate()
                                : user.subscription_start
                            ).toLocaleDateString()}`
                          : 'No start date'}
                      </div>
                      {user.subscription_end && (
                        <div>
                          {`Ends: ${new Date(
                            user.subscription_end.toDate
                              ? user.subscription_end.toDate()
                              : user.subscription_end
                          ).toLocaleDateString()}`}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            alert(
                              `Customer Details:\nName: ${user.name || 'N/A'}\nEmail: ${user.email}\nPackage: ${user.package_name}\nStatus: ${user.subscription_status || 'inactive'}\nCreated: ${user.created_at ? new Date(user.created_at.toDate ? user.created_at.toDate() : user.created_at).toLocaleDateString() : 'Unknown'}`
                            )
                          }}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderPackagesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900">Package Management</h3>
        <Button variant="primary" onClick={openCreatePackageModal}>
          <Plus className="h-4 w-4 mr-2" />
          Create Package
        </Button>
      </div>

      {/* Create Package Modal */}
      {showCreatePackageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Create New Package</h3>
              <Button variant="ghost" size="sm" onClick={cancelCreatePackage}>
                ✕
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Package Name *
                </label>
                <input
                  type="text"
                  value={newPackageData.name}
                  onChange={(e) => setNewPackageData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm"
                  placeholder="Enter package name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Price ($)</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newPackageData.price === 0}
                      onChange={(e) =>
                        setNewPackageData((prev) => ({
                          ...prev,
                          price: e.target.checked ? 0 : 7,
                        }))
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-slate-600">Free Package</span>
                  </label>
                  {newPackageData.price !== 0 && (
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={newPackageData.price}
                      onChange={(e) =>
                        setNewPackageData((prev) => ({
                          ...prev,
                          price: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm"
                      placeholder="Enter price"
                    />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Trial Period (days)
                </label>
                <input
                  type="number"
                  value={newPackageData.trial_period_days}
                  onChange={(e) =>
                    setNewPackageData((prev) => ({
                      ...prev,
                      trial_period_days: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm"
                  placeholder="7"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Task Limit</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newPackageData.task_limit === -1}
                      onChange={(e) =>
                        setNewPackageData((prev) => ({
                          ...prev,
                          task_limit: e.target.checked ? -1 : 50,
                        }))
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-slate-600">Unlimited</span>
                  </label>
                  {newPackageData.task_limit !== -1 && (
                    <input
                      type="number"
                      min="1"
                      value={newPackageData.task_limit}
                      onChange={(e) =>
                        setNewPackageData((prev) => ({
                          ...prev,
                          task_limit: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm"
                      placeholder="Enter limit"
                    />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Habit Limit</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newPackageData.habit_limit === -1}
                      onChange={(e) =>
                        setNewPackageData((prev) => ({
                          ...prev,
                          habit_limit: e.target.checked ? -1 : 10,
                        }))
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-slate-600">Unlimited</span>
                  </label>
                  {newPackageData.habit_limit !== -1 && (
                    <input
                      type="number"
                      min="1"
                      value={newPackageData.habit_limit}
                      onChange={(e) =>
                        setNewPackageData((prev) => ({
                          ...prev,
                          habit_limit: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm"
                      placeholder="Enter limit"
                    />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Sheet Limit</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newPackageData.sheet_limit === -1}
                      onChange={(e) =>
                        setNewPackageData((prev) => ({
                          ...prev,
                          sheet_limit: e.target.checked ? -1 : 5,
                        }))
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-slate-600">Unlimited</span>
                  </label>
                  {newPackageData.sheet_limit !== -1 && (
                    <input
                      type="number"
                      min="1"
                      value={newPackageData.sheet_limit}
                      onChange={(e) =>
                        setNewPackageData((prev) => ({
                          ...prev,
                          sheet_limit: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm"
                      placeholder="Enter limit"
                    />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Notes Limit</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newPackageData.notes_limit === -1}
                      onChange={(e) =>
                        setNewPackageData((prev) => ({
                          ...prev,
                          notes_limit: e.target.checked ? -1 : 10,
                        }))
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-slate-600">Unlimited</span>
                  </label>
                  {newPackageData.notes_limit !== -1 && (
                    <input
                      type="number"
                      min="1"
                      value={newPackageData.notes_limit}
                      onChange={(e) =>
                        setNewPackageData((prev) => ({
                          ...prev,
                          notes_limit: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm"
                      placeholder="Enter limit"
                    />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Events Limit
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newPackageData.events_limit === -1}
                      onChange={(e) =>
                        setNewPackageData((prev) => ({
                          ...prev,
                          events_limit: e.target.checked ? -1 : 5,
                        }))
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-slate-600">Unlimited</span>
                  </label>
                  {newPackageData.events_limit !== -1 && (
                    <input
                      type="number"
                      min="1"
                      value={newPackageData.events_limit}
                      onChange={(e) =>
                        setNewPackageData((prev) => ({
                          ...prev,
                          events_limit: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm"
                      placeholder="Enter limit"
                    />
                  )}
                </div>
              </div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <textarea
                value={newPackageData.description}
                onChange={(e) =>
                  setNewPackageData((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={3}
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm"
                placeholder="Enter package description"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={cancelCreatePackage}>
                Cancel
              </Button>
              <Button variant="primary" onClick={createPackage}>
                Create Package
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className="bg-card border border-border rounded-lg p-6 shadow-soft">
            <div className="flex justify-between items-start mb-4">
              {editingPackage === pkg.id ? (
                <input
                  type="text"
                  value={editPackageData.name || ''}
                  onChange={(e) =>
                    setEditPackageData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="text-lg font-semibold text-slate-900 bg-transparent border-b border-slate-300 px-1 py-1 w-full"
                />
              ) : (
                <h4 className="text-lg font-semibold text-slate-900">{pkg.name}</h4>
              )}
              <div className="flex gap-2">
                {editingPackage === pkg.id ? (
                  <>
                    <Button variant="ghost" size="sm" onClick={cancelPackageEdit}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={savePackageEdit}
                      disabled={loadingData}
                    >
                      Save
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => editPackage(pkg)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePackage(pkg.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Price:</span>
                {editingPackage === pkg.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editPackageData.price || ''}
                      onChange={(e) =>
                        setEditPackageData((prev) => ({
                          ...prev,
                          price: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-20 border border-slate-200 rounded px-2 py-1 text-sm text-right"
                    />
                    <span className="text-sm text-slate-600">$</span>
                  </div>
                ) : (
                  <span className="font-semibold text-slate-900">
                    {pkg.price === 0 ? 'Free' : `$${pkg.price}`}
                  </span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Trial:</span>
                {editingPackage === pkg.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={editPackageData.trial_period_days || ''}
                      onChange={(e) =>
                        setEditPackageData((prev) => ({
                          ...prev,
                          trial_period_days: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-16 border border-slate-200 rounded px-2 py-1 text-sm text-right"
                    />
                    <span className="text-sm text-slate-600">days</span>
                  </div>
                ) : (
                  <span className="text-slate-900">{pkg.trial_period_days} days</span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Task Limit:</span>
                {editingPackage === pkg.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="-1"
                      value={editPackageData.task_limit || ''}
                      onChange={(e) =>
                        setEditPackageData((prev) => ({
                          ...prev,
                          task_limit: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-20 border border-slate-200 rounded px-2 py-1 text-sm text-right"
                      placeholder={editPackageData.task_limit === -1 ? '∞' : ''}
                    />
                    {editPackageData.task_limit === -1 && (
                      <span className="text-sm text-slate-600">∞</span>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-900">
                    {pkg.task_limit === -1 ? 'Unlimited' : pkg.task_limit}
                  </span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Notes Limit:</span>
                {editingPackage === pkg.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="-1"
                      value={editPackageData.notes_limit || ''}
                      onChange={(e) =>
                        setEditPackageData((prev) => ({
                          ...prev,
                          notes_limit: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-20 border border-slate-200 rounded px-2 py-1 text-sm text-right"
                      placeholder={editPackageData.notes_limit === -1 ? '∞' : ''}
                    />
                    {editPackageData.notes_limit === -1 && (
                      <span className="text-sm text-slate-600">∞</span>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-900">
                    {pkg.notes_limit === -1 ? 'Unlimited' : pkg.notes_limit}
                  </span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Events Limit:</span>
                {editingPackage === pkg.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="-1"
                      value={editPackageData.events_limit || ''}
                      onChange={(e) =>
                        setEditPackageData((prev) => ({
                          ...prev,
                          events_limit: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-20 border border-slate-200 rounded px-2 py-1 text-sm text-right"
                      placeholder={editPackageData.events_limit === -1 ? '∞' : ''}
                    />
                    {editPackageData.events_limit === -1 && (
                      <span className="text-sm text-slate-600">∞</span>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-900">
                    {pkg.events_limit === -1 ? 'Unlimited' : pkg.events_limit}
                  </span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Habit Limit:</span>
                {editingPackage === pkg.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="-1"
                      value={editPackageData.habit_limit || ''}
                      onChange={(e) =>
                        setEditPackageData((prev) => ({
                          ...prev,
                          habit_limit: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-20 border border-slate-200 rounded px-2 py-1 text-sm text-right"
                      placeholder={editPackageData.habit_limit === -1 ? '∞' : ''}
                    />
                    {editPackageData.habit_limit === -1 && (
                      <span className="text-sm text-slate-600">∞</span>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-900">
                    {pkg.habit_limit === -1 ? 'Unlimited' : pkg.habit_limit}
                  </span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Sheet Limit:</span>
                {editingPackage === pkg.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="-1"
                      value={editPackageData.sheet_limit || ''}
                      onChange={(e) =>
                        setEditPackageData((prev) => ({
                          ...prev,
                          sheet_limit: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-20 border border-slate-200 rounded px-2 py-1 text-sm text-right"
                      placeholder={editPackageData.sheet_limit === -1 ? '∞' : ''}
                    />
                    {editPackageData.sheet_limit === -1 && (
                      <span className="text-sm text-slate-600">∞</span>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-900">
                    {pkg.sheet_limit === -1 ? 'Unlimited' : pkg.sheet_limit}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-3">
              <h2 className="text-lg font-semibold text-slate-900">Description</h2>
              {editingPackage === pkg.id ? (
                <textarea
                  value={editPackageData.description || ''}
                  onChange={(e) =>
                    setEditPackageData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={3}
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm mt-1"
                />
              ) : (
                <p className="text-sm text-slate-600 mt-1">{pkg.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderThemeTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-900">Theme Customization</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colors Section */}
        <section className="bg-card border border-border rounded-lg p-6 shadow-soft">
          <h4 className="font-semibold mb-4 flex items-center">
            <Palette className="h-5 w-5 mr-2 text-blue-600" />
            Colors
          </h4>
          <div className="space-y-3">
            {THEME_SECTIONS.colors.map((key) => (
              <div key={key} className="flex items-center gap-3">
                <label className="w-32 text-sm text-slate-700">{key}</label>
                <input
                  type="color"
                  value={theme?.[key] || ''}
                  onChange={(e) => setTheme((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="h-8 w-12 border border-slate-200 rounded"
                />
                <input
                  type="text"
                  value={theme?.[key] || ''}
                  onChange={(e) => setTheme((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="flex-1 border border-slate-200 rounded-md px-2 py-1 text-sm"
                  placeholder="Enter color value"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Spacing Section */}
        <section className="bg-card border border-border rounded-lg p-6 shadow-soft">
          <h4 className="font-semibold mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2 text-green-600" />
            Spacing & Effects
          </h4>
          <div className="space-y-3">
            {THEME_SECTIONS.spacing.map((key) => (
              <div key={key} className="flex items-center gap-3">
                <label className="w-32 text-sm text-slate-700">{key}</label>
                <input
                  type="text"
                  value={theme?.[key] || ''}
                  onChange={(e) => setTheme((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="flex-1 border border-slate-200 rounded-md px-2 py-1 text-sm"
                  placeholder={key.includes('radius') ? '8px' : '0 6px 18px rgba(12,15,20,0.06)'}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Typography Section */}
        <section className="bg-card border border-border rounded-lg p-6 shadow-soft">
          <h4 className="font-semibold mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-purple-600" />
            Typography
          </h4>
          <div className="space-y-3">
            {THEME_SECTIONS.typography.map((key) => (
              <div key={key} className="flex items-center gap-3">
                <label className="w-32 text-sm text-slate-700">{key}</label>
                <input
                  type="text"
                  value={theme?.[key] || ''}
                  onChange={(e) => setTheme((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="flex-1 border border-slate-200 rounded-md px-2 py-1 text-sm"
                  placeholder={key.includes('font-family') ? 'Inter, sans-serif' : '16px'}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Layout Section */}
        <section className="bg-card border border-border rounded-lg p-6 shadow-soft">
          <h4 className="font-semibold mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2 text-orange-600" />
            Layout
          </h4>
          <div className="space-y-3">
            {THEME_SECTIONS.layout.map((key) => (
              <div key={key} className="flex items-center gap-3">
                <label className="w-32 text-sm text-slate-700">{key}</label>
                <input
                  type="text"
                  value={theme?.[key] || ''}
                  onChange={(e) => setTheme((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="flex-1 border border-slate-200 rounded-md px-2 py-1 text-sm"
                  placeholder={key.includes('width') ? '1200px' : '64px'}
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Theme Preview */}
      <section className="bg-card border border-border rounded-lg p-6 shadow-soft">
        <h4 className="font-semibold mb-4">Theme Preview</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className="p-4 border rounded-lg"
            style={{
              backgroundColor: theme?.card || '#ffffff',
              borderColor: theme?.border || '#e2e8f0',
            }}
          >
            <h5
              className="font-semibold mb-2"
              style={{ color: theme?.['neutral-900'] || '#0f172a' }}
            >
              Sample Card
            </h5>
            <p className="text-sm" style={{ color: theme?.['neutral-700'] || '#334155' }}>
              This shows how your theme will look.
            </p>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: theme?.primary || '#4f46e5' }}>
            <h5 className="font-semibold mb-2 text-white">Primary Color</h5>
            <p className="text-sm text-white/80">Primary button and accent elements.</p>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: theme?.accent || '#8b5cf6' }}>
            <h5 className="font-semibold mb-2 text-white">Accent Color</h5>
            <p className="text-sm text-white/80">Secondary elements and highlights.</p>
          </div>
        </div>
      </section>
    </div>
  )

  // Plan management functions
  const handleEditUserPlan = (user) => {
    setEditingUserPlan(user)
    setEditUserPlanData({
      plan: user.plan || 'free',
      current_package: user.current_package || 'free-plan',
      package_name: user.package_name || 'Free Plan',
      trialEndDate: user.trialEndDate
        ? new Date(user.trialEndDate).toISOString().split('T')[0]
        : '',
    })
  }

  const handleSaveUserPlan = async () => {
    try {
      setBusy(true)
      const { updateUserPlan } = await import('@/lib/subscriptionApi')

      // Determine package based on plan selection
      const selectedPackage = packages.find((pkg) => {
        if (editUserPlanData.plan === 'free') {
          return pkg.id === 'free-plan'
        } else if (editUserPlanData.plan === 'pro') {
          return pkg.id === 'pro-plan'
        }
        return false
      })

      const updateData = {
        plan: editUserPlanData.plan,
        current_package: selectedPackage?.id || 'free-plan',
        package_name: selectedPackage?.name || 'Free Plan',
      }

      if (editUserPlanData.trialEndDate) {
        updateData.trialEndDate = new Date(editUserPlanData.trialEndDate)
      }

      await updateUserPlan(editingUserPlan.uid, editUserPlanData.plan, updateData)
      setEditingUserPlan(null)
      setEditUserPlanData({})
      await loadUsers()
      alert('User plan updated successfully!')
    } catch (error) {
      console.error('Error updating user plan:', error)
      alert('Failed to update user plan: ' + error.message)
    } finally {
      setBusy(false)
    }
  }

  const handleSavePlanLimits = async () => {
    try {
      setBusy(true)
      await setDoc(doc(firestore, 'settings', 'planLimits'), {
        ...planLimitsData,
        updatedAt: serverTimestamp(),
      })
      setShowPlanLimitsModal(false)
      alert('Plan limits updated successfully!')
    } catch (error) {
      console.error('Error updating plan limits:', error)
      alert('Failed to update plan limits: ' + error.message)
    } finally {
      setBusy(false)
    }
  }

  const renderPlansTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900">Plan Management</h3>
      </div>

      {/* Package-based Plan Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className="bg-white border border-slate-200 rounded-lg p-6 shadow-soft">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-semibold text-slate-900">{pkg.name}</h4>
              <span className="text-lg font-bold text-slate-900">${pkg.price}</span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Tasks per month:</span>
                <span className="font-medium">
                  {pkg.task_limit === -1 ? 'Unlimited' : pkg.task_limit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Notes per month:</span>
                <span className="font-medium">
                  {pkg.notes_limit === -1 ? 'Unlimited' : pkg.notes_limit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Habits per month:</span>
                <span className="font-medium">
                  {pkg.habit_limit === -1 ? 'Unlimited' : pkg.habit_limit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Events per day:</span>
                <span className="font-medium">
                  {pkg.events_limit === -1 ? 'Unlimited' : pkg.events_limit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Agenda sheets:</span>
                <span className="font-medium">
                  {pkg.sheet_limit === -1 ? 'Unlimited' : pkg.sheet_limit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Insights dashboard:</span>
                <span className="font-medium">{pkg.insights_enabled ? 'Yes' : 'No'}</span>
              </div>
              {pkg.trial_period_days > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Trial period:</span>
                  <span className="font-medium">{pkg.trial_period_days} days</span>
                </div>
              )}
            </div>
            <h2 className="mt-3 text-lg font-semibold text-slate-900">Description</h2>
            <p className="text-sm text-slate-600 mt-1">{pkg.description}</p>
          </div>
        ))}
      </div>

      {/* User Plan Management */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-soft">
        <h4 className="text-lg font-semibold text-slate-900 mb-4">User Plan Management</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2">User</th>
                <th className="text-left py-2">Email</th>
                <th className="text-left py-2">Current Package</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.uid} className="border-b border-slate-100">
                  <td className="py-2">{user.name || 'N/A'}</td>
                  <td className="py-2">{user.email}</td>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900">
                        {user.package_name || 'No Package'}
                      </span>
                      <select
                        className="text-xs border border-slate-200 rounded px-2 py-1 bg-white"
                        value={user.current_package || 'free-plan'}
                        onChange={(e) => {
                          if (
                            confirm(
                              `Are you sure you want to change ${user.name || user.email}'s package to ${packages.find((p) => p.id === e.target.value)?.name}?`
                            )
                          ) {
                            updateUserPackage(user.id, e.target.value)
                          }
                        }}
                        disabled={loadingData}
                      >
                        {packages.map((pkg) => (
                          <option key={pkg.id} value={pkg.id}>
                            {pkg.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="py-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditUserPlan(user)}>
                      Edit Plan
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">System Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <h4 className="font-medium text-slate-900">Database Status</h4>
              <p className="text-sm text-slate-600">Check database connectivity and collections</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-slate-600">Connected</span>
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <h4 className="font-medium text-slate-900">Package Management</h4>
              <p className="text-sm text-slate-600">Manage subscription packages and limits</p>
            </div>
            <div className="text-sm text-slate-600">{packages.length} packages configured</div>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <h4 className="font-medium text-slate-900">User Management</h4>
              <p className="text-sm text-slate-600">Manage user accounts and subscriptions</p>
            </div>
            <div className="text-sm text-slate-600">{users.length} users registered</div>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="font-medium text-slate-900">System Information</h4>
              <p className="text-sm text-slate-600">Application version and environment</p>
            </div>
            <div className="text-sm text-slate-600">v1.0.0 - Production</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setActiveTab('packages')}
            className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              <Package className="w-5 h-5 text-purple-600" />
              <div>
                <h4 className="font-medium text-slate-900">Manage Packages</h4>
                <p className="text-sm text-slate-600">Create and edit subscription packages</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-medium text-slate-900">Manage Users</h4>
                <p className="text-sm text-slate-600">View and manage user accounts</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('plans')}
            className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-yellow-600" />
              <div>
                <h4 className="font-medium text-slate-900">Plan Management</h4>
                <p className="text-sm text-slate-600">Assign packages to users</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-slate-900">View Analytics</h4>
                <p className="text-sm text-slate-600">Check system statistics</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardTab()
      case 'users':
        return renderUsersTab()
      case 'packages':
        return renderPackagesTab()
      case 'plans':
        return renderPlansTab()
      case 'settings':
        return renderSettingsTab()
      case 'theme':
        return renderThemeTab()
      default:
        return renderDashboardTab()
    }
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'bg-blue-100' },
    { id: 'users', label: 'Users', icon: Users, color: 'bg-green-100' },
    { id: 'packages', label: 'Packages', icon: Package, color: 'bg-purple-100' },
    { id: 'plans', label: 'Plan Management', icon: Shield, color: 'bg-yellow-100' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'bg-orange-100' },
    { id: 'theme', label: 'Theme', icon: Palette, color: 'bg-pink-100' },
  ]

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <div className="text-sm text-muted-foreground">Welcome, {user.email}</div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">{renderTabContent()}</div>

        {/* Save Button - Only show on Settings and Theme tabs */}
        {(activeTab === 'settings' || activeTab === 'theme') && (
          <div className="flex justify-end pt-6 border-t border-slate-200">
            <Button variant="primary" onClick={save} disabled={busy} className="px-8 py-3">
              {busy ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* User Plan Edit Modal */}
      {editingUserPlan && (
        <Modal
          isOpen={!!editingUserPlan}
          onClose={() => {
            setEditingUserPlan(null)
            setEditUserPlanData({})
          }}
          header={{
            title: `Edit Plan for ${editingUserPlan.name || editingUserPlan.email}`,
            subtitle: 'Update user subscription and package details',
          }}
          content={
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Plan Type</label>
                <select
                  value={editUserPlanData.plan || 'free'}
                  onChange={(e) =>
                    setEditUserPlanData((prev) => ({
                      ...prev,
                      plan: e.target.value,
                    }))
                  }
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm"
                >
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Package Assignment
                </label>
                <select
                  value={editUserPlanData.current_package || 'free-plan'}
                  onChange={(e) => {
                    const selectedPkg = packages.find((pkg) => pkg.id === e.target.value)
                    setEditUserPlanData((prev) => ({
                      ...prev,
                      current_package: e.target.value,
                      package_name: selectedPkg?.name || 'Free Plan',
                      plan: selectedPkg?.id === 'pro-plan' ? 'pro' : 'free',
                    }))
                  }}
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm"
                >
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} - ${pkg.price}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Trial End Date (Optional)
                </label>
                <input
                  type="date"
                  value={editUserPlanData.trialEndDate || ''}
                  onChange={(e) =>
                    setEditUserPlanData((prev) => ({
                      ...prev,
                      trialEndDate: e.target.value,
                    }))
                  }
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>
          }
          footer={
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingUserPlan(null)
                  setEditUserPlanData({})
                }}
                disabled={busy}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveUserPlan} disabled={busy}>
                {busy ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          }
          size="default"
        />
      )}
    </AppShell>
  )
}
