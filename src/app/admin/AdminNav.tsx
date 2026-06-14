'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Heart, LayoutDashboard, BookOpen, Users, ArrowLeftRight, Megaphone, HandCoins, LogOut, GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/admin/campaigns', icon: Heart, label: 'Campaigns' },
  { href: '/admin/students', icon: BookOpen, label: 'Students' },
  { href: '/admin/sponsorships', icon: HandCoins, label: 'Sponsorships' },
  { href: '/admin/fee-payments', icon: GraduationCap, label: 'Fee Payments' },
  { href: '/admin/transactions', icon: ArrowLeftRight, label: 'Donations' },
  { href: '/admin/donors', icon: Users, label: 'Donors' },
  { href: '/admin/announcements', icon: Megaphone, label: 'Announcements' },
]

export default function AdminNav({ userName }: { userName: string }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const activeLabel = navItems.find(item => isActive(item.href, item.exact))?.label ?? 'Admin'

  const NavLinks = ({ onClose }: { onClose?: () => void }) => (
    <>
      {navItems.map(({ href, icon: Icon, label, exact }) => (
        <Link
          key={href}
          href={href}
          onClick={onClose}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
            isActive(href, exact)
              ? 'bg-emerald-50 text-emerald-700 font-medium'
              : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
          )}
        >
          <Icon className="w-4 h-4 flex-shrink-0" />
          {label}
        </Link>
      ))}
    </>
  )

  return (
    <>
      {/* Mobile sticky top bar */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 bg-white border-b h-14 flex items-center px-4 gap-3 shadow-sm">
        <button
          className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Heart className="w-3 h-3 text-white" />
          </div>
          <span className="font-semibold text-sm truncate text-emerald-700">{activeLabel}</span>
        </div>
        <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 flex-shrink-0">Exit ↗</Link>
      </header>

      {/* Mobile slide-out overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <aside className="w-72 max-w-[85vw] bg-white flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-4 h-14 border-b flex-shrink-0">
              <Link href="/admin" className="flex items-center gap-2 font-bold text-emerald-700" onClick={() => setOpen(false)}>
                <div className="w-7 h-7 bg-emerald-600 rounded-full flex items-center justify-center">
                  <Heart className="w-3.5 h-3.5 text-white" />
                </div>
                Admin Portal
              </Link>
              <button className="p-1.5 rounded-md hover:bg-gray-100" onClick={() => setOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-400 px-5 pt-2 truncate">{userName}</p>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto mt-1">
              <NavLinks onClose={() => setOpen(false)} />
            </nav>
            <div className="p-3 border-t flex-shrink-0">
              <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-600">
                <LogOut className="w-4 h-4" />
                Back to Site
              </Link>
            </div>
          </aside>
          <div className="flex-1 bg-black/40" onClick={() => setOpen(false)} />
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r flex-col flex-shrink-0">
        <div className="p-5 border-b">
          <Link href="/admin" className="flex items-center gap-2 font-bold text-emerald-700">
            <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            Admin Portal
          </Link>
          <p className="text-xs text-gray-400 mt-1 truncate">{userName}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <NavLinks />
        </nav>
        <div className="p-3 border-t">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-600">
            <LogOut className="w-4 h-4" />
            Back to Site
          </Link>
        </div>
      </aside>
    </>
  )
}
