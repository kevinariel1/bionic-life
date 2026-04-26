'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

const CATEGORIES = ['Rice', 'Snacks', 'Oil', 'Sweeteners', 'Vegetables', 'Fruits', 'Other']

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', description: '', price: '', stock: '', category: 'Rice', image_url: '', is_active: true,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.price || !form.stock) {
      setError('Nama, harga, dan stok wajib diisi.')
      return
    }
    setLoading(true)
    setError(null)

    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        category: form.category || null,
        image_url: form.image_url.trim() || null,
        is_active: form.is_active,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Gagal menyimpan produk.')
      setLoading(false)
      return
    }
    router.push('/admin/products')
    router.refresh()
  }

  return (
    <div style={{ maxWidth: '680px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/admin/products" className="btn-ghost" style={{ paddingLeft: 0, marginBottom: '1rem' }}>
          <ArrowLeft size={16} /> Kembali ke Produk
        </Link>
        <h1 style={{ fontSize: '1.75rem' }}>Tambah Produk Baru</h1>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && (
            <div style={{ padding: '0.875rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', color: '#dc2626', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label style={labelStyle}>Nama Produk *</label>
            <input id="product-name" name="name" value={form.name} onChange={handleChange} required placeholder="contoh: Beras Organik Premium" className="input" />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Deskripsi</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Deskripsi singkat produk..." className="input" style={{ resize: 'vertical', lineHeight: 1.6 }} />
          </div>

          {/* Price + Stock */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Harga (IDR) *</label>
              <input id="product-price" name="price" type="number" min="0" value={form.price} onChange={handleChange} required placeholder="85000" className="input" />
            </div>
            <div>
              <label style={labelStyle}>Stok (unit) *</label>
              <input id="product-stock" name="stock" type="number" min="0" value={form.stock} onChange={handleChange} required placeholder="100" className="input" />
            </div>
          </div>

          {/* Category */}
          <div>
            <label style={labelStyle}>Kategori</label>
            <select name="category" value={form.category} onChange={handleChange} className="input">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Image URL */}
          <div>
            <label style={labelStyle}>URL Gambar (opsional)</label>
            <input name="image_url" value={form.image_url} onChange={handleChange} type="url" placeholder="https://..." className="input" />
          </div>

          {/* Active toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input
              id="product-active"
              name="is_active"
              type="checkbox"
              checked={form.is_active}
              onChange={handleChange}
              style={{ width: '1.1rem', height: '1.1rem', accentColor: 'var(--brand-500)', cursor: 'pointer' }}
            />
            <label htmlFor="product-active" style={{ fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
              Produk aktif (tampil di storefront)
            </label>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
            <button id="save-product" type="submit" disabled={loading} className="btn-primary" style={{ opacity: loading ? 0.7 : 1 }}>
              <Save size={16} /> {loading ? 'Menyimpan...' : 'Simpan Produk'}
            </button>
            <Link href="/admin/products" className="btn-secondary">Batal</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.85rem', fontWeight: 600,
  color: 'var(--neutral-700)', marginBottom: '0.5rem',
}
