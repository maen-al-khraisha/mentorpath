'use client'

import { useState } from 'react'
import { createSheet } from '@/lib/sheetsApi'
import { useAuth } from '@/lib/useAuth'
import Button from '@/components/Button'
import Modal from '@/components/ui/Modal'
import { Plus, Trash2, FileText, ListTodo } from 'lucide-react'
import { useToast } from '@/components/Toast'

export default function AddSheetModal({ open, onClose, onSave }) {
  const { user, loading } = useAuth()
  const { showToast } = useToast()
  const [sheetName, setSheetName] = useState('')
  const [columns, setColumns] = useState([
    { name: 'Name', type: 'text' },
    { name: 'Email', type: 'text' },
    { name: 'Phone', type: 'text' },
  ])
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState({})

  function validateForm() {
    const newErrors = {}

    if (!sheetName.trim()) newErrors.sheetName = 'Sheet name is required'
    if (columns.length === 0) newErrors.columns = 'At least one column is required'
    if (columns.some((col) => !col.name.trim())) newErrors.columns = 'All columns must have names'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function addColumn() {
    setColumns([...columns, { name: '', type: 'text' }])
  }

  function removeColumn(index) {
    if (columns.length > 1) {
      setColumns(columns.filter((_, i) => i !== index))
    }
  }

  function updateColumn(index, field, value) {
    const newColumns = [...columns]
    newColumns[index] = { ...newColumns[index], [field]: value }
    setColumns(newColumns)
  }

  async function handleSave() {
    if (!user) {
      showToast('Please wait for authentication to complete', 'error')
      return
    }

    if (!validateForm()) return

    try {
      setBusy(true)

      const sheetData = {
        name: sheetName.trim(),
        columns: columns.filter((col) => col.name.trim()), // Remove empty columns
      }

      await createSheet(sheetData)
      showToast(`Sheet "${sheetData.name}" created successfully!`, 'success')
      onSave?.()
      onClose?.()

      // Reset form
      setSheetName('')
      setColumns([
        { name: 'Name', type: 'text' },
        { name: 'Email', type: 'text' },
        { name: 'Phone', type: 'text' },
      ])
    } catch (e) {
      console.error(e)
      showToast('Failed to create sheet: ' + e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  if (!open) return null

  const modalHeader = {
    icon: <FileText size={24} className="text-blue-600" />,
    iconBgColor: 'bg-blue-100',
    title: 'Create New Sheet',
    subtitle: 'Set up your data structure with custom columns',
  }

  const modalContent = (
    <div className="space-y-6">
      {/* Sheet Name */}
      <div>
        <label className="block text-base font-semibold text-slate-900 mb-1">Sheet Name</label>
        <input
          className={`w-full h-12 rounded-xl border-2 ${
            errors.sheetName ? 'border-red-500' : 'border-slate-200'
          } bg-white px-4 text-base font-body placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200`}
          placeholder="Enter sheet name"
          value={sheetName}
          onChange={(e) => setSheetName(e.target.value)}
        />
        {errors.sheetName && <p className="text-red-500 text-sm mt-1">{errors.sheetName}</p>}
      </div>

      {/* Columns */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-base font-semibold text-slate-900">Columns</label>
          <Button
            variant="secondary"
            size="sm"
            onClick={addColumn}
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
          >
            <Plus size={14} />
            Add Column
          </Button>
        </div>

        {errors.columns && <p className="text-red-500 text-sm mb-3">{errors.columns}</p>}

        <div className="space-y-3">
          {columns.map((column, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                className="flex-1 h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-sm font-body focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
                placeholder="Column name"
                value={column.name}
                onChange={(e) => updateColumn(index, 'name', e.target.value)}
              />
              <select
                className="w-32 h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-sm font-body focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 text-slate-700"
                value={column.type}
                onChange={(e) => updateColumn(index, 'type', e.target.value)}
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="email">Email</option>
                <option value="url">URL</option>
              </select>
              {columns.length > 1 && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => removeColumn(index)}
                  className="p-2 h-12 w-12 rounded-xl"
                >
                  <Trash2 size={14} />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const modalFooter = (
    <>
      <Button variant="secondary" onClick={onClose} className="px-6 py-3 rounded-xl font-medium">
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleSave}
        disabled={busy}
        className="px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
      >
        {busy ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Creating...
          </>
        ) : (
          <>
            <Plus size={18} className="mr-2" />
            Create Sheet
          </>
        )}
      </Button>
    </>
  )

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      header={modalHeader}
      content={modalContent}
      footer={modalFooter}
      size="default"
    />
  )
}
