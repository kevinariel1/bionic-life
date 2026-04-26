'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Leaf, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { signIn } from '../actions'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    const result = await signIn(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
    // On success, signIn redirects server-side
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(160deg, #f0fdf4 0%, #fefce8 100%)',
      padding: '2rem 1rem',
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{
          background: 'white',
          borderRadius: '1.5rem',
          padding: '2.5rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
          border: '1px solid var(--neutral-200)',
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '3rem', height: '3rem',
              borderRadius: '1rem',
              background: 'linear-gradient(135deg, var(--brand-500), var(--brand-700))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
            }}>
              <Leaf size={18} color="white" />
            </div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>Selamat Datang</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--neutral-500)' }}>
              Masuk ke akun Bionic Life Anda
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Errors */}
            {(error || errorParam) && (
              <div style={{
                padding: '0.875rem 1rem',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                color: '#dc2626',
              }}>
                {error ?? (errorParam === 'konfirmasi_gagal' ? 'Konfirmasi email gagal. Coba lagi.' : 'Terjadi kesalahan.')}
              </div>
            )}

            {/* Email */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--neutral-700)', display: 'block', marginBottom: '0.5rem' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-400)', pointerEvents: 'none' }} />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="email@contoh.com"
                  className="input"
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--neutral-700)' }}>
                  Password
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-400)', pointerEvents: 'none' }} />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Password Anda"
                  className="input"
                  style={{ paddingLeft: '2.75rem', paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '1rem', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', color: 'var(--neutral-400)',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Memproses...' : <>Masuk <ArrowRight size={16} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--neutral-500)' }}>
            Belum punya akun?{' '}
            <Link href="/auth/register" style={{ color: 'var(--brand-600)', fontWeight: 600, textDecoration: 'none' }}>
              Daftar gratis
            </Link>
          </p>
        </div>

        {/* Demo admin hint */}
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: 'rgba(255,255,255,0.7)',
          borderRadius: '1rem',
          border: '1px solid var(--neutral-200)',
          fontSize: '0.8rem',
          color: 'var(--neutral-500)',
          textAlign: 'center',
          backdropFilter: 'blur(8px)',
        }}>
          💡 <strong>Demo:</strong> Daftar akun baru atau gunakan akun yang sudah ada
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
