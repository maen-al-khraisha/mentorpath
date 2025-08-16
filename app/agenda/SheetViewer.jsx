'use client'

import { useState } from 'react'
import { addRowToSheet, updateRowInSheet, deleteRowFromSheet, deleteSheet } from '@/lib/sheetsApi'
import { useAuth } from '@/lib/useAuth'
import Button from '@/components/Button'
import { Plus, Edit, Trash2, X, Save, ChevronRight, ChevronDown } from 'lucide-react'

export default function SheetViewer({ sheet, onUpdate, onDelete }) {
  const { user } = useAuth()
  const [editingRow, setEditingRow] = useState(null)
  const [editingData, setEditingData] = useState({})
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  function handleAddRow() {
    const newRowData = {}
    sheet.columns.forEach((col) => {
      newRowData[col.name] = ''
    })
    setEditingData(newRowData)
    setEditingRow('new')
  }

  function handleEditRow(row) {
    setEditingData({ ...row.data })
    setEditingRow(row.id)
  }

  function handleCancelEdit() {
    setEditingRow(null)
    setEditingData({})
  }

  async function handleSaveRow() {
    if (!user) return

    try {
      if (editingRow === 'new') {
        await addRowToSheet(sheet.id, editingData)
      } else {
        await updateRowInSheet(sheet.id, editingRow, editingData)
      }
      setEditingRow(null)
      setEditingData({})
      onUpdate?.()
    } catch (error) {
      console.error('Failed to save row:', error)
      alert('Failed to save row: ' + error.message)
    }
  }

  async function handleDeleteRow(rowId) {
    if (!user || !confirm('Are you sure you want to delete this row?')) return

    try {
      await deleteRowFromSheet(sheet.id, rowId)
      onUpdate?.()
    } catch (error) {
      console.error('Failed to delete row:', error)
      alert('Failed to delete row: ' + error.message)
    }
  }

  async function handleDeleteSheet() {
    if (
      !user ||
      !confirm(`Are you sure you want to delete "${sheet.name}"? This cannot be undone.`)
    )
      return

    try {
      setIsDeleting(true)
      await deleteSheet(sheet.id)
      onDelete?.(sheet.id)
    } catch (error) {
      console.error('Failed to delete sheet:', error)
      alert('Failed to delete sheet: ' + error.message)
    } finally {
      setIsDeleting(false)
    }
  }

  function getInputType(columnType) {
    switch (columnType) {
      case 'number':
        return 'number'
      case 'date':
        return 'date'
      case 'email':
        return 'email'
      case 'url':
        return 'url'
      default:
        return 'text'
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
      {/* Sheet Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            title={isCollapsed ? 'Expand sheet' : 'Collapse sheet'}
          >
            {isCollapsed ? (
              <ChevronRight size={20} className="text-gray-600" />
            ) : (
              <ChevronDown size={20} className="text-gray-600" />
            )}
          </button>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{sheet.name}</h3>
            <p className="text-sm text-gray-500">
              {sheet.rows?.length || 0} rows • {sheet.columns?.length || 0} columns
            </p>
          </div>
        </div>

        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              onClick={handleAddRow}
              className="flex items-center gap-2 px-4 py-2"
            >
              <Plus size={18} />
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteSheet}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2"
            >
              <Trash2 size={18} />
            </Button>
          </div>
        )}
      </div>

      {/* Collapsible Sheet Content */}
      {!isCollapsed && (
        <div className="p-4">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  {sheet.columns?.map((column) => (
                    <th
                      key={column.name}
                      className="text-left p-3 font-semibold text-gray-700 bg-gray-50"
                    >
                      {column.name}
                    </th>
                  ))}
                  <th className="text-left p-3 font-semibold text-gray-700 bg-gray-50 w-24">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sheet.rows?.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    {sheet.columns?.map((column) => (
                      <td key={column.name} className="p-3">
                        {editingRow === row.id ? (
                          <input
                            type={getInputType(column.type)}
                            className="w-full h-9 rounded border border-gray-300 px-2 text-sm focus:border-[var(--primary)] focus:outline-none"
                            value={editingData[column.name] || ''}
                            onChange={(e) =>
                              setEditingData({
                                ...editingData,
                                [column.name]: e.target.value,
                              })
                            }
                          />
                        ) : (
                          <span className="text-sm text-gray-900">
                            {row.data[column.name] || '-'}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="p-3">
                      {editingRow === row.id ? (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={handleSaveRow}
                            className="p-2 h-10 w-10"
                          >
                            <Save size={18} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelEdit}
                            className="p-2 h-10 w-10"
                          >
                            <X size={18} />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditRow(row)}
                            className="p-2 h-10 w-10"
                            title="Edit row"
                          >
                            <Edit size={18} />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteRow(row.id)}
                            className="p-2 h-10 w-10"
                            title="Delete row"
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}

                {/* New Row (when adding) */}
                {editingRow === 'new' && (
                  <tr className="border-b border-gray-200 bg-blue-50">
                    {sheet.columns?.map((column) => (
                      <td key={column.name} className="p-3">
                        <input
                          type={getInputType(column.type)}
                          className="w-full h-9 rounded border border-gray-300 px-2 text-sm focus:border-[var(--primary)] focus:outline-none"
                          value={editingData[column.name] || ''}
                          onChange={(e) =>
                            setEditingData({
                              ...editingData,
                              [column.name]: e.target.value,
                            })
                          }
                          placeholder={`Enter ${column.name.toLowerCase()}`}
                        />
                      </td>
                    ))}
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleSaveRow}
                          className="p-2 h-10 w-10"
                        >
                          <Save size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEdit}
                          className="p-2 h-10 w-10"
                        >
                          <X size={18} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {(!sheet.rows || sheet.rows.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <p>No rows yet. Click "Add Row" to get started!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
