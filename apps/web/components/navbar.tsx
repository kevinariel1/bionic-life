'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ShoppingCart, Leaf, User, LogOut, Package } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useCartStore, selectItemCount } from '@/lib/store/cart'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const itemCount = useCartStore(selectItemCount)

  useEffect(() => {
    setMounted(true)

    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)

    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      subscription.unsubscribe()
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setDropdownOpen(false)
    router.push('/')
    router.refresh()
  }

  const navLinks = [
    { href: '/products', label: 'Produk' },
    { href: '/trace', label: 'Lacak QR' },
  ]

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        transition: 'all 0.3s ease',
        backgroundColor: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--neutral-200)' : '1px solid transparent',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.06)' : 'none',
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4rem' }}>

            {/* Logo */}
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '2rem', height: '2rem', borderRadius: '0.5rem',
                background: 'linear-gradient(135deg, var(--brand-500), var(--brand-700))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Leaf size={14} color="white" />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--neutral-900)' }}>
                Bionic <span style={{ color: 'var(--brand-600)' }}>Life</span>
              </span>
            </Link>

            {/* Desktop nav links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="btn-ghost" style={{
                  color: pathname.startsWith(link.href) ? 'var(--brand-600)' : 'var(--neutral-700)',
                  fontWeight: pathname.startsWith(link.href) ? 600 : 500,
                }}>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {/* Cart */}
              <Link href="/cart" style={{ position: 'relative', textDecoration: 'none' }}>
                <button className="btn-ghost" style={{ padding: '0.5rem' }} aria-label="Keranjang">
                  <ShoppingCart size={20} />
                  {mounted && itemCount > 0 && (
                    <span style={{
                      position: 'absolute', top: '0', right: '0',
                      width: '1.1rem', height: '1.1rem',
                      borderRadius: '50%', background: 'var(--brand-500)',
                      color: 'white', fontSize: '0.65rem', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {itemCount > 9 ? '9+' : itemCount}
                    </span>
                  )}
                </button>
              </Link>

              {/* User area */}
              {mounted && user ? (
                <div style={{ position: 'relative' }} ref={dropdownRef}>
                  <button
                    id="user-menu-button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="btn-ghost"
                    style={{
                      padding: '0.4rem 0.875rem',
                      border: '1.5px solid var(--brand-200)',
                      borderRadius: '2rem',
                      gap: '0.4rem',
                      fontSize: '0.85rem',
                      color: 'var(--brand-700)',
                      background: 'var(--brand-50)',
                    }}
                  >
                    <User size={15} />
                    {user.email?.split('@')[0]}
                  </button>

                  {dropdownOpen && (
                    <div style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 0.5rem)',
                      background: 'white', border: '1px solid var(--neutral-200)',
                      borderRadius: '0.875rem', minWidth: '180px',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                      overflow: 'hidden',
                      zIndex: 200,
                    }}>
                      <Link href="/orders" onClick={() => setDropdownOpen(false)} style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.875rem 1rem',
                        textDecoration: 'none', color: 'var(--neutral-700)',
                        fontSize: '0.875rem', fontWeight: 500,
                      }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--neutral-50)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <Package size={15} /> Pesanan Saya
                      </Link>
                      <div style={{ height: '1px', background: 'var(--neutral-100)' }} />
                      <button
                        id="sign-out-button"
                        onClick={handleSignOut}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.5rem',
                          width: '100%', padding: '0.875rem 1rem',
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: '#dc2626', fontSize: '0.875rem', fontWeight: 500,
                          textAlign: 'left',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <LogOut size={15} /> Keluar
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/auth/login">
                    <button className="btn-ghost" style={{ padding: '0.5rem 0.875rem', fontSize: '0.85rem' }}>
                      Masuk
                    </button>
                  </Link>
                  <Link href="/products">
                    <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                      Belanja
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <div style={{ height: '4rem' }} />
    </>
  )
}
