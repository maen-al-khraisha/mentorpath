'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/useAuth'
import { auth, firestore } from '@/lib/firebaseClient'
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore'

export default function DebugPage() {
  const { user, loading } = useAuth()
  const [log, setLog] = useState([])
  const [testResult, setTestResult] = useState('')

  const addLog = (message) => {
    console.log(message)
    setLog((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const runDiagnostics = async () => {
    setLog([])
    setTestResult('')

    addLog('=== FIRESTORE DIAGNOSTICS ===')

    // 1. Check authentication
    addLog(`Auth loading: ${loading}`)
    addLog(`Current user: ${user ? user.uid : 'null'}`)
    addLog(`User email: ${user ? user.email : 'null'}`)

    if (!user) {
      addLog('❌ No authenticated user - stopping diagnostics')
      return
    }

    try {
      // 2. Test basic Firestore connection
      addLog('Testing basic Firestore connection...')
      const testDoc = await addDoc(collection(firestore, 'debugTest'), {
        message: 'test',
        userId: user.uid,
        createdAt: serverTimestamp(),
      })
      addLog(`✅ Basic Firestore write successful: ${testDoc.id}`)

      // 3. Test tasks collection write
      addLog('Testing tasks collection write...')
      const taskDoc = await addDoc(collection(firestore, 'tasks'), {
        title: 'Debug Test Task',
        ownerId: user.uid,
        dateKey: '2025-01-11',
        completed: false,
        createdAt: serverTimestamp(),
      })
      addLog(`✅ Tasks collection write successful: ${taskDoc.id}`)

      // 4. Test tasks collection read
      addLog('Testing tasks collection read...')
      const q = query(collection(firestore, 'tasks'), where('ownerId', '==', user.uid))
      const snapshot = await getDocs(q)
      addLog(`✅ Tasks collection read successful: ${snapshot.size} documents`)

      // 5. Test specific dateKey query
      addLog('Testing dateKey query...')
      const dateQ = query(
        collection(firestore, 'tasks'),
        where('ownerId', '==', user.uid),
        where('dateKey', '==', '2025-01-11')
      )
      const dateSnapshot = await getDocs(dateQ)
      addLog(`✅ DateKey query successful: ${dateSnapshot.size} documents`)

      setTestResult('✅ All tests passed! Firestore rules and auth are working.')
    } catch (error) {
      addLog(`❌ Error: ${error.code} - ${error.message}`)
      setTestResult(`❌ Test failed: ${error.message}`)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Firestore Diagnostics</h1>

      <div className="mb-4">
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          {loading ? 'Loading...' : 'Run Diagnostics'}
        </button>
      </div>

      {testResult && (
        <div
          className={`p-3 rounded mb-4 ${
            testResult.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {testResult}
        </div>
      )}

      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-2">Log:</h2>
        <pre className="text-sm whitespace-pre-wrap">{log.join('\n')}</pre>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <h3 className="font-bold">How to use:</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li>Make sure you're signed in</li>
          <li>Click "Run Diagnostics"</li>
          <li>Check the log for specific error codes</li>
          <li>If tests fail, check your Firestore security rules in Firebase Console</li>
        </ol>
      </div>
    </div>
  )
}
