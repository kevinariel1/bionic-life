import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { Plus, QrCode, Leaf } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Batch & QR | Admin' }

function formatDate(d: string) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d))
}

export default async function AdminBatchesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any
  const { data: batches } = await admin
    .from('batches')
    .select('*, products(name, category)')
    .order('created_at', { ascending: false })

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Batch & QR Traceability</h1>
          <p style={{ color: 'var(--neutral-500)', fontSize: '0.9rem' }}>{batches?.length ?? 0} batch terdaftar</p>
        </div>
        <Link href="/admin/batches/new" className="btn-primary">
          <Plus size={16} /> Buat Batch Baru
        </Link>
      </div>

      {!batches || batches.length === 0 ? (
        <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
          <QrCode size={48} style={{ margin: '0 auto 1rem', color: 'var(--neutral-300)' }} />
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--neutral-600)' }}>Belum ada batch</h3>
          <p style={{ color: 'var(--neutral-400)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            Buat batch pertama untuk mulai melacak produk dari sumbernya.
          </p>
          <Link href="/admin/batches/new" className="btn-primary" style={{ display: 'inline-flex' }}>
            <Plus size={16} /> Buat Batch Pertama
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {batches.map((batch: any) => (
            <div key={batch.id} className="card" style={{ padding: '1.5rem' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <Leaf size={14} color="var(--brand-600)" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{batch.products?.name ?? 'Produk tidak ditemukan'}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--neutral-400)', fontFamily: 'monospace' }}>
                    {batch.id.slice(0, 16)}...
                  </span>
                </div>
                {batch.is_organic && (
                  <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '2rem', background: 'var(--brand-100)', color: 'var(--brand-700)', fontWeight: 600 }}>
                    🌿 Organik
                  </span>
                )}
              </div>

              {/* Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {batch.farm_name && (
                  <div style={detailRow}>
                    <span style={detailLabel}>Farm</span>
                    <span style={detailValue}>{batch.farm_name}</span>
                  </div>
                )}
                {batch.location && (
                  <div style={detailRow}>
                    <span style={detailLabel}>Lokasi</span>
                    <span style={detailValue}>{batch.location}</span>
                  </div>
                )}
                {batch.harvest_date && (
                  <div style={detailRow}>
                    <span style={detailLabel}>Panen</span>
                    <span style={detailValue}>{formatDate(batch.harvest_date)}</span>
                  </div>
                )}
              </div>

              {/* QR Link */}
              <Link
                href={`/trace/${batch.id}`}
                target="_blank"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.625rem 1rem',
                  borderRadius: '0.625rem',
                  background: 'var(--neutral-50)',
                  border: '1px solid var(--neutral-200)',
                  textDecoration: 'none',
                  color: 'var(--neutral-700)',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  transition: 'all 0.15s',
                }}
              >
                <QrCode size={14} color="var(--brand-600)" />
                Lihat Halaman Trace
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const detailRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }
const detailLabel: React.CSSProperties = { color: 'var(--neutral-400)' }
const detailValue: React.CSSProperties = { fontWeight: 500, color: 'var(--neutral-700)', textAlign: 'right' }
