'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, QrCode } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.85rem', fontWeight: 600,
  color: 'var(--neutral-700)', marginBottom: '0.5rem',
}

export default function NewBatchPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdBatchId, setCreatedBatchId] = useState<string | null>(null)
  const qrRef = useRef<HTMLDivElement>(null)

  const [form, setForm] = useState({
    product_id: '',
    farm_name: '',
    location: '',
    harvest_date: new Date().toISOString().split('T')[0],
    farmer_name: '',
    certification: '',
    notes: '',
    is_organic: true,
  })

  useEffect(() => {
    fetch('/api/admin/products-list')
      .then((r) => r.json())
      .then((data) => {
        setProducts(data)
        if (data.length > 0) setForm((f) => ({ ...f, product_id: data[0].id }))
      })
      .catch(() => setProducts([]))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.product_id || !form.farm_name) {
      setError('Produk dan nama farm wajib diisi.')
      return
    }
    setLoading(true)
    setError(null)

    const res = await fetch('/api/admin/batches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: form.product_id,
        farm_name: form.farm_name.trim(),
        location: form.location.trim() || null,
        harvest_date: form.harvest_date || null,
        farmer_name: form.farmer_name.trim() || null,
        certification: form.certification.trim() || null,
        notes: form.notes.trim() || null,
        is_organic: form.is_organic,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Gagal menyimpan batch.')
      setLoading(false)
      return
    }
    setCreatedBatchId(data.id)
    setLoading(false)
  }

  const traceUrl = createdBatchId
    ? `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/trace/${createdBatchId}`
    : null

  const handleDownloadQR = () => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `batch-qr-${createdBatchId?.slice(0, 8)}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── SUCCESS STATE ──────────────────────────────────────────────────
  if (createdBatchId && traceUrl) {
    return (
      <div style={{ maxWidth: '620px' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Batch Berhasil Dibuat! 🎉</h1>
        <p style={{ color: 'var(--neutral-500)', marginBottom: '2rem' }}>
          QR code siap diunduh dan ditempel pada kemasan produk.
        </p>

        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
            padding: '2rem',
            background: 'white',
            borderRadius: '1rem',
            border: '2px solid var(--brand-200)',
            marginBottom: '1.5rem',
          }} ref={qrRef}>
            <QRCodeSVG
              value={traceUrl}
              size={200}
              fgColor="var(--neutral-900)"
              bgColor="white"
              level="H"
              includeMargin={false}
              imageSettings={{
                src: '/favicon.ico',
                x: undefined, y: undefined,
                height: 30, width: 30,
                excavate: true,
              }}
            />
            <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--neutral-500)', fontFamily: 'monospace', wordBreak: 'break-all', maxWidth: '200px' }}>
              {traceUrl}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button id="download-qr" onClick={handleDownloadQR} className="btn-primary">
              <Download size={16} /> Unduh QR (.svg)
            </button>
            <Link href={traceUrl} target="_blank" className="btn-secondary">
              <QrCode size={16} /> Lihat Halaman Trace
            </Link>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
          <Link href="/admin/batches" className="btn-ghost" style={{ paddingLeft: 0 }}>
            <ArrowLeft size={16} /> Kembali ke Daftar Batch
          </Link>
          <button
            onClick={() => { setCreatedBatchId(null); setForm({ product_id: products[0]?.id ?? '', farm_name: '', location: '', harvest_date: new Date().toISOString().split('T')[0], farmer_name: '', certification: '', notes: '', is_organic: true }) }}
            className="btn-secondary"
          >
            + Buat Batch Lagi
          </button>
        </div>
      </div>
    )
  }

  // ── FORM ──────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '680px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/admin/batches" className="btn-ghost" style={{ paddingLeft: 0, marginBottom: '1rem' }}>
          <ArrowLeft size={16} /> Kembali
        </Link>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Buat Batch & QR</h1>
        <p style={{ color: 'var(--neutral-500)', fontSize: '0.9rem' }}>
          Setiap batch menghasilkan QR unik yang dapat di-scan pelanggan untuk melihat asal produk.
        </p>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && (
            <div style={{ padding: '0.875rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', color: '#dc2626', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          {/* Product */}
          <div>
            <label style={labelStyle}>Produk *</label>
            <select name="product_id" value={form.product_id} onChange={handleChange} required className="input">
              {products.length === 0
                ? <option value="">Memuat produk...</option>
                : products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)
              }
            </select>
          </div>

          {/* Farm Name */}
          <div>
            <label style={labelStyle}>Nama Farm *</label>
            <input id="farm-name" name="farm_name" value={form.farm_name} onChange={handleChange} required placeholder="contoh: Ladang Subang Sejahtera" className="input" />
          </div>

          {/* Location + Harvest */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Lokasi</label>
              <input name="location" value={form.location} onChange={handleChange} placeholder="Subang, Jawa Barat" className="input" />
            </div>
            <div>
              <label style={labelStyle}>Tanggal Panen</label>
              <input name="harvest_date" type="date" value={form.harvest_date} onChange={handleChange} className="input" />
            </div>
          </div>

          {/* Farmer */}
          <div>
            <label style={labelStyle}>Nama Petani</label>
            <input name="farmer_name" value={form.farmer_name} onChange={handleChange} placeholder="Bapak Ahmad" className="input" />
          </div>

          {/* Certification */}
          <div>
            <label style={labelStyle}>Sertifikasi</label>
            <input name="certification" value={form.certification} onChange={handleChange} placeholder="contoh: SNI Organik, USDA Organic" className="input" />
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>Catatan Tambahan</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} placeholder="Info tambahan tentang batch ini..." className="input" style={{ resize: 'vertical', lineHeight: 1.6 }} />
          </div>

          {/* Organic toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input id="is-organic" name="is_organic" type="checkbox" checked={form.is_organic} onChange={handleChange}
              style={{ width: '1.1rem', height: '1.1rem', accentColor: 'var(--brand-500)', cursor: 'pointer' }}
            />
            <label htmlFor="is-organic" style={{ fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
              🌿 Produk bersertifikat organik
            </label>
          </div>

          <button id="create-batch" type="submit" disabled={loading || products.length === 0} className="btn-primary" style={{ opacity: loading ? 0.7 : 1 }}>
            <QrCode size={16} /> {loading ? 'Menyimpan...' : 'Buat Batch & Generate QR'}
          </button>
        </form>
      </div>
    </div>
  )
}
