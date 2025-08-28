'use client'

import { useState, useMemo } from 'react'
import {
  addRowToSheet,
  updateRowInSheet,
  deleteRowFromSheet,
  deleteSheet,
  updateSheet,
} from '@/lib/sheetsApi'
import { useAuth } from '@/lib/useAuth'
import Button from '@/components/Button'
import {
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  FileText,
} from 'lucide-react'

export default function SheetViewer({ sheet, onUpdate, onDelete }) {
  const { user } = useAuth()
  const [editingRow, setEditingRow] = useState(null)
  const [editingData, setEditingData] = useState({})
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Column sorting state
  const [sortConfig, setSortConfig] = useState({
    field: null,
    direction: 'asc',
  })

  // Search state
  const [searchQuery, setSearchQuery] = useState('')

  // Sheet name editing state
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState('')

  // Filter and sort the rows based on search and sort configuration
  const filteredAndSortedRows = useMemo(() => {
    let filtered = sheet.rows || []

    // Apply search filter on first column if search query exists
    if (searchQuery.trim() && sheet.columns && sheet.columns.length > 0) {
      const firstColumnName = sheet.columns[0].name
      filtered = filtered.filter((row) => {
        const cellValue = row.data[firstColumnName] || ''
        return cellValue.toString().toLowerCase().includes(searchQuery.toLowerCase())
      })
    }

    // Apply sorting if configured
    if (sortConfig.field) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a.data[sortConfig.field] || ''
        const bValue = b.data[sortConfig.field] || ''

        let comparison = 0
        const aNum = parseFloat(aValue)
        const bNum = parseFloat(bValue)

        if (!isNaN(aNum) && !isNaN(bNum)) {
          comparison = aNum - bNum
        } else {
          comparison = aValue
            .toString()
            .toLowerCase()
            .localeCompare(bValue.toString().toLowerCase())
        }

        return sortConfig.direction === 'asc' ? comparison : -comparison
      })
    }

    return filtered
  }, [sheet.rows, searchQuery, sortConfig, sheet.columns])

  // Handle column sorting
  function handleSort(columnName) {
    setSortConfig((prevConfig) => {
      if (prevConfig.field === columnName) {
        // If clicking the same column, toggle direction
        return {
          field: columnName,
          direction: prevConfig.direction === 'asc' ? 'desc' : 'asc',
        }
      } else {
        // If clicking a different column, start with ascending
        return {
          field: columnName,
          direction: 'asc',
        }
      }
    })
  }

  // Get sort icon for column header
  function getSortIcon(columnName) {
    if (sortConfig.field !== columnName) {
      return (
        <ArrowUpDown
          size={16}
          className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
        />
      )
    }

    return sortConfig.direction === 'asc' ? (
      <ArrowUp size={16} className="text-blue-600" />
    ) : (
      <ArrowDown size={16} className="text-blue-600" />
    )
  }

  // Search handler functions
  function handleSearchChange(e) {
    setSearchQuery(e.target.value)
  }

  function clearSearch() {
    setSearchQuery('')
  }

  // Sheet name editing functions
  function handleNameClick() {
    setIsEditingName(true)
    setEditedName(sheet.name)
  }

  function handleNameChange(e) {
    setEditedName(e.target.value)
  }

  function handleNameKeyDown(e) {
    if (e.key === 'Enter') {
      handleSaveName()
    } else if (e.key === 'Escape') {
      handleCancelNameEdit()
    }
  }

  async function handleSaveName() {
    if (!user || !editedName.trim()) {
      handleCancelNameEdit()
      return
    }

    try {
      await updateSheet(sheet.id, { name: editedName.trim() })
      setIsEditingName(false)
      // Update the sheet in parent component
      if (onUpdate) {
        onUpdate({ ...sheet, name: editedName.trim() })
      }
    } catch (error) {
      console.error('Error updating sheet name:', error)
      handleCancelNameEdit()
    }
  }

  function handleCancelNameEdit() {
    setIsEditingName(false)
    setEditedName('')
  }

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
    <div className="bg-white border border-slate-200 rounded-2xl shadow-soft overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <FileText size={20} className="text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              {isEditingName ? (
                <input
                  type="text"
                  value={editedName}
                  onChange={handleNameChange}
                  onKeyDown={handleNameKeyDown}
                  onBlur={handleSaveName}
                  className="text-xl font-semibold text-slate-900 font-display bg-transparent border-b-2 border-blue-500 outline-none focus:border-blue-600 px-1"
                  autoFocus
                />
              ) : (
                <h3
                  className="text-xl font-semibold text-slate-900 font-display cursor-pointer hover:text-blue-600 transition-colors px-1 py-1 rounded hover:bg-blue-50"
                  onClick={handleNameClick}
                  title="Click to edit sheet name"
                >
                  {sheet.name}
                </h3>
              )}
            </div>
            <p className="text-sm text-slate-600">
              {filteredAndSortedRows.length} of {sheet.rows?.length || 0} rows •{' '}
              {sheet.columns?.length || 0} columns
              {sortConfig.field && (
                <span className="ml-2 text-blue-600">
                  • Sorted by {sortConfig.field} ({sortConfig.direction === 'asc' ? 'A→Z' : 'Z→A'})
                </span>
              )}
              {searchQuery && (
                <span className="ml-2 text-emerald-600">• Filtered by "{searchQuery}"</span>
              )}
            </p>
          </div>
          <span className="px-4 py-2 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
            {sheet.columns?.length || 0} columns
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl hover:bg-slate-100"
            title={isCollapsed ? 'Expand sheet' : 'Collapse sheet'}
          >
            {isCollapsed ? (
              <ChevronRight size={16} className="text-slate-600" />
            ) : (
              <ChevronDown size={16} className="text-slate-600" />
            )}
          </Button>
          {!isCollapsed && (
            <>
              {/* Clear Sort Button */}
              {sortConfig.field && (
                <Button
                  variant="ghost"
                  onClick={() => setSortConfig({ field: null, direction: 'asc' })}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl hover:bg-slate-100"
                  title="Clear sorting"
                >
                  <X size={16} />
                  Clear Sort
                </Button>
              )}
              <Button
                variant="primary"
                onClick={handleAddRow}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl"
              >
                <Plus size={16} />
                Add Row
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteSheet}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl"
              >
                <Trash2 size={16} />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Collapsible Sheet Content */}
      {!isCollapsed && (
        <div className="p-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder={`Search in ${sheet.columns?.[0]?.name || 'first column'}...`}
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full h-12 pl-12 pr-12 rounded-xl border border-slate-200 bg-white text-sm font-body focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder-slate-400"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 p-2 rounded-lg"
                >
                  <X size={16} />
                </Button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  {sheet.columns?.map((column) => (
                    <th
                      key={column.name}
                      className="text-left p-3 font-semibold text-slate-700 bg-slate-50"
                    >
                      <Button
                        variant="ghost"
                        className="group flex items-center gap-2 w-full hover:text-blue-600 transition-colors p-0 h-auto"
                        onClick={() => handleSort(column.name)}
                        title={`Sort by ${column.name}`}
                      >
                        {getSortIcon(column.name)}
                        <span>{column.name}</span>
                      </Button>
                    </th>
                  ))}
                  <th className="text-left p-3 font-semibold text-slate-700 bg-slate-50 w-24">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedRows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50">
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
