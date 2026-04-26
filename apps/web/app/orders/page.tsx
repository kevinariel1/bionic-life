import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pesanan Saya',
  description: 'Riwayat pesanan Anda di Bionic Life',
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(dateStr))
}

const STATUS_CONFIG = {
  pending: { label: 'Menunggu Pembayaran', color: '#ca8a04', bg: '#fef9c3', icon: <Clock size={14} /> },
  paid: { label: 'Dibayar', color: '#16a34a', bg: '#dcfce7', icon: <CheckCircle size={14} /> },
  cancelled: { label: 'Dibatalkan', color: '#dc2626', bg: '#fee2e2', icon: <XCircle size={14} /> },
  shipped: { label: 'Dikirim', color: '#2563eb', bg: '#dbeafe', icon: <Truck size={14} /> },
  delivered: { label: 'Diterima', color: '#16a34a', bg: '#dcfce7', icon: <CheckCircle size={14} /> },
} as const

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        quantity,
        unit_price,
        products ( name, category )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Pesanan Saya</h1>
          <p style={{ color: 'var(--neutral-500)' }}>
            {orders?.length ?? 0} pesanan ditemukan
          </p>
        </div>

        {!orders || orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📦</div>
            <h2 style={{ marginBottom: '0.75rem' }}>Belum ada pesanan</h2>
            <p style={{ color: 'var(--neutral-500)', marginBottom: '2rem' }}>
              Mulai belanja untuk melihat pesanan di sini
            </p>
            <Link href="/products" className="btn-primary">Mulai Belanja</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {orders.map((order) => {
              const statusCfg = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending

              return (
                <div key={order.id} className="card" style={{ padding: '1.5rem' }}>
                  {/* Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1.25rem',
                    gap: '1rem',
                    flexWrap: 'wrap',
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <Package size={16} color="var(--neutral-400)" />
                        <span style={{ fontSize: '0.8rem', color: 'var(--neutral-400)', fontFamily: 'monospace' }}>
                          {order.midtrans_order_id ?? order.id.slice(0, 12) + '...'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--neutral-400)' }}>
                        {formatDate(order.created_at)}
                      </p>
                    </div>

                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                      padding: '0.3rem 0.875rem',
                      borderRadius: '2rem',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      background: statusCfg.bg,
                      color: statusCfg.color,
                    }}>
                      {statusCfg.icon}
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    {(order.order_items as Array<{
                      id: string; quantity: number; unit_price: number;
                      products: { name: string; category: string } | null
                    }>).map((item) => (
                      <div key={item.id} style={{
                        display: 'flex', justifyContent: 'space-between',
                        fontSize: '0.875rem', color: 'var(--neutral-700)',
                      }}>
                        <span>
                          {item.products?.name ?? 'Produk'}
                          <span style={{ color: 'var(--neutral-400)' }}> ×{item.quantity}</span>
                        </span>
                        <span>{formatRupiah(item.unit_price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--neutral-100)',
                    flexWrap: 'wrap', gap: '0.5rem',
                  }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--neutral-500)' }}>
                      Subtotal + Ongkir {formatRupiah(order.shipping_fee)}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--brand-700)' }}>
                      Total: {formatRupiah(order.total_amount)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
