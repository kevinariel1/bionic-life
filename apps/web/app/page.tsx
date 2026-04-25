import Link from 'next/link'
import { ArrowRight, Leaf, ShieldCheck, QrCode, Truck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/product-card'
import { FeatureCard } from '@/components/feature-card'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(4)

  const features = [
    {
      icon: <Leaf size={28} color="var(--brand-600)" />,
      title: '100% Organik',
      desc: 'Semua produk kami tersertifikasi organik, bebas pestisida dan bahan kimia berbahaya.',
    },
    {
      icon: <QrCode size={28} color="var(--brand-600)" />,
      title: 'Lacak Asal Usul',
      desc: 'Scan QR code pada produk dan lihat perjalanan lengkap dari ladang ke meja Anda.',
    },
    {
      icon: <ShieldCheck size={28} color="var(--brand-600)" />,
      title: 'Terverifikasi',
      desc: 'Setiap batch produk kami dicatat di database yang tidak dapat dimanipulasi.',
    },
    {
      icon: <Truck size={28} color="var(--brand-600)" />,
      title: 'Pengiriman Cepat',
      desc: 'Ongkos kirim flat Rp 15.000 ke seluruh Indonesia. Segar sampai di tangan Anda.',
    },
  ]

  return (
    <>
      {/* ── Hero ── */}
      <section style={{
        minHeight: 'calc(100vh - 4rem)',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(160deg, #f0fdf4 0%, #fefce8 50%, #f0fdf4 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', top: '-10%', right: '-5%',
          width: '40vw', height: '40vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', left: '-5%',
          width: '30vw', height: '30vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(234,179,8,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="container">
          <div style={{ maxWidth: '680px' }} className="fade-in-up">
            <div className="badge badge-green" style={{ marginBottom: '1.5rem' }}>
              🌱 Organik · Tersertifikasi · Terlacak
            </div>
            <h1 style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '1.5rem',
              color: 'var(--neutral-900)',
            }}>
              Produk Organik,{' '}
              <span style={{
                background: 'linear-gradient(135deg, var(--brand-500), var(--brand-700))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Dari Ladang
              </span>{' '}
              ke Meja Anda
            </h1>
            <p style={{
              fontSize: '1.15rem',
              color: 'var(--neutral-600)',
              marginBottom: '2.5rem',
              lineHeight: 1.7,
              maxWidth: '520px',
            }}>
              Beli beras, camilan, dan minyak organik premium. Setiap produk dapat dilacak sumbernya melalui teknologi QR traceability kami.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/products" className="btn-primary" style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
                Belanja Sekarang <ArrowRight size={18} />
              </Link>
              <Link href="/trace" className="btn-secondary" style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
                <QrCode size={18} /> Scan QR
              </Link>
            </div>

            {/* Stats */}
            <div style={{
              display: 'flex',
              gap: '2.5rem',
              marginTop: '3.5rem',
              flexWrap: 'wrap',
            }}>
              {[
                { value: '50+', label: 'Produk Organik' },
                { value: '100%', label: 'Bersertifikat' },
                { value: '1.200+', label: 'Pelanggan Puas' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div style={{
                    fontSize: '2rem',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    color: 'var(--brand-600)',
                    lineHeight: 1,
                  }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--neutral-500)', marginTop: '0.25rem' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Mengapa Bionic Life?</h2>
            <p style={{ color: 'var(--neutral-500)', maxWidth: '500px', margin: '0 auto' }}>
              Kami percaya bahwa makanan yang baik dimulai dari sumber yang bisa dipercaya.
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
          }}>
            {features.map((f) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="section" style={{ background: 'var(--neutral-50)' }}>
          <div className="container">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '2rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}>
              <div>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Produk Unggulan</h2>
                <p style={{ color: 'var(--neutral-500)' }}>Pilihan terbaik dari kebun organik kami</p>
              </div>
              <Link href="/products" className="btn-secondary">
                Lihat Semua <ArrowRight size={16} />
              </Link>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1.5rem',
            }}>
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA Banner ── */}
      <section className="section">
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, var(--brand-600), var(--brand-800))',
            borderRadius: '1.5rem',
            padding: '3.5rem 2.5rem',
            textAlign: 'center',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: '-30%', right: '-10%',
              width: '25rem', height: '25rem', borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              pointerEvents: 'none',
            }} />
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-display)', color: 'white' }}>
              Mulai Perjalanan Organik Anda
            </h2>
            <p style={{ marginBottom: '2rem', opacity: 0.85, maxWidth: '480px', margin: '0 auto 2rem' }}>
              Bergabung dengan ribuan pelanggan yang telah memilih gaya hidup sehat bersama Bionic Life.
            </p>
            <Link href="/auth/register" className="btn-primary" style={{
              background: 'white',
              color: 'var(--brand-700)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}>
              Daftar Gratis <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
