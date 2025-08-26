'use client'

import React, { useEffect, useCallback, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import { ChevronsLeft, ChevronsRight, Menu, X, User, LogOut, Heart, Share2 } from 'lucide-react'
import navConfig from '../lib/navConfig'
import DonationDialog from './DonationDialog'
import ShareDialog from './ShareDialog'
import { useRouter } from 'next/navigation'
import Button from '@/components/Button'
import Logo from './Logo'

export default function Sidebar({
  collapsed = false,
  onToggleCollapse,
  onMobileOpen,
  mobileOpen = false,
  onCloseMobile,
}) {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const router = useRouter()
  const [showDonationDialog, setShowDonationDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      // Redirect to home page after sign out
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: 'Check out MentorPath!',
      text: "I'm using MentorPath - an amazing productivity app for mentors and mentees 🚀",
      url: 'https://www.mentorpath.tech',
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
    const size = collapsed ? 24 : 20
    const props = { size, strokeWidth: 1.6 }
    return React.createElement(icon, props)
  }

  const navContent = (
    <div
      className={`flex flex-col h-full transition-all duration-300 bg-white/90 backdrop-blur-lg border-r border-slate-200 ${collapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-center px-4 py-6 border-b border-slate-200">
        <Link href="/" aria-label="Go to dashboard" className="flex items-center gap-3">
          {/* Logo - Adapts to collapsed state */}
          <div className="flex items-center justify-center">
            {collapsed ? (
              <Logo size="sm" showText={false} animated={true} sidebarMode={true} />
            ) : (
              <div className="flex items-center gap-4">
                <Logo size="default" showText={false} animated={true} sidebarMode={false} />
                <div className="flex flex-col">
                  <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent font-display">
                    Mentor Path
                  </span>
                  <span className="text-xs font-medium text-slate-500 tracking-wide">
                    Productivity Platform
                  </span>
                </div>
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        {/* Top Navigation Group */}
        <div className={`${collapsed ? 'flex justify-center' : 'px-3'} space-y-2`}>
          <ul className="space-y-2">
            {navConfig.slice(0, 7).map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`group flex items-center gap-3 w-full px-3 py-4 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-elevated'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                    title={collapsed ? item.label : undefined}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span
                      className={`flex items-center justify-center ${
                        collapsed ? 'w-[22px] h-[22px]' : 'min-w-[20px]'
                      } rounded-lg ${
                        isActive
                          ? '' // No hover background for active items
                          : 'hover:bg-slate-200 animate-pulse '
                      }`}
                    >
                      {renderIcon(item.icon, collapsed ? 22 : 20)}
                    </span>
                    {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Bottom Navigation Group (Admin) */}
        <div className={`${collapsed ? 'flex justify-center' : 'px-3'} space-y-2 mt-6`}>
          <ul className="space-y-2">
            {navConfig.slice(7).map((item) => {
              if (item.showForAdmin && !item.showForAdminPlaceholder) {
                return null
              }

              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`group flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-elevated'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                    title={collapsed ? item.label : undefined}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span
                      className={`flex items-center justify-center ${
                        collapsed ? 'w-[42px] h-[42px]' : 'min-w-[20px] p-2'
                      } rounded-lg ${
                        isActive
                          ? '' // No hover background for active items
                          : 'hover:bg-slate-200'
                      }`}
                    >
                      {renderIcon(item.icon, collapsed ? 22 : 20)}
                    </span>
                    {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {/* Donate Button */}
      <div
        className={`${collapsed ? 'flex justify-center' : 'px-3'} py-2 border-t border-slate-200`}
      >
        <Button
          variant="primary"
          onClick={() => setShowDonationDialog(true)}
          className={`${collapsed ? 'w-[42px] h-[42px]' : 'w-full'}`}
          title={collapsed ? 'Donate' : 'Support Development'}
          size={collapsed ? 'icon' : 'default'}
        >
          <Heart size={collapsed ? 22 : 20} className="animate-pulse" />
          {!collapsed && <span className="text-sm font-medium ml-2">Donate</span>}
        </Button>
      </div>

      {/* Share Button */}
      <div className={`${collapsed ? 'flex justify-center' : 'px-3'} py-2`}>
        <Button
          variant="primary"
          onClick={handleShare}
          className={`${collapsed ? 'w-[42px] h-[42px]' : 'w-full'}`}
          title={collapsed ? 'Share' : 'Share this app'}
          size={collapsed ? 'icon' : 'default'}
        >
          <Share2 size={collapsed ? 22 : 20} className="animate-pulse" />
          {!collapsed && <span className="text-sm font-medium ml-2">Share</span>}
        </Button>
      </div>

      {/* Collapse Toggle */}
      <div className="px-3 py-4 border-t border-slate-200">
        <Button
          variant="ghost"
          onClick={onToggleCollapse}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="w-full"
          size="icon"
        >
          {collapsed ? (
            <ChevronsRight size={18} />
          ) : (
            <>
              <ChevronsLeft size={18} />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        aria-label="Main navigation"
        className={` 
          
          hidden md:flex flex-col h-screen sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-r border-slate-200`}
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
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={onCloseMobile}
        />

        {/* Panel */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-64 transform bg-white/95 backdrop-blur-lg border-r border-slate-200 transition-transform duration-300 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Mobile Header */}
          <div className="flex items-center justify-between px-4 py-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <Logo size="default" showText={true} animated={true} sidebarMode={true} />
            </div>
            <Button variant="ghost" size="icon" onClick={onCloseMobile} aria-label="Close sidebar">
              <X size={20} className="text-slate-600" />
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            {/* Top Navigation Group */}
            <div className="px-3 space-y-2">
              <div className="text-xs font-medium text-slate-500 px-3 mb-2">Navigation</div>
              <ul className="space-y-2">
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
                        className={`group flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-all duration-300 ${
                          isActive
                            ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-elevated'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <span
                          className={`flex items-center justify-center ${
                            collapsed ? 'w-8 h-8' : 'min-w-[20px] p-2'
                          } rounded-lg ${
                            isActive
                              ? '' // No hover background for active items
                              : 'hover:bg-slate-200'
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
              <div className="text-xs font-medium text-slate-500 px-3 mb-2">Admin</div>
              <ul className="space-y-2">
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
                        className={`group flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-all duration-300 ${
                          isActive
                            ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-elevated'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <span
                          className={`flex items-center justify-center ${
                            collapsed ? 'w-8 h-8' : 'min-w-[20px] p-2'
                          } rounded-lg ${
                            isActive
                              ? '' // No hover background for active items
                              : 'hover:bg-slate-200'
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
        </div>
      </div>

      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between px-3 py-2 bg-white/40 dark:bg-gray-900/30 backdrop-blur-lg border-b border border-white/20 dark:border-gray-800/40">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileOpen}
            className="p-2 rounded-lg hover:bg-gray-800/50 transition-all duration-300"
            aria-label="Open menu"
          >
            <Menu size={20} className="text-white" />
          </Button>
          <Logo size="sm" showText={true} animated={false} textColor="white" />
        </div>
      </div>

      {/* Donation Dialog */}
      <DonationDialog isOpen={showDonationDialog} onClose={() => setShowDonationDialog(false)} />

      {/* Share Dialog */}
      <ShareDialog isOpen={showShareDialog} onClose={() => setShowShareDialog(false)} />
    </>
  )
}
