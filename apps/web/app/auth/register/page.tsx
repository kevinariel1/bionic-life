'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Leaf, Mail, Lock, Eye, EyeOff, ArrowRight, User } from 'lucide-react'
import { signUp } from '../actions'
import type { Metadata } from 'next'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ error?: string; success?: boolean; message?: string } | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    const formData = new FormData(e.currentTarget)
    const res = await signUp(formData)
    setResult(res)
    setLoading(false)
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
        {/* Card */}
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
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>Buat Akun</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--neutral-500)' }}>
              Bergabung dengan Bionic Life gratis
            </p>
          </div>

          {/* Success state */}
          {result?.success ? (
            <div style={{
              textAlign: 'center',
              padding: '1.5rem',
              background: 'var(--brand-50)',
              borderRadius: '1rem',
              border: '1px solid var(--brand-200)',
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📧</div>
              <h3 style={{ color: 'var(--brand-700)', marginBottom: '0.5rem' }}>Cek Email Anda!</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--neutral-600)' }}>
                {result.message}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Error */}
              {result?.error && (
                <div style={{
                  padding: '0.875rem 1rem',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '0.75rem',
                  fontSize: '0.875rem',
                  color: '#dc2626',
                }}>
                  {result.error}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--neutral-700)', display: 'block', marginBottom: '0.5rem' }}>
                  Nama Lengkap
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-400)', pointerEvents: 'none' }} />
                  <input
                    id="register-fullname"
                    name="full_name"
                    type="text"
                    required
                    placeholder="Nama lengkap Anda"
                    className="input"
                    style={{ paddingLeft: '2.75rem' }}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--neutral-700)', display: 'block', marginBottom: '0.5rem' }}>
                  Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-400)', pointerEvents: 'none' }} />
                  <input
                    id="register-email"
                    name="email"
                    type="email"
                    required
                    placeholder="email@contoh.com"
                    className="input"
                    style={{ paddingLeft: '2.75rem' }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--neutral-700)', display: 'block', marginBottom: '0.5rem' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-400)', pointerEvents: 'none' }} />
                  <input
                    id="register-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Minimal 6 karakter"
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
                id="register-submit"
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Memproses...' : <>Daftar Sekarang <ArrowRight size={16} /></>}
              </button>
            </form>
          )}

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--neutral-500)' }}>
            Sudah punya akun?{' '}
            <Link href="/auth/login" style={{ color: 'var(--brand-600)', fontWeight: 600, textDecoration: 'none' }}>
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
