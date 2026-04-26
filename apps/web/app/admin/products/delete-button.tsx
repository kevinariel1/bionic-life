'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DeleteProductButtonProps {
  productId: string
  productName: string
}

export function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`Hapus "${productName}"? Tindakan ini tidak dapat dibatalkan.`)) return
    setLoading(true)

    const res = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' })
    if (res.ok) {
      router.refresh()
    } else {
      alert('Gagal menghapus produk.')
    }
    setLoading(false)
  }

  return (
    <button
      id={`delete-product-${productId}`}
      onClick={handleDelete}
      disabled={loading}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
        padding: '0.4rem 0.75rem',
        borderRadius: '0.5rem',
        background: '#fef2f2',
        color: '#dc2626',
        border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: '0.8rem', fontFamily: 'var(--font-sans)',
        opacity: loading ? 0.6 : 1,
        transition: 'all 0.15s',
      }}
    >
      <Trash2 size={13} />
      {loading ? '...' : 'Hapus'}
    </button>
  )
}
