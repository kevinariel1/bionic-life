'use client'

import { type Product } from '@/lib/supabase/types'
import { ShoppingCart, Star, Leaf } from 'lucide-react'
import Link from 'next/link'
import { useCartStore } from '@/lib/store/cart'
import { useState } from 'react'

interface ProductCardProps {
  product: Product
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem)
  const [adding, setAdding] = useState(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    setAdding(true)
    addItem(product)
    setTimeout(() => setAdding(false), 600)
  }

  return (
    <Link href={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ cursor: 'pointer' }}>
        {/* Image / placeholder */}
        <div style={{
          height: '200px',
          background: 'linear-gradient(135deg, var(--brand-50) 0%, var(--earth-50) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--brand-400)' }}>
              <Leaf size={48} strokeWidth={1.5} />
              <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--neutral-400)' }}>
                {product.category}
              </div>
            </div>
          )}
          {/* Category badge */}
          {product.category && (
            <span className="badge badge-green" style={{
              position: 'absolute',
              top: '0.75rem',
              left: '0.75rem',
              fontSize: '0.7rem',
            }}>
              {product.category}
            </span>
          )}
          {/* Stock badge */}
          {product.stock <= 10 && product.stock > 0 && (
            <span className="badge badge-yellow" style={{
              position: 'absolute',
              top: '0.75rem',
              right: '0.75rem',
              fontSize: '0.7rem',
            }}>
              Sisa {product.stock}
            </span>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--neutral-900)' }}>
            {product.name}
          </h3>
          {product.description && (
            <p style={{
              fontSize: '0.82rem',
              color: 'var(--neutral-500)',
              marginBottom: '1rem',
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {product.description}
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <span style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              color: 'var(--brand-700)',
              fontFamily: 'var(--font-display)',
            }}>
              {formatRupiah(product.price)}
            </span>
            <button
              id={`add-to-cart-${product.id}`}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="btn-primary"
              style={{
                padding: '0.5rem 0.875rem',
                fontSize: '0.8rem',
                background: adding
                  ? 'linear-gradient(135deg, var(--brand-700), var(--brand-800))'
                  : undefined,
                opacity: product.stock === 0 ? 0.5 : 1,
              }}
            >
              {product.stock === 0 ? (
                'Habis'
              ) : adding ? (
                '✓ Ditambahkan'
              ) : (
                <>
                  <ShoppingCart size={14} />
                  Tambah
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
