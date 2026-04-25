'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useState, useTransition } from 'react'

interface ProductFiltersProps {
  categories: string[]
  currentCategory: string
  currentQuery: string
}

export function ProductFilters({ categories, currentCategory, currentQuery }: ProductFiltersProps) {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState(currentQuery)
  const [, startTransition] = useTransition()

  const navigate = (cat: string, q: string) => {
    const params = new URLSearchParams()
    if (cat && cat !== 'Semua') params.set('category', cat)
    if (q) params.set('q', q)
    startTransition(() => {
      router.push(`/products${params.toString() ? `?${params}` : ''}`)
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(currentCategory, searchValue)
  }

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* Search bar */}
      <form onSubmit={handleSearch} style={{
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '1.25rem',
        maxWidth: '480px',
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{
            position: 'absolute', left: '1rem', top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--neutral-400)',
            pointerEvents: 'none',
          }} />
          <input
            id="product-search-input"
            type="text"
            className="input"
            placeholder="Cari produk..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            style={{ paddingLeft: '2.5rem', paddingRight: searchValue ? '2.5rem' : '1rem' }}
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => { setSearchValue(''); navigate(currentCategory, '') }}
              style={{
                position: 'absolute', right: '0.75rem', top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--neutral-400)',
                display: 'flex', alignItems: 'center',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.25rem', whiteSpace: 'nowrap' }}>
          Cari
        </button>
      </form>

      {/* Category chips */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            id={`filter-${cat.toLowerCase()}`}
            onClick={() => navigate(cat, searchValue)}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '2rem',
              border: '1.5px solid',
              borderColor: currentCategory === cat ? 'var(--brand-500)' : 'var(--neutral-200)',
              background: currentCategory === cat ? 'var(--brand-500)' : 'white',
              color: currentCategory === cat ? 'white' : 'var(--neutral-700)',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              transition: 'all 0.15s ease',
            }}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  )
}
