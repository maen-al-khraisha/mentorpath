export const mockTasks = [
  { id: 't1', title: 'Write daily summary', priority: 'High', due: 'Today' },
  { id: 't2', title: 'Review PRs', priority: 'Medium', due: 'Today' },
  { id: 't3', title: 'Plan next sprint', priority: 'Low', due: 'Tomorrow' },
]

export const mockEvents = [
  { id: 'e1', title: '1:1 with mentor', time: '10:00' },
  { id: 'e2', title: 'Standup', time: '11:30' },
]

export const mockNotes = [
  { id: 'n1', title: 'Project ideas' },
  { id: 'n2', title: 'Meeting summary' },
  { id: 'n3', title: 'Learning log' },
]

export const mockHabits = [
  { id: 'h1', title: 'Meditate' },
  { id: 'h2', title: 'Read 20 pages' },
]

export function getMockIfEnabled(defaultValue) {
  if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') return true
  return defaultValue
}
