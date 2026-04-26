import { createAdminClient } from '@/lib/supabase/admin'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Semua Pesanan | Admin' }

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

function formatDate(d: string) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d))
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: '#ca8a04', bg: '#fef9c3' },
  paid: { label: 'Dibayar', color: '#16a34a', bg: '#dcfce7' },
  cancelled: { label: 'Batal', color: '#dc2626', bg: '#fee2e2' },
  shipped: { label: 'Dikirim', color: '#2563eb', bg: '#dbeafe' },
  delivered: { label: 'Diterima', color: '#16a34a', bg: '#dcfce7' },
}

export default async function AdminOrdersPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any
  const { data: orders } = await admin
    .from('orders')
    .select(`
      id, status, total_amount, shipping_fee, midtrans_order_id,
      shipping_address, created_at,
      profiles (full_name),
      order_items (
        quantity, unit_price,
        products (name)
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div style={{ maxWidth: '1100px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Semua Pesanan</h1>
        <p style={{ color: 'var(--neutral-500)', fontSize: '0.9rem' }}>{orders?.length ?? 0} pesanan total</p>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {!orders || orders.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--neutral-400)' }}>
            Belum ada pesanan masuk.
          </div>
        ) : orders.map((order: any, i: number) => {
          const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending
          return (
            <div key={order.id} style={{
              padding: '1.25rem 1.5rem',
              borderBottom: i < orders.length - 1 ? '1px solid var(--neutral-100)' : 'none',
              display: 'flex', flexDirection: 'column', gap: '0.75rem',
            }}>
              {/* Row 1: ID + Status + Amount */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--neutral-600)', fontWeight: 600 }}>
                    {order.midtrans_order_id ?? order.id.slice(0, 16)}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--neutral-400)', marginLeft: '0.75rem' }}>
                    {formatDate(order.created_at)}
                  </span>
                  {order.profiles?.full_name && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--neutral-500)', marginLeft: '0.75rem' }}>
                      👤 {order.profiles.full_name}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{
                    fontSize: '0.78rem', fontWeight: 700, padding: '0.25rem 0.75rem',
                    borderRadius: '2rem', background: statusCfg.bg, color: statusCfg.color,
                  }}>
                    {statusCfg.label}
                  </span>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--brand-700)' }}>
                    {formatRupiah(order.total_amount)}
                  </span>
                </div>
              </div>

              {/* Row 2: Items */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {(order.order_items as any[]).map((item: any, idx: number) => (
                  <span key={idx} style={{
                    fontSize: '0.78rem', padding: '0.25rem 0.625rem',
                    borderRadius: '0.4rem', background: 'var(--neutral-100)', color: 'var(--neutral-600)',
                  }}>
                    {item.products?.name ?? 'Produk'} ×{item.quantity}
                  </span>
                ))}
              </div>

              {/* Row 3: Address */}
              {order.shipping_address && (
                <p style={{ fontSize: '0.78rem', color: 'var(--neutral-400)' }}>
                  📦 {order.shipping_address}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
