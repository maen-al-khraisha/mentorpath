// Notes API for IndexedDB storage
import { openDB } from 'idb'

const DB_NAME = 'mentorpath-db'
const DB_VERSION = 1
const NOTES_STORE = 'notes'

// Initialize IndexedDB
async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(NOTES_STORE)) {
        const notesStore = db.createObjectStore(NOTES_STORE, { keyPath: 'id' })
        notesStore.createIndex('userId', 'userId', { unique: false })
        notesStore.createIndex('createdAt', 'createdAt', { unique: false })
        notesStore.createIndex('labels', 'labels', { unique: false })
      }
    },
  })
}

// Create a new note
export async function createNote({ title, description, labels = [], userId }) {
  // Check if user can create notes based on their plan
  const { canPerformAction, incrementUsage } = await import('./subscriptionApi')
  const canCreate = await canPerformAction(userId || 'current-user', 'notes')

  if (!canCreate) {
    throw new Error(
      'You have reached your note limit for this month. Please upgrade to Pro for unlimited notes.'
    )
  }

  const db = await initDB()
  const note = {
    id: crypto.randomUUID(),
    title: title.trim(),
    description: description.trim(),
    labels: labels.filter((l) => l.trim()),
    createdAt: new Date(),
    userId: userId || 'current-user',
  }

  await db.add(NOTES_STORE, note)

  // Increment usage for notes
  await incrementUsage(userId || 'current-user', 'notes')

  return note.id
}

// Get all notes for a user
export async function getNotes(userId = 'current-user') {
  const db = await initDB()
  const tx = db.transaction(NOTES_STORE, 'readonly')
  const store = tx.objectStore(NOTES_STORE)
  const notes = await store.getAll()

  // Filter by user ID and sort by creation date (newest first)
  const filteredNotes = notes
    .filter((note) => note.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return filteredNotes
}

// Update a note
export async function updateNote(noteId, updates) {
  const db = await initDB()
  const tx = db.transaction(NOTES_STORE, 'readwrite')
  const store = tx.objectStore(NOTES_STORE)

  const note = await store.get(noteId)
  if (!note) throw new Error('Note not found')

  const updatedNote = {
    ...note,
    ...updates,
    updatedAt: new Date(),
  }
  await store.put(updatedNote)
  return updatedNote
}

// Delete a note
export async function deleteNote(noteId, userId = 'current-user') {
  const db = await initDB()
  await db.delete(NOTES_STORE, noteId)

  // Decrement usage count when deleting a note
  try {
    const { decrementUsage } = await import('./subscriptionApi')
    await decrementUsage(userId, 'notes')
  } catch (error) {
    // Don't fail the deletion if usage tracking fails
    console.error('Failed to decrement usage for note deletion:', error)
  }
}

// Get all unique labels from notes
export async function getAllLabels(userId = 'current-user') {
  const notes = await getNotes(userId)
  const labelSet = new Set()
  notes.forEach((note) => {
    note.labels.forEach((label) => labelSet.add(label))
  })
  return Array.from(labelSet).sort()
}

// Search notes by title (case-insensitive)
export async function searchNotes(query, userId = 'current-user') {
  const notes = await getNotes(userId)
  if (!query.trim()) return notes

  const searchTerm = query.toLowerCase()
  return notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm) ||
      note.description.toLowerCase().includes(searchTerm)
  )
}

// Filter notes by label
export async function filterNotesByLabel(label, userId = 'current-user') {
  const notes = await getNotes(userId)
  if (label === 'All') return notes

  return notes.filter((note) => note.labels.includes(label))
}

// Filter notes by date range
export async function filterNotesByDateRange(startDate, endDate, userId = 'current-user') {
  const notes = await getNotes(userId)
  if (!startDate && !endDate) return notes

  return notes.filter((note) => {
    const noteDate = new Date(note.createdAt)
    const start = startDate ? new Date(startDate) : null
    const end = endDate ? new Date(endDate) : null

    if (start && end) {
      return noteDate >= start && noteDate <= end
    } else if (start) {
      return noteDate >= start
    } else if (end) {
      return noteDate <= end
    }
    return true
  })
}
