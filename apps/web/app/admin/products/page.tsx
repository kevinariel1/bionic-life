import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Package } from 'lucide-react'
import { DeleteProductButton } from './delete-button'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Produk | Admin' }

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

export default async function AdminProductsPage() {
  const admin = createAdminClient() as any // eslint-disable-line @typescript-eslint/no-explicit-any
  const { data: products } = await admin
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Produk</h1>
          <p style={{ color: 'var(--neutral-500)', fontSize: '0.9rem' }}>{products?.length ?? 0} produk terdaftar</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary">
          <Plus size={16} /> Tambah Produk
        </Link>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--neutral-50)', borderBottom: '1px solid var(--neutral-200)' }}>
              {['Produk', 'Kategori', 'Harga', 'Stok', 'Status', 'Aksi'].map((h) => (
                <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: 'var(--neutral-500)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!products || products.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--neutral-400)' }}>
                  <Package size={32} style={{ margin: '0 auto 0.75rem', display: 'block', color: 'var(--neutral-300)' }} />
                  Belum ada produk
                </td>
              </tr>
            ) : products.map((product: any, i: number) => (
              <tr key={product.id} style={{ borderBottom: i < products.length - 1 ? '1px solid var(--neutral-100)' : 'none' }}>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--neutral-900)' }}>{product.name}</div>
                  {product.description && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--neutral-400)', marginTop: '0.2rem', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {product.description}
                    </div>
                  )}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.625rem', borderRadius: '2rem', background: 'var(--brand-100)', color: 'var(--brand-700)', fontWeight: 600 }}>
                    {product.category ?? '—'}
                  </span>
                </td>
                <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--brand-700)', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                  {formatRupiah(product.price)}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    fontSize: '0.8rem', fontWeight: 700,
                    color: product.stock === 0 ? '#dc2626' : product.stock <= 20 ? '#ca8a04' : 'var(--brand-700)',
                    background: product.stock === 0 ? '#fee2e2' : product.stock <= 20 ? '#fef9c3' : 'var(--brand-50)',
                    padding: '0.2rem 0.625rem', borderRadius: '2rem',
                  }}>
                    {product.stock} unit
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    fontSize: '0.78rem', fontWeight: 600,
                    color: product.is_active ? 'var(--brand-700)' : 'var(--neutral-400)',
                    background: product.is_active ? 'var(--brand-100)' : 'var(--neutral-100)',
                    padding: '0.2rem 0.625rem', borderRadius: '2rem',
                  }}>
                    {product.is_active ? 'Aktif' : 'Non-aktif'}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link href={`/admin/products/${product.id}/edit`} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                      padding: '0.4rem 0.75rem',
                      borderRadius: '0.5rem',
                      background: 'var(--neutral-100)',
                      color: 'var(--neutral-700)',
                      textDecoration: 'none', fontSize: '0.8rem',
                      transition: 'background 0.15s',
                    }}>
                      <Pencil size={13} /> Edit
                    </Link>
                    <DeleteProductButton productId={product.id} productName={product.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
