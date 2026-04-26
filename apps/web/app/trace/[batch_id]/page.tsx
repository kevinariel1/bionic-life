import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Leaf, MapPin, Calendar, User, Award, FileText, ShoppingBag } from 'lucide-react'
import { QRDisplay } from './qr-display'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ batch_id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { batch_id } = await params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any
  const { data } = await admin.from('batches').select('*, products(name)').eq('id', batch_id).single()
  return {
    title: data ? `Lacak: ${data.products?.name} | Bionic Life` : 'Produk Tidak Ditemukan',
    description: data ? `Lacak asal usul ${data.products?.name} dari ${data.farm_name}.` : '',
  }
}

function formatDate(d: string) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d))
}

export default async function TracePage({ params }: Props) {
  const { batch_id } = await params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any
  const { data: batch } = await admin
    .from('batches')
    .select('*, products(id, name, category, description, price)')
    .eq('id', batch_id)
    .single()

  if (!batch) notFound()

  const product = batch.products
  const traceUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/trace/${batch_id}`

  const details = [
    { icon: <User size={16} />, label: 'Nama Petani', value: batch.farmer_name },
    { icon: <MapPin size={16} />, label: 'Lokasi Farm', value: batch.location },
    { icon: <Calendar size={16} />, label: 'Tanggal Panen', value: batch.harvest_date ? formatDate(batch.harvest_date) : null },
    { icon: <Award size={16} />, label: 'Sertifikasi', value: batch.certification },
    { icon: <FileText size={16} />, label: 'Catatan', value: batch.notes },
  ].filter((d) => d.value)

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #f0fdf4 0%, #fefce8 100%)' }}>
      {/* Minimal header */}
      <header style={{
        background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--neutral-200)',
        padding: '1rem 1.5rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <div style={{
            width: '1.75rem', height: '1.75rem', borderRadius: '0.5rem',
            background: 'linear-gradient(135deg, var(--brand-500), var(--brand-700))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Leaf size={12} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--neutral-900)', fontSize: '1rem' }}>
            Bionic <span style={{ color: 'var(--brand-600)' }}>Life</span>
          </span>
        </Link>
        <div style={{ height: '1.25rem', width: '1px', background: 'var(--neutral-300)', marginLeft: '0.25rem' }} />
        <span style={{ fontSize: '0.85rem', color: 'var(--neutral-500)' }}>Lacak Produk</span>
      </header>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.375rem 1rem',
            borderRadius: '2rem',
            background: 'var(--brand-100)',
            color: 'var(--brand-700)',
            fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem',
          }}>
            <Leaf size={13} /> {batch.is_organic ? '🌿 Produk Organik Tersertifikasi' : 'Produk Terlacak'}
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{product?.name}</h1>
          <p style={{ color: 'var(--neutral-500)', fontSize: '0.95rem' }}>
            {product?.description ?? 'Diproduksi dengan standar kualitas tinggi dan dapat dilacak hingga ke sumbernya.'}
          </p>
        </div>

        {/* Farm card */}
        <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <p style={{ fontSize: '0.78rem', color: 'var(--neutral-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
                Asal Farm
              </p>
              <h2 style={{ fontSize: '1.35rem' }}>{batch.farm_name}</h2>
            </div>
            {batch.is_organic && (
              <span style={{ fontSize: '0.8rem', padding: '0.35rem 0.875rem', borderRadius: '2rem', background: 'var(--brand-100)', color: 'var(--brand-700)', fontWeight: 700 }}>
                🌿 Organik
              </span>
            )}
          </div>

          {details.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {details.map((d) => (
                <div key={d.label} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--brand-500)', marginTop: '0.1rem', flexShrink: 0 }}>{d.icon}</span>
                  <div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--neutral-400)', fontWeight: 600 }}>{d.label}</p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--neutral-800)', fontWeight: 500 }}>{d.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Batch ID */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--neutral-400)', fontWeight: 600, marginBottom: '0.25rem' }}>Batch ID</p>
            <p style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--neutral-700)', wordBreak: 'break-all' }}>{batch_id}</p>
          </div>
          <QRDisplay value={traceUrl} size={80} />
        </div>

        {/* CTA */}
        {product && (
          <div style={{ textAlign: 'center', padding: '1.5rem', background: 'white', borderRadius: '1rem', border: '1px solid var(--neutral-200)' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--neutral-500)', marginBottom: '1rem' }}>
              Tertarik dengan produk ini?
            </p>
            <Link href={`/products`} className="btn-primary" style={{ display: 'inline-flex' }}>
              <ShoppingBag size={16} /> Beli Sekarang
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
