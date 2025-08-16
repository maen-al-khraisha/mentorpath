'use client'

import { useState } from 'react'
import { createSheet } from '@/lib/sheetsApi'
import { useAuth } from '@/lib/useAuth'
import Button from '@/components/Button'
import { X, Plus, Trash2 } from 'lucide-react'

export default function AddSheetModal({ open, onClose, onSave }) {
  const { user, loading } = useAuth()
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
      alert('Please wait for authentication to complete')
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
      alert('Failed to create sheet: ' + e.message)
    } finally {
      setBusy(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => onClose?.()} />
      <div className="relative bg-[var(--bg-card)] border-2 border-[var(--border)] rounded-lg p-6 shadow-soft w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Create New Sheet</h3>
          <button
            onClick={() => onClose?.()}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Sheet Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sheet Name *</label>
            <input
              className={`w-full h-12 rounded-lg border-2 ${
                errors.sheetName ? 'border-red-500' : 'border-[var(--border)]'
              } bg-[var(--bg-card)] px-4 text-base placeholder-gray-500 focus:border-[var(--primary)] transition-colors`}
              placeholder="Enter sheet name"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
            />
            {errors.sheetName && <p className="text-red-500 text-sm mt-1">{errors.sheetName}</p>}
          </div>

          {/* Columns */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">Columns *</label>
              <Button
                variant="secondary"
                size="sm"
                onClick={addColumn}
                className="flex items-center gap-2"
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
                    className="flex-1 h-10 rounded-lg border-2 border-[var(--border)] bg-[var(--bg-card)] px-3 text-sm focus:border-[var(--primary)] transition-colors"
                    placeholder="Column name"
                    value={column.name}
                    onChange={(e) => updateColumn(index, 'name', e.target.value)}
                  />
                  <select
                    className="w-32 h-10 rounded-lg border-2 border-[var(--border)] bg-[var(--bg-card)] px-3 text-sm focus:border-[var(--primary)] transition-colors"
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
                      className="p-2 h-10 w-10"
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button variant="primary" onClick={handleSave} disabled={busy} className="px-6 py-2">
              {busy ? 'Creating...' : 'Create Sheet'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
