'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/useAuth'
import { subscribeToSheets } from '@/lib/sheetsApi'
import Button from '@/components/Button'
import AddSheetModal from './AddSheetModal'
import SheetViewer from './SheetViewer'
import { Plus, ChevronDown } from 'lucide-react'

export default function AgendaPage() {
  const { user, loading } = useAuth()
  const [sheets, setSheets] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Subscribe to sheets
  useEffect(() => {
    if (user && !loading) {
      setIsLoading(true)
      const unsubscribe = subscribeToSheets(user.uid, (userSheets) => {
        setSheets(userSheets)
        setIsLoading(false)
      })
      return unsubscribe
    }
  }, [user, loading])

  function handleAddSheet() {
    setShowAddModal(true)
  }

  function handleCloseModal() {
    setShowAddModal(false)
  }

  function handleSheetSaved() {
    // Sheets will update automatically via the subscription
  }

  function handleSheetDeleted(deletedSheetId) {
    setSheets((prev) => prev.filter((sheet) => sheet.id !== deletedSheetId))
  }

  if (loading) {
    return (
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4 shadow-soft min-h-[400px] flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[var(--bg-card)] border-2 border-[var(--border)] rounded-lg p-6 shadow-soft">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>{' '}
          </div>
          <Button variant="primary" onClick={handleAddSheet} className="flex items-center gap-2">
            <Plus size={16} />
            <span>Add sheet</span>
          </Button>
        </div>

        {/* Stats */}
        {/* <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{sheets.length}</div>
            <div className="text-sm text-blue-700">Total Sheets</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">
              {sheets.reduce((total, sheet) => total + (sheet.rows?.length || 0), 0)}
            </div>
            <div className="text-sm text-green-700">Total Rows</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">
              {sheets.reduce((total, sheet) => total + (sheet.columns?.length || 0), 0)}
            </div>
            <div className="text-sm text-purple-700">Total Columns</div>
          </div>
        </div> */}
      </div>

      {/* Sheets List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="text-gray-500">Loading sheets...</div>
        </div>
      ) : sheets.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📊</div>
          <div className="text-xl font-medium text-gray-700 mb-2">No sheets yet!</div>
          <div className="text-gray-500 mb-4">
            Create your first sheet to start organizing data.
          </div>
          <Button variant="primary" onClick={handleAddSheet}>
            <Plus size={16} className="mr-2" />
            Create Your First Sheet
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {sheets.map((sheet) => (
            <SheetViewer
              key={sheet.id}
              sheet={sheet}
              onUpdate={handleSheetSaved}
              onDelete={handleSheetDeleted}
            />
          ))}
        </div>
      )}

      {/* Add Sheet Modal */}
      {showAddModal && (
        <AddSheetModal open={showAddModal} onClose={handleCloseModal} onSave={handleSheetSaved} />
      )}
    </div>
  )
}
