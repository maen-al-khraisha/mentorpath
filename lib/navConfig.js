// lib/navConfig.js
import {
  Home,
  CheckSquare,
  FileText,
  Calendar,
  Repeat,
  Table,
  BarChart2,
  Settings,
} from 'lucide-react'

const navConfig = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare },
  { label: 'Notes', href: '/notes', icon: FileText },
  { label: 'Calendar', href: '/calendar', icon: Calendar },
  { label: 'Habits', href: '/habits', icon: Repeat },
  { label: 'Agenda', href: '/agenda', icon: Table },
  { label: 'Insights', href: '/insights', icon: BarChart2 },
]

export default navConfig
