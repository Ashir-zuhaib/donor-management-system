'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, Heart, BookOpen, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/campaigns', label: 'Campaigns' },
  { href: '/student/login', label: 'Student Portal' },
  { href: '/donate', label: 'Donate Now', highlight: true },
]

export default function Navbar({ userRole }: { userRole?: string | null }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span>Al-Noor Portal</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  link.highlight
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : pathname === link.href
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                )}
              >
                {link.label}
              </Link>
            ))}
            {userRole === 'admin' && (
              <Link
                href="/admin"
                className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
              >
                Admin
              </Link>
            )}
            {userRole ? (
              <Link href="/dashboard">
                <Button variant="outline" size="sm">My Account</Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'block px-4 py-2 rounded-md text-sm font-medium',
                  link.highlight ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-secondary'
                )}
              >
                {link.label}
              </Link>
            ))}
            {userRole === 'admin' && (
              <Link href="/admin" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm text-muted-foreground hover:bg-secondary rounded-md">
                Admin Portal
              </Link>
            )}
            <div className="pt-2">
              {userRole ? (
                <Link href="/dashboard" onClick={() => setOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">My Account</Button>
                </Link>
              ) : (
                <Link href="/login" onClick={() => setOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">Login</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
