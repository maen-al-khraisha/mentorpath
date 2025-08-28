'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/useAuth'
import { subscribeToSheets, deleteSheet } from '@/lib/sheetsApi'
import Button from '@/components/Button'
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal'
import { useToast } from '@/components/Toast'
import AddSheetModal from './AddSheetModal'
import SheetViewer from './SheetViewer'
import {
  Plus,
  ChevronDown,
  FileText,
  Target,
  TrendingUp,
  ListTodo,
  Search,
  Trash2,
} from 'lucide-react'

export default function AgendaPage() {
  const { user, loading } = useAuth()
  const { showToast } = useToast()
  const [sheets, setSheets] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState({
    isOpen: false,
    sheetId: null,
    sheetName: '',
  })
  const [isDeleting, setIsDeleting] = useState(false)

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

  async function handleDeleteSheet() {
    if (!showDeleteModal.sheetId) return

    try {
      setIsDeleting(true)
      await deleteSheet(showDeleteModal.sheetId)
      handleSheetDeleted(showDeleteModal.sheetId)
      setShowDeleteModal({ isOpen: false, sheetId: null, sheetName: '' })
      showToast('Sheet deleted successfully!', 'success')
    } catch (error) {
      console.error('Failed to delete sheet:', error)
      showToast('Failed to delete sheet.', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  function openDeleteModal(sheetId, sheetName) {
    setShowDeleteModal({ isOpen: true, sheetId, sheetName })
  }

  function closeDeleteModal() {
    setShowDeleteModal({ isOpen: false, sheetId: null, sheetName: '' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-lg font-semibold mb-2 text-slate-900 font-display">Loading...</div>
          <div className="text-sm text-slate-600 font-body">Loading your agenda and sheets</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-lg font-semibold mb-2 text-slate-900 font-display">
            Authentication Required
          </div>
          <div className="text-sm text-slate-600 font-body">Please sign in to view your agenda</div>
        </div>
      </div>
    )
  }

  // Calculate stats
  const totalSheets = sheets.length
  const totalRows = sheets.reduce((total, sheet) => total + (sheet.rows?.length || 0), 0)
  const totalColumns = sheets.reduce((total, sheet) => total + (sheet.columns?.length || 0), 0)
  const activeSheets = sheets.filter((sheet) => sheet.isActive !== false).length

  return (
    <>
      <div className="space-y-8">
        {/* Hero Section - Page Header & KPIs */}
        <div className="space-y-8">
          {/* Main Header */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-soft">
            <div className="flex items-start justify-between mb-8">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-slate-900 font-display bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3">
                  Agenda Management
                </h1>
                <p className="text-xl text-slate-600 font-body leading-relaxed">
                  Organize, track, and manage your data with powerful spreadsheet capabilities
                </p>
              </div>
              <Button
                variant="primary"
                onClick={handleAddSheet}
                className="px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl"
              >
                <Plus size={24} className="mr-3" />
                Create Sheet
              </Button>
            </div>

            {/* KPI Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Sheets */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <FileText size={28} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-3xl font-bold text-slate-900 font-display">
                      {totalSheets}
                    </div>
                    <div className="text-sm font-semibold text-slate-700 mb-1">Total Sheets</div>
                    <div className="text-xs text-blue-700 font-medium">Data organization</div>
                  </div>
                </div>
              </div>

              {/* Active Sheets */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Target size={28} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-3xl font-bold text-slate-900 font-display">
                      {activeSheets}
                    </div>
                    <div className="text-sm font-semibold text-slate-700 mb-1">Active Sheets</div>
                    <div className="text-xs text-emerald-700 font-medium">Currently tracking</div>
                  </div>
                </div>
              </div>

              {/* Total Rows */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <TrendingUp size={28} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-3xl font-bold text-slate-900 font-display">
                      {totalRows}
                    </div>
                    <div className="text-sm font-semibold text-slate-700 mb-1">Total Rows</div>
                    <div className="text-xs text-purple-700 font-medium">Data entries</div>
                  </div>
                </div>
              </div>

              {/* Total Columns */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <ListTodo size={28} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-3xl font-bold text-slate-900 font-display">
                      {totalColumns}
                    </div>
                    <div className="text-sm font-semibold text-slate-700 mb-1">Total Columns</div>
                    <div className="text-xs text-amber-700 font-medium">Data fields</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Toolbar - Full Width */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-soft">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search sheets by name..."
                className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-white text-sm font-body focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder-slate-400"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <select
                className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-body focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-slate-700"
                aria-label="Filter sheets"
              >
                <option value="">All Sheets</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>

              <select
                className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-body focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-slate-700"
                aria-label="Sort sheets"
              >
                <option value="recent">Most Recent</option>
                <option value="name">Name A-Z</option>
                <option value="rows">Most Rows</option>
                <option value="columns">Most Columns</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Sheets List */}
          {isLoading ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-soft text-center">
              <div className="text-slate-500">Loading sheets...</div>
            </div>
          ) : sheets.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-soft text-center">
              <div className="text-slate-500 mb-4">
                <div className="text-4xl mb-4">📊</div>
                <div className="text-xl font-medium text-slate-700 mb-2">No sheets yet!</div>
                <div className="text-slate-500 mb-4">
                  Create your first sheet to start organizing data.
                </div>
                <Button variant="primary" onClick={handleAddSheet}>
                  <Plus size={16} className="mr-2" />
                  Create Your First Sheet
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {sheets.map((sheet) => (
                <div key={sheet.id} className="relative">
                  <SheetViewer
                    sheet={sheet}
                    onUpdate={handleSheetSaved}
                    onDelete={() => openDeleteModal(sheet.id, sheet.name)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Add Sheet Modal */}
      {showAddModal && (
        <AddSheetModal open={showAddModal} onClose={handleCloseModal} onSave={handleSheetSaved} />
      )}

      {/* Delete Sheet Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteSheet}
        title="Delete Sheet"
        message="Are you sure you want to delete this sheet?"
        itemName={showDeleteModal.sheetName}
        confirmText="Delete Sheet"
        variant="danger"
      />
    </>
  )
}
