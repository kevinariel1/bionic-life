'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Package, Layers, ShoppingBag,
  Leaf, LogOut, QrCode, ExternalLink,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface AdminSidebarProps {
  userEmail: string
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} />, exact: true },
  { href: '/admin/products', label: 'Produk', icon: <Package size={18} />, exact: false },
  { href: '/admin/batches', label: 'Batch & QR', icon: <Layers size={18} />, exact: false },
  { href: '/admin/orders', label: 'Pesanan', icon: <ShoppingBag size={18} />, exact: false },
]

export function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <aside style={{
      position: 'fixed',
      top: 0, left: 0, bottom: 0,
      width: '260px',
      background: 'var(--neutral-900)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
      overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: '2.25rem', height: '2.25rem',
            borderRadius: '0.625rem',
            background: 'linear-gradient(135deg, var(--brand-500), var(--brand-700))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Leaf size={14} color="white" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'white', fontSize: '1rem' }}>
              Bionic Life
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--brand-400)', fontWeight: 500 }}>
              Admin Panel
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--neutral-500)', padding: '0 0.75rem', marginBottom: '0.5rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Navigasi
        </div>
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 0.875rem',
                borderRadius: '0.625rem',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: active ? 600 : 400,
                color: active ? 'white' : 'var(--neutral-400)',
                background: active ? 'rgba(34,197,94,0.15)' : 'transparent',
                border: active ? '1px solid rgba(34,197,94,0.25)' : '1px solid transparent',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
            >
              <span style={{ color: active ? 'var(--brand-400)' : 'var(--neutral-500)' }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          )
        })}

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0.75rem 0' }} />

        {/* View storefront */}
        <Link href="/" target="_blank" style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.75rem 0.875rem',
          borderRadius: '0.625rem',
          textDecoration: 'none',
          fontSize: '0.875rem',
          color: 'var(--neutral-500)',
          border: '1px solid transparent',
          transition: 'all 0.15s',
        }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = 'var(--neutral-300)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--neutral-500)' }}
        >
          <ExternalLink size={18} /> Lihat Storefront
        </Link>

        <Link href="/trace" target="_blank" style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.75rem 0.875rem',
          borderRadius: '0.625rem',
          textDecoration: 'none',
          fontSize: '0.875rem',
          color: 'var(--neutral-500)',
          border: '1px solid transparent',
          transition: 'all 0.15s',
        }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = 'var(--neutral-300)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--neutral-500)' }}
        >
          <QrCode size={18} /> Halaman Trace
        </Link>
      </nav>

      {/* User + Sign out */}
      <div style={{
        padding: '1rem 0.75rem',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: '0.625rem',
          padding: '0.75rem',
          borderRadius: '0.75rem',
          background: 'rgba(255,255,255,0.04)',
          marginBottom: '0.5rem',
        }}>
          <div style={{
            width: '2rem', height: '2rem',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--brand-500), var(--brand-700))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem', color: 'white', fontWeight: 700, flexShrink: 0,
          }}>
            {userEmail[0]?.toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--neutral-300)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userEmail}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--brand-400)', fontWeight: 600 }}>
              Admin
            </div>
          </div>
        </div>
        <button
          id="admin-sign-out"
          onClick={handleSignOut}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            width: '100%', padding: '0.625rem 0.75rem',
            background: 'none', border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            color: 'var(--neutral-500)', fontSize: '0.875rem',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#fc8181'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--neutral-500)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
        >
          <LogOut size={16} /> Keluar
        </button>
      </div>
    </aside>
  )
}
