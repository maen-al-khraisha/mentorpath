// 'use client'

// import { useMemo } from 'react'
// import {
//   X,
//   ChevronLeft,
//   ChevronRight,
//   LayoutDashboard,
//   CheckSquare,
//   NotebookPen,
//   CalendarDays,
//   Activity,
//   ListTodo,
//   BarChart3,
//   Shield,
// } from 'lucide-react'
// import NavLink from '@/components/NavLink'
// import { navItems } from '@/lib/navConfig'

// // Sidebar props:
// // - collapsed: boolean
// // - onToggleCollapse: function
// // - mobileOpen: boolean
// // - onCloseMobile: function
// export default function Sidebar({
//   collapsed = false,
//   onToggleCollapse,
//   mobileOpen = false,
//   onCloseMobile,
// }) {
//   const iconMap = useMemo(
//     () => ({
//       LayoutDashboard,
//       CheckSquare,
//       NotebookPen,
//       CalendarDays,
//       Activity,
//       ListTodo,
//       BarChart3,
//       Shield,
//     }),
//     []
//   )

//   const isAdmin =
//     typeof window !== 'undefined' &&
//     (localStorage.getItem('mentorpath.isAdmin') === 'true' ||
//       process.env.NEXT_PUBLIC_ADMIN_MODE === 'true')

//   const content = (
//     <div
//       className={`flex flex-col h-full ${collapsed ? 'w-[72px]' : 'w-[260px]'} bg-[var(--neutral-900)] text-white`}
//     >
//       <div className="flex items-center gap-2 px-3 py-4 border-b border-white/10">
//         <div className="w-6 h-6 rounded-md bg-[var(--primary)]" aria-hidden />
//         {!collapsed && <div className="text-sm font-semibold">MentorPath</div>}
//       </div>
//       <nav className="px-2 py-3 space-y-1" role="navigation" aria-label="Main Navigation">
//         {navItems
//           .filter((n) => !n.showForAdmin || isAdmin)
//           .map((n) => {
//             const Icon = iconMap[n.iconName]
//             return (
//               <NavLink
//                 key={n.href}
//                 href={n.href}
//                 icon={Icon}
//                 label={n.label}
//                 collapsed={collapsed}
//               />
//             )
//           })}
//       </nav>
//       <div className="mt-auto border-t border-white/10 p-2">
//         <button
//           type="button"
//           onClick={onToggleCollapse}
//           className="w-full flex items-center justify-center gap-2 text-white/90 hover:text-white hover:bg-white/10 rounded-md h-9 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
//           aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
//           aria-expanded={!collapsed}
//           title={collapsed ? 'Expand' : 'Collapse'}
//         >
//           {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
//           {!collapsed && <span className="text-xs">Collapse</span>}
//         </button>
//       </div>
//     </div>
//   )

//   return (
//     <>
//       {/* Desktop / tablet sidebar */}
//       <aside className={`hidden md:flex shrink-0 sticky top-0 min-h-screen`} aria-label="Sidebar">
//         {content}
//       </aside>

//       {/* Mobile slide-over */}
//       <div
//         className={`md:hidden fixed inset-0 z-50 ${mobileOpen ? '' : 'pointer-events-none'}`}
//         role="dialog"
//         aria-modal="true"
//         aria-label="Mobile Sidebar"
//       >
//         {/* Backdrop */}
//         <div
//           className={`absolute inset-0 bg-black/40 transition-opacity ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
//           onClick={onCloseMobile}
//         />
//         {/* Panel */}
//         <div
//           className={`absolute left-0 top-0 bottom-0 w-[260px] transform bg-[var(--neutral-900)] text-white transition-transform ${
//             mobileOpen ? 'translate-x-0' : '-translate-x-full'
//           }`}
//         >
//           <div className="flex items-center justify-between px-3 py-4 border-b border-white/10">
//             <div className="flex items-center gap-2">
//               <div className="w-6 h-6 rounded-md bg-[var(--primary)]" aria-hidden />
//               <div className="text-sm font-semibold">MentorPath</div>
//             </div>
//             <button
//               className="p-2 rounded hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
//               onClick={onCloseMobile}
//               aria-label="Close sidebar"
//             >
//               <X size={18} />
//             </button>
//           </div>
//           <nav className="px-2 py-3 space-y-1" role="navigation" aria-label="Main Navigation">
//             {navItems
//               .filter((n) => !n.showForAdmin || isAdmin)
//               .map((n) => {
//                 const Icon = iconMap[n.iconName]
//                 return (
//                   <NavLink
//                     key={n.href}
//                     href={n.href}
//                     icon={Icon}
//                     label={n.label}
//                     collapsed={false}
//                   />
//                 )
//               })}
//           </nav>
//         </div>
//       </div>
//     </>
//   )
// }

