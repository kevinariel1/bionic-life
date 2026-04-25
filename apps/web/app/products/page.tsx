import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/product-card'
import { ProductFilters } from './filters'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Produk',
  description: 'Jelajahi koleksi produk organik premium Bionic Life — beras, camilan, minyak kelapa, dan lebih banyak lagi.',
}

const CATEGORIES = ['Semua', 'Rice', 'Snacks', 'Oil', 'Sweeteners']

interface ProductsPageProps {
  searchParams: Promise<{ category?: string; q?: string }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const category = params.category || 'Semua'
  const query = params.q || ''

  const supabase = await createClient()

  let dbQuery = supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (category && category !== 'Semua') {
    dbQuery = dbQuery.eq('category', category)
  }

  if (query) {
    dbQuery = dbQuery.ilike('name', `%${query}%`)
  }

  const { data: products, error } = await dbQuery

  return (
    <div className="section">
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Produk Organik</h1>
          <p style={{ color: 'var(--neutral-500)' }}>
            {products?.length ?? 0} produk tersedia
            {category !== 'Semua' && ` dalam kategori ${category}`}
            {query && ` untuk "${query}"`}
          </p>
        </div>

        {/* Filters (client component) */}
        <ProductFilters categories={CATEGORIES} currentCategory={category} currentQuery={query} />

        {/* Grid */}
        {error ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--neutral-500)' }}>
            <p>Terjadi kesalahan memuat produk. Coba lagi.</p>
          </div>
        ) : products && products.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.5rem',
          }}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '5rem 2rem',
            color: 'var(--neutral-400)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌿</div>
            <h3 style={{ color: 'var(--neutral-600)', marginBottom: '0.5rem' }}>Produk tidak ditemukan</h3>
            <p>Coba kata kunci atau kategori yang berbeda.</p>
          </div>
        )}
      </div>
    </div>
  )
}
