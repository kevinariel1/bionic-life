'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, Leaf, Menu, X, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCartStore, selectItemCount } from '@/lib/store/cart'

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const itemCount = useCartStore(selectItemCount)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/products', label: 'Produk' },
    { href: '/trace', label: 'Lacak QR' },
  ]

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: 'all 0.3s ease',
        backgroundColor: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--neutral-200)' : '1px solid transparent',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.06)' : 'none',
      }}>
        <div className="container">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '4rem',
          }}>
            {/* Logo */}
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '0.5rem',
                background: 'linear-gradient(135deg, var(--brand-500), var(--brand-700))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Leaf size={14} color="white" />
              </div>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '1.1rem',
                color: 'var(--neutral-900)',
              }}>
                Bionic <span style={{ color: 'var(--brand-600)' }}>Life</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="btn-ghost"
                  style={{
                    color: pathname === link.href ? 'var(--brand-600)' : 'var(--neutral-700)',
                    fontWeight: pathname === link.href ? 600 : 500,
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link href="/cart" style={{ position: 'relative', textDecoration: 'none' }}>
                <button className="btn-ghost" style={{ padding: '0.5rem' }} aria-label="Cart">
                  <ShoppingCart size={20} />
                  {mounted && itemCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '0',
                      right: '0',
                      width: '1.1rem',
                      height: '1.1rem',
                      borderRadius: '50%',
                      background: 'var(--brand-500)',
                      color: 'white',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {itemCount > 9 ? '9+' : itemCount}
                    </span>
                  )}
                </button>
              </Link>
              <Link href="/auth/login">
                <button className="btn-ghost" style={{ padding: '0.5rem' }} aria-label="Account">
                  <User size={20} />
                </button>
              </Link>
              <Link href="/products">
                <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                  Belanja
                </button>
              </Link>

              {/* Mobile menu toggle */}
              <button
                className="btn-ghost"
                style={{ padding: '0.5rem', display: 'none' }}
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menu"
                id="mobile-menu-toggle"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>
      {/* Spacer */}
      <div style={{ height: '4rem' }} />
    </>
  )
}
