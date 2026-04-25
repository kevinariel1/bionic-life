'use client'

import { useCartStore, selectItemCount, selectSubtotal, selectTotal } from '@/lib/store/cart'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

export default function CartPage() {
  const [mounted, setMounted] = useState(false)
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const itemCount = useCartStore(selectItemCount)
  const subtotal = useCartStore(selectSubtotal)
  const total = useCartStore(selectTotal)
  const SHIPPING = 15000

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  if (items.length === 0) {
    return (
      <div className="section">
        <div className="container" style={{ textAlign: 'center', padding: '6rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
          <h2 style={{ marginBottom: '0.75rem' }}>Keranjang Kosong</h2>
          <p style={{ color: 'var(--neutral-500)', marginBottom: '2rem' }}>
            Belum ada produk di keranjang Anda
          </p>
          <Link href="/products" className="btn-primary">
            <ShoppingBag size={18} /> Mulai Belanja
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="section">
      <div className="container">
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Keranjang Belanja</h1>
        <p style={{ color: 'var(--neutral-500)', marginBottom: '2.5rem' }}>
          {itemCount} item dalam keranjang
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 340px',
          gap: '2rem',
          alignItems: 'start',
        }}>
          {/* Cart Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="card" style={{
                padding: '1.25rem',
                display: 'flex',
                gap: '1.25rem',
                alignItems: 'center',
              }}>
                {/* Thumbnail */}
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '0.75rem',
                  background: 'linear-gradient(135deg, var(--brand-50), var(--earth-50))',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  overflow: 'hidden',
                }}>
                  {product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.image_url} alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : '🌿'}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    {product.name}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--neutral-400)' }}>{product.category}</p>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--brand-700)', marginTop: '0.35rem' }}>
                    {formatRupiah(product.price)}
                  </p>
                </div>

                {/* Quantity + Remove */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1.5px solid var(--neutral-200)',
                    borderRadius: '0.5rem',
                    overflow: 'hidden',
                  }}>
                    <button
                      id={`decrease-${product.id}`}
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      style={{
                        width: '2rem', height: '2rem',
                        background: 'none', border: 'none',
                        cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        color: 'var(--neutral-600)',
                      }}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{
                      padding: '0 0.75rem',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      minWidth: '2rem',
                      textAlign: 'center',
                    }}>
                      {quantity}
                    </span>
                    <button
                      id={`increase-${product.id}`}
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      disabled={quantity >= product.stock}
                      style={{
                        width: '2rem', height: '2rem',
                        background: 'none', border: 'none',
                        cursor: quantity >= product.stock ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: quantity >= product.stock ? 'var(--neutral-300)' : 'var(--neutral-600)',
                      }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    id={`remove-${product.id}`}
                    onClick={() => removeItem(product.id)}
                    style={{
                      background: 'none', border: 'none',
                      cursor: 'pointer', color: 'var(--neutral-400)',
                      display: 'flex', alignItems: 'center',
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--neutral-400)')}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '5rem' }}>
            <h2 style={{ fontSize: '1.15rem', marginBottom: '1.5rem' }}>Ringkasan Pesanan</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--neutral-600)' }}>Subtotal ({itemCount} item)</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--neutral-600)' }}>Ongkos Kirim</span>
                <span>{formatRupiah(SHIPPING)}</span>
              </div>
              <div style={{
                borderTop: '1px solid var(--neutral-200)',
                paddingTop: '0.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 700,
                fontSize: '1.05rem',
              }}>
                <span>Total</span>
                <span style={{ color: 'var(--brand-700)' }}>{formatRupiah(total)}</span>
              </div>
            </div>

            <Link href="/checkout" className="btn-primary" style={{
              width: '100%',
              justifyContent: 'center',
              fontSize: '0.95rem',
            }}>
              Lanjut ke Pembayaran <ArrowRight size={18} />
            </Link>
            <Link href="/products" className="btn-ghost" style={{
              width: '100%',
              justifyContent: 'center',
              marginTop: '0.5rem',
              fontSize: '0.85rem',
            }}>
              Lanjut Belanja
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
