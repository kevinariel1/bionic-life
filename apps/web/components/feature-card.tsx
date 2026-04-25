'use client'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  desc: string
}

export function FeatureCard({ icon, title, desc }: FeatureCardProps) {
  return (
    <div
      style={{
        padding: '2rem',
        borderRadius: '1rem',
        border: '1px solid var(--neutral-200)',
        transition: 'all 0.25s ease',
        background: 'white',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = 'var(--brand-200)'
        el.style.boxShadow = '0 8px 30px rgba(34,197,94,0.1)'
        el.style.transform = 'translateY(-4px)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = 'var(--neutral-200)'
        el.style.boxShadow = 'none'
        el.style.transform = 'translateY(0)'
      }}
    >
      <div style={{
        width: '3.5rem',
        height: '3.5rem',
        borderRadius: '1rem',
        background: 'var(--brand-50)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.25rem',
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ fontSize: '0.9rem', color: 'var(--neutral-500)', lineHeight: 1.6 }}>{desc}</p>
    </div>
  )
}
