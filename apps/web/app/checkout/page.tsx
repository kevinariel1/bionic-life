'use client'

import { useState, useEffect } from 'react'
import { useCartStore, selectItemCount, selectSubtotal, selectTotal } from '@/lib/store/cart'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Lock, ArrowLeft, CheckCircle } from 'lucide-react'

declare global {
  interface Window {
    snap: {
      pay: (token: string, options: {
        onSuccess: (result: unknown) => void
        onPending: (result: unknown) => void
        onError: (result: unknown) => void
        onClose: () => void
      }) => void
    }
  }
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(amount)
}

export default function CheckoutPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [snapLoaded, setSnapLoaded] = useState(false)
  const [user, setUser] = useState<{ email?: string | null; id?: string } | null>(null)
  const [shippingAddress, setShippingAddress] = useState('')
  const [paymentDone, setPaymentDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)
  const itemCount = useCartStore(selectItemCount)
  const subtotal = useCartStore(selectSubtotal)
  const total = useCartStore(selectTotal)
  const SHIPPING = 15000

  // Load Midtrans Snap.js and check auth
  useEffect(() => {
    setMounted(true)

    // Load Snap.js from Midtrans CDN (sandbox)
    const script = document.createElement('script')
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? '')
    script.onload = () => setSnapLoaded(true)
    document.head.appendChild(script)

    // Check user auth
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ? { email: data.user.email, id: data.user.id } : null)
    })

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  const handlePayment = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    if (!shippingAddress.trim()) {
      setError('Masukkan alamat pengiriman terlebih dahulu.')
      return
    }
    if (!snapLoaded) {
      setError('Sistem pembayaran belum siap. Coba lagi dalam beberapa detik.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Call our API to create order + get Snap token
      const res = await fetch('/api/midtrans/create-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(({ product, quantity }) => ({
            product_id: product.id,
            name: product.name,
            quantity,
            price: product.price,
          })),
          shippingAddress,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.snapToken) {
        throw new Error(data.error ?? 'Gagal membuat transaksi.')
      }

      // Open Midtrans Snap modal
      window.snap.pay(data.snapToken, {
        onSuccess: () => {
          clearCart()
          setPaymentDone(true)
          setLoading(false)
        },
        onPending: () => {
          clearCart()
          setPaymentDone(true)
          setLoading(false)
        },
        onError: () => {
          setError('Pembayaran gagal. Silakan coba lagi.')
          setLoading(false)
        },
        onClose: () => {
          setLoading(false)
        },
      })
    } catch (err) {
      setError((err as Error).message)
      setLoading(false)
    }
  }

  if (!mounted) return null

  if (paymentDone) {
    return (
      <div className="section">
        <div className="container" style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '480px', margin: '0 auto' }}>
          <div style={{
            width: '5rem', height: '5rem',
            borderRadius: '50%',
            background: 'var(--brand-100)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}>
            <CheckCircle size={40} color="var(--brand-600)" />
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>Pesanan Diterima! 🎉</h1>
          <p style={{ color: 'var(--neutral-500)', marginBottom: '2rem' }}>
            Terima kasih telah berbelanja di Bionic Life. Pesanan Anda sedang diproses.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/orders" className="btn-primary">Lihat Pesanan</Link>
            <Link href="/products" className="btn-secondary">Belanja Lagi</Link>
          </div>
        </div>
      </div>
    )
  }

  if (!mounted || itemCount === 0) {
    return (
      <div className="section">
        <div className="container" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
          <h2 style={{ marginBottom: '0.75rem' }}>Keranjang kosong</h2>
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
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/cart" className="btn-ghost" style={{ paddingLeft: 0, marginBottom: '1rem' }}>
            <ArrowLeft size={16} /> Kembali ke Keranjang
          </Link>
          <h1 style={{ fontSize: '2rem' }}>Checkout</h1>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) 360px',
          gap: '2rem',
          alignItems: 'start',
        }}>
          {/* Left — Shipping Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Auth notice */}
            {!user && (
              <div style={{
                padding: '1.25rem',
                background: '#fef9c3',
                border: '1px solid #fde047',
                borderRadius: '1rem',
                fontSize: '0.9rem',
                color: '#854d0e',
              }}>
                ⚠️ Anda belum login. <Link href="/auth/login" style={{ fontWeight: 600, color: '#92400e' }}>Masuk</Link> untuk melanjutkan pembayaran.
              </div>
            )}

            {/* Shipping address */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>📦 Alamat Pengiriman</h2>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--neutral-700)', display: 'block', marginBottom: '0.5rem' }}>
                  Alamat Lengkap
                </label>
                <textarea
                  id="shipping-address"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Jl. Contoh No. 1, Kelurahan, Kecamatan, Kota, Kode Pos"
                  rows={3}
                  className="input"
                  style={{ resize: 'vertical', lineHeight: 1.6 }}
                />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--neutral-400)', marginTop: '0.5rem' }}>
                🚚 Ongkos kirim flat Rp 15.000 ke seluruh Indonesia
              </p>
            </div>

            {/* Order items review */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>🛍️ Item Pesanan</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {items.map(({ product, quantity }) => (
                  <div key={product.id} style={{
                    display: 'flex', gap: '1rem', alignItems: 'center',
                    paddingBottom: '1rem',
                    borderBottom: '1px solid var(--neutral-100)',
                  }}>
                    <div style={{
                      width: '52px', height: '52px',
                      borderRadius: '0.75rem',
                      background: 'var(--brand-50)',
                      flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.25rem',
                      overflow: 'hidden',
                    }}>
                      {product.image_url
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : '🌿'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{product.name}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--neutral-500)' }}>{quantity}x {formatRupiah(product.price)}</p>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--brand-700)', fontSize: '0.95rem' }}>
                      {formatRupiah(product.price * quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Summary + Pay */}
          <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '5rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>💳 Ringkasan Pembayaran</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--neutral-600)' }}>Subtotal</span>
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
                fontSize: '1.1rem',
              }}>
                <span>Total</span>
                <span style={{ color: 'var(--brand-700)' }}>{formatRupiah(total)}</span>
              </div>
            </div>

            {error && (
              <div style={{
                marginBottom: '1rem',
                padding: '0.875rem',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '0.75rem',
                fontSize: '0.85rem',
                color: '#dc2626',
              }}>
                {error}
              </div>
            )}

            <button
              id="pay-now-button"
              onClick={handlePayment}
              disabled={loading || !user}
              className="btn-primary"
              style={{
                width: '100%',
                fontSize: '1rem',
                padding: '0.875rem',
                opacity: loading || !user ? 0.7 : 1,
                cursor: loading || !user ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                'Memproses...'
              ) : (
                <>
                  <Lock size={16} />
                  Bayar Sekarang
                </>
              )}
            </button>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '0.5rem', marginTop: '1rem',
              fontSize: '0.75rem', color: 'var(--neutral-400)',
            }}>
              <Lock size={12} />
              Pembayaran aman via Midtrans Sandbox
            </div>

            {/* Payment methods */}
            <div style={{
              marginTop: '1rem', paddingTop: '1rem',
              borderTop: '1px solid var(--neutral-100)',
              display: 'flex', gap: '0.5rem',
              justifyContent: 'center', flexWrap: 'wrap',
              fontSize: '0.75rem', color: 'var(--neutral-400)',
            }}>
              <span>💳 Kartu Kredit</span>·
              <span>🏦 Virtual Account</span>·
              <span>💰 GoPay</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
