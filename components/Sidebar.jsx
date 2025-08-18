'use client'

import React, { useEffect, useCallback, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import { ChevronsLeft, ChevronsRight, Menu, X, User, LogOut, Heart, Share2 } from 'lucide-react'
import navConfig from '../lib/navConfig'
import DonationDialog from './DonationDialog'
import ShareDialog from './ShareDialog'

export default function Sidebar({
  collapsed = false,
  onToggleCollapse,
  onMobileOpen,
  mobileOpen = false,
  onCloseMobile,
}) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [showDonationDialog, setShowDonationDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: "Check out this app!",
      text: "I'm using this productivity app, it's awesome 🚀",
      url: window.location.origin
    }

    // Check if Web Share API is supported
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error)
          setShowShareDialog(true)
        }
      }
    } else {
      // Fallback to custom share dialog
      setShowShareDialog(true)
    }
  }

  const renderIcon = (icon) => {
    const size = collapsed ? 24 : 18
    const props = { size, strokeWidth: 1.6 }
    return React.createElement(icon, props)
  }

  const navContent = (
    <div
      className={`flex flex-col h-full transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-center px-4 py-6 border-b border-green dark:border-gray-800/40">
        <Link href="/" aria-label="Go to dashboard" className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center rounded-lg ${
              collapsed ? 'w-10 h-10' : 'w-12 h-12'
            } `}
            aria-hidden
          >
            {/* <span className="font-bold text-sm">MP</span> */}
            <img src="/icons/logo3.png" alt="MentorPath" className="w-10 h-10" />
          </div>
          {!collapsed && (
            <div>
              <span className="font-bold text-lg text-gray-600">MentorPath</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        {/* Top Navigation Group */}
        <div className="px-3 space-y-2">
          <ul className="space-y-5">
            {navConfig.slice(0, 7).map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`group flex items-center gap-3 w-full px-1 py-1 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-green-500 text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-800/40'
                    }`}
                    title={collapsed ? item.label : undefined}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span
                      className={`flex items-center justify-center ${
                        collapsed ? 'w-8 h-8' : 'min-w-[20px] p-2'
                      } rounded-lg ${
                        isActive
                          ? '' // No hover background for active items
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {renderIcon(item.icon)}
                    </span>
                    {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Bottom Navigation Group (Admin) */}
        <div className="px-3 space-y-2 mt-6">
          <ul className="space-y-1">
            {navConfig.slice(7).map((item) => {
              if (item.showForAdmin && !item.showForAdminPlaceholder) {
                return null
              }

              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`group flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-green-500 text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-800/40'
                    }`}
                    title={collapsed ? item.label : undefined}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span
                      className={`flex items-center justify-center ${
                        collapsed ? 'w-8 h-8' : 'min-w-[20px] p-2'
                      } rounded-lg ${
                        isActive
                          ? '' // No hover background for active items
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {renderIcon(item.icon)}
                    </span>
                    {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {/* Profile Section */}
      {!collapsed && user && (
        <div className="px-3 py-4 border-t border-white/20 dark:border-gray-800/40">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
              <User size={18} className="text-accent-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.email?.split('@')[0] || 'User'}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {user.email || 'user@example.com'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Donate Button */}
      <div className="px-3 py-2 border-t border-white/20 dark:border-gray-800/40">
        <button
          onClick={() => setShowDonationDialog(true)}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-pink-500 to-red-500 text-white hover:from-pink-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          title={collapsed ? 'Donate' : 'Support Development'}
        >
          <Heart size={collapsed ? 18 : 16} className="animate-pulse" />
          {!collapsed && <span className="text-sm font-medium">Donate</span>}
        </button>
      </div>

      {/* Share Button */}
      <div className="px-3 py-2">
        <button
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          title={collapsed ? "Share" : "Share this app"}
        >
          <Share2 size={collapsed ? 18 : 16} />
          {!collapsed && <span className="text-sm font-medium">Share</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <div className="px-3 py-4 border-t border-white/20 dark:border-gray-800/40">
        <button
          onClick={onToggleCollapse}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-800/40 transition-all duration-300 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          {collapsed ? (
            <ChevronsRight size={18} />
          ) : (
            <>
              <ChevronsLeft size={18} />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        aria-label="Main navigation"
        className={` 
          
          rounded-xl hidden md:flex flex-col h-screen sticky top-0 z-40 bg-white/70 dark:bg-gray-900/30 backdrop-blur-lg  `}
      >
        {navContent}
      </aside>

      {/* Mobile slide-over */}
      <div
        className={`md:hidden fixed inset-0 z-50 ${mobileOpen ? '' : 'pointer-events-none'}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Sidebar"
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={onCloseMobile}
        />

        {/* Panel */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-64 transform bg-white/40 dark:bg-gray-900/30 backdrop-blur-lg border-r border border-white/20 dark:border-gray-800/40 transition-transform duration-300 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Mobile Header */}
          <div className="flex items-center justify-between px-4 py-6 border-b border-white/20 dark:border-gray-800/40">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-accent text-accent-foreground flex items-center justify-center">
                <span className="font-bold text-sm">MP</span>
              </div>
              <div>
                <span className="font-bold text-lg text-white">MentorPath</span>
              </div>
            </div>
            <button
              className="p-2 rounded-lg hover:bg-gray-800/50 transition-all duration-300"
              onClick={onCloseMobile}
              aria-label="Close sidebar"
            >
              <X size={20} className="text-white" />
            </button>
          </div>

          {/* Mobile Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            {/* Top Navigation Group */}
            <div className="px-3 space-y-2">
              <div className="text-xs font-medium text-gray-400 px-3 mb-2">Navigation</div>
              <ul className="space-y-1">
                {navConfig.slice(0, 7).map((item) => {
                  if (item.showForAdmin && !item.showForAdminPlaceholder) {
                    return null
                  }

                  const isActive = pathname === item.href
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onCloseMobile}
                        className={`group flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-all duration-300 ${
                          isActive
                            ? 'bg-green-500 text-white shadow-md'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-800/40'
                        }`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <span
                          className={`flex items-center justify-center ${
                            collapsed ? 'w-8 h-8' : 'min-w-[20px] p-2'
                          } rounded-lg ${
                            isActive
                              ? '' // No hover background for active items
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          {React.createElement(item.icon, {
                            size: collapsed ? 24 : 18,
                            strokeWidth: 1.6,
                          })}
                        </span>
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Bottom Navigation Group (Admin) */}
            <div className="px-3 space-y-2 mt-6">
              <div className="text-xs font-medium text-gray-400 px-3 mb-2">Admin</div>
              <ul className="space-y-1">
                {navConfig.slice(7).map((item) => {
                  if (item.showForAdmin && !item.showForAdminPlaceholder) {
                    return null
                  }

                  const isActive = pathname === item.href
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onCloseMobile}
                        className={`group flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-all duration-300 ${
                          isActive
                            ? 'bg-green-500 text-white shadow-md'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-800/40'
                        }`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <span
                          className={`flex items-center justify-center ${
                            collapsed ? 'w-8 h-8' : 'min-w-[20px] p-2'
                          } rounded-lg ${
                            isActive
                              ? '' // No hover background for active items
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          {React.createElement(item.icon, {
                            size: collapsed ? 24 : 18,
                            strokeWidth: 1.6,
                          })}
                        </span>
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          {/* Mobile Profile Section */}
          {user && (
            <div className="px-3 py-4 border-t border-white/20 dark:border-gray-800/40">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                  <User size={18} className="text-accent-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.email?.split('@')[0] || 'User'}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {user.email || 'user@example.com'}
                  </div>
                </div>
              </div>

              {/* Mobile Actions */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={handleSignOut}
                  className="flex-1 p-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-800/40 transition-all duration-300 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center justify-center gap-2"
                >
                  <LogOut size={16} />
                  <span className="text-sm">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between px-3 py-2 bg-white/40 dark:bg-gray-900/30 backdrop-blur-lg border-b border border-white/20 dark:border-gray-800/40">
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileOpen}
            className="p-2 rounded-lg hover:bg-gray-800/50 transition-all duration-300"
            aria-label="Open menu"
          >
            <Menu size={20} className="text-white" />
          </button>
          <div className="font-bold text-white">MentorPath</div>
        </div>
      </div>

      {/* Donation Dialog */}
      <DonationDialog isOpen={showDonationDialog} onClose={() => setShowDonationDialog(false)} />

      {/* Share Dialog */}
      <ShareDialog isOpen={showShareDialog} onClose={() => setShowShareDialog(false)} />
    </>
  )
}
