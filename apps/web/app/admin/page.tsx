import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import {
  Package, ShoppingBag, Layers, TrendingUp,
  Plus, AlertTriangle,
} from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin Dashboard | Bionic Life' }

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

export default async function AdminDashboard() {
  const supabase = await createClient()
  const admin = createAdminClient() as any // eslint-disable-line @typescript-eslint/no-explicit-any

  const [
    { count: productCount },
    { count: orderCount },
    { count: batchCount },
    { data: recentOrders },
    { data: lowStockProducts },
    { data: revenue },
  ] = await Promise.all([
    admin.from('products').select('*', { count: 'exact', head: true }),
    admin.from('orders').select('*', { count: 'exact', head: true }),
    admin.from('batches').select('*', { count: 'exact', head: true }),
    admin.from('orders').select('id, status, total_amount, created_at, midtrans_order_id').order('created_at', { ascending: false }).limit(5),
    admin.from('products').select('id, name, stock, category').lte('stock', 20).order('stock', { ascending: true }).limit(5),
    admin.from('orders').select('total_amount').eq('status', 'paid'),
  ])

  const totalRevenue = (revenue?.reduce((sum: number, o: { total_amount: number }) => sum + o.total_amount, 0) ?? 0)

  const stats = [
    { label: 'Total Produk', value: productCount ?? 0, icon: <Package size={22} />, color: 'var(--brand-600)', bg: 'var(--brand-50)', href: '/admin/products' },
    { label: 'Total Pesanan', value: orderCount ?? 0, icon: <ShoppingBag size={22} />, color: '#2563eb', bg: '#dbeafe', href: '/admin/orders' },
    { label: 'Batch Terlacak', value: batchCount ?? 0, icon: <Layers size={22} />, color: '#7c3aed', bg: '#ede9fe', href: '/admin/batches' },
    { label: 'Revenue (Paid)', value: formatRupiah(totalRevenue), icon: <TrendingUp size={22} />, color: '#ca8a04', bg: '#fef9c3', href: '/admin/orders' },
  ]

  const STATUS_COLORS: Record<string, string> = {
    paid: '#16a34a', pending: '#ca8a04', cancelled: '#dc2626',
    shipped: '#2563eb', delivered: '#16a34a',
  }

  return (
    <div style={{ maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Dashboard</h1>
        <p style={{ color: 'var(--neutral-500)', fontSize: '0.9rem' }}>
          Selamat datang kembali. Berikut ringkasan toko Anda.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ padding: '1.5rem', cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{
                  width: '2.75rem', height: '2.75rem',
                  borderRadius: '0.75rem',
                  background: stat.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: stat.color,
                }}>
                  {stat.icon}
                </div>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--neutral-900)', lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--neutral-500)', marginTop: '0.35rem' }}>
                {stat.label}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Recent Orders */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Pesanan Terbaru</h2>
            <Link href="/admin/orders" style={{ fontSize: '0.8rem', color: 'var(--brand-600)', textDecoration: 'none', fontWeight: 500 }}>
              Lihat semua →
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {!recentOrders || recentOrders.length === 0 ? (
              <p style={{ color: 'var(--neutral-400)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>
                Belum ada pesanan
              </p>
            ) : recentOrders.map((order: any) => (
              <div key={order.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.875rem 1rem',
                background: 'var(--neutral-50)',
                borderRadius: '0.75rem',
                border: '1px solid var(--neutral-100)',
              }}>
                <div>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--neutral-800)', fontFamily: 'monospace' }}>
                    {order.midtrans_order_id?.slice(-12) ?? order.id.slice(0, 8)}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--neutral-400)' }}>
                    {new Date(order.created_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--neutral-900)' }}>
                    {formatRupiah(order.total_amount)}
                  </p>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 600,
                    color: STATUS_COLORS[order.status] ?? '#666',
                    textTransform: 'capitalize',
                  }}>
                    ● {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Low Stock Warning */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={16} color="#ca8a04" /> Stok Menipis
              </h2>
            </div>
            {!lowStockProducts || lowStockProducts.length === 0 ? (
              <p style={{ color: 'var(--neutral-400)', fontSize: '0.875rem' }}>Semua stok aman ✓</p>
            ) : lowStockProducts.map((p: any) => (
              <div key={p.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.625rem 0',
                borderBottom: '1px solid var(--neutral-100)',
              }}>
                <div>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600 }}>{p.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--neutral-400)' }}>{p.category}</p>
                </div>
                <span style={{
                  padding: '0.2rem 0.625rem',
                  borderRadius: '2rem',
                  background: p.stock === 0 ? '#fee2e2' : '#fef9c3',
                  color: p.stock === 0 ? '#dc2626' : '#ca8a04',
                  fontSize: '0.75rem', fontWeight: 700,
                }}>
                  {p.stock} unit
                </span>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Aksi Cepat</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link href="/admin/products/new" className="btn-primary" style={{ justifyContent: 'flex-start', fontSize: '0.85rem' }}>
                <Plus size={16} /> Tambah Produk
              </Link>
              <Link href="/admin/batches/new" className="btn-secondary" style={{ justifyContent: 'flex-start', fontSize: '0.85rem' }}>
                <Plus size={16} /> Buat Batch QR
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
