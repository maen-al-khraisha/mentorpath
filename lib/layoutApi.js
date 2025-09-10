import { firestore } from '@/lib/firebaseClient'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'

// Layout persistence API
export const layoutApi = {
  // Save layout preference to database
  async saveLayoutPreference(userId, layout) {
    try {
      if (!firestore || !userId) return false

      const userPrefsRef = doc(firestore, 'user_preferences', userId)

      await setDoc(
        userPrefsRef,
        {
          userId, // Include userId in document data for security rules
          layout,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
        { merge: true }
      )

      return true
    } catch (error) {
      console.error('Error saving layout preference:', error)
      return false
    }
  },

  // Get layout preference from database
  async getLayoutPreference(userId) {
    try {
      if (!firestore || !userId) return null

      const userPrefsRef = doc(firestore, 'user_preferences', userId)
      const userPrefsDoc = await getDoc(userPrefsRef)

      if (userPrefsDoc.exists()) {
        return userPrefsDoc.data().layout || 'modern'
      }

      return null
    } catch (error) {
      console.error('Error getting layout preference:', error)
      return null
    }
  },

  // Update layout preference
  async updateLayoutPreference(userId, layout) {
    try {
      if (!firestore || !userId) return false

      const userPrefsRef = doc(firestore, 'user_preferences', userId)

      await updateDoc(userPrefsRef, {
        layout,
        updatedAt: new Date(),
      })

      return true
    } catch (error) {
      console.error('Error updating layout preference:', error)
      return false
    }
  },

  // Sync layout preference (localStorage to database)
  async syncLayoutPreference(userId) {
    try {
      if (!firestore || !userId) return false

      const localLayout = localStorage.getItem('mentorpath-layout') || 'modern'

      try {
        const dbLayout = await this.getLayoutPreference(userId)

        // If database has different layout, update localStorage
        if (dbLayout && dbLayout !== localLayout) {
          localStorage.setItem('mentorpath-layout', dbLayout)
          return dbLayout
        }

        // If localStorage has different layout, update database
        if (!dbLayout || dbLayout !== localLayout) {
          await this.saveLayoutPreference(userId, localLayout)
        }

        return localLayout
      } catch (dbError) {
        console.warn('Database operation failed, using localStorage:', dbError)
        return localLayout
      }
    } catch (error) {
      console.error('Error syncing layout preference:', error)
      return localStorage.getItem('mentorpath-layout') || 'modern'
    }
  },
}