// components/Sidebar.jsx
'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  CheckSquare,
  FileText,
  Calendar,
  Repeat,
  Table,
  BarChart2,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  Menu,
} from 'lucide-react'
import navConfig from '../lib/navConfig'

const LOCAL_KEY = 'mentorpath.sidebarCollapsed'

export default function Sidebar({ onMobileOpen }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  // load persisted state
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY)
      if (raw !== null) setCollapsed(raw === 'true')
    } catch (e) {
      // ignore
    }
  }, [])

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_KEY, String(collapsed))
    } catch (e) {}
  }, [collapsed])

  // keyboard shortcut Ctrl + \
  useEffect(() => {
    function onKey(e) {
      if (e.ctrlKey && e.key === '\\') {
        setCollapsed((c) => !c)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const toggle = useCallback(() => setCollapsed((c) => !c), [])

  const renderIcon = (icon) => {
    const size = 18
    const props = { size, strokeWidth: 1.6 }
    return React.createElement(icon, props)
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <nav
        aria-label="Main navigation"
        className={`hidden md:flex flex-col h-screen sticky top-0 z-40 transition-all duration-200 ${
          collapsed ? 'w-20' : 'w-64'
        } bg-[var(--neutral-900)] text-[var(--bg-card)]`}
      >
        <div className="flex items-center gap-3 px-4 py-4 border-b border-[var(--border)]">
          <Link href="/" aria-label="Go to landing page" className="flex items-center gap-3">
            <div
              className={`flex items-center justify-center rounded-md ${
                collapsed ? 'w-10 h-10' : 'w-12 h-12'
              } bg-[var(--bg-card)]`}
              aria-hidden
            >
              <span className="font-bold text-[var(--neutral-900)] text-sm">MP</span>
            </div>
            {!collapsed && (
              <div>
                <span className="font-semibold">MentorPath</span>
                <div className="text-xs text-[var(--muted1)]">Your guide</div>
              </div>
            )}
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto">
          <ul className="p-2 space-y-1">
            {navConfig.map((item) => {
              if (item.showForAdmin && !item.showForAdminPlaceholder) {
                // navConfig should set showForAdminPlaceholder true if you want Admin visible in demo mock.
                // Actual admin gating should be handled in UI by checking auth.
              }

              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`group flex items-center gap-3 w-full px-3 py-2 rounded-md transition-colors  ${
                      isActive
                        ? 'bg-[var(--primary)] text-[var(--neutral-900)]'
                        : 'text-[var(--bg-card)] hover:bg-[rgba(255,255,255,0.04)]'
                    }`}
                    title={collapsed ? item.label : undefined}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="flex items-center">{renderIcon(item.icon)}</span>
                    {!collapsed && <span className="text-sm">{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="px-3 py-3 border-t border-[var(--border)]">
          <div className="flex items-center justify-between gap-2">
            {!collapsed && <div className="text-xs text-[var(--muted1)]">Tip: Ctrl + \</div>}

            <div className="flex items-center gap-2">
              <button
                onClick={toggle}
                aria-expanded={!collapsed}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                className="p-2 rounded-md hover:bg-[rgba(255,255,255,0.04)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                {collapsed ? (
                  <ChevronsRight size={16} strokeWidth={1.6} />
                ) : (
                  <ChevronsLeft size={16} strokeWidth={1.6} />
                )}
              </button>
              {/* Mobile open button */}
              <button
                onClick={onMobileOpen}
                className="p-2 rounded-md md:hidden hover:bg-[rgba(255,255,255,0.04)] focus:outline-none"
                aria-label="Open menu"
              >
                <Menu size={16} strokeWidth={1.6} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile: slide-over placeholder; actual slide-over controlled by parent */}
      <div className="md:hidden flex items-center justify-between px-3 py-2 bg-[var(--bg-card)] border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileOpen}
            className="p-2 rounded-md hover:bg-[var(--muted1)] focus:outline-none"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <div className="font-semibold">MentorPath</div>
        </div>
      </div>
    </>
  )
}
