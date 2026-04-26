'use client'

import { useState } from 'react'

// ONE-TIME USE PAGE — Visit /admin-setup, paste your user ID, click button.
// After setting admin role, delete this file or protect it!
export default function AdminSetupPage() {
  const [userId, setUserId] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    const res = await fetch('/api/admin/set-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userId.trim(), role: 'admin' }),
    })
    const data = await res.json()
    setResult(res.ok ? `✅ Berhasil! User ${data.user?.email} sekarang adalah admin. Silakan login ulang.` : `❌ Error: ${data.error}`)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--neutral-50)', padding: '2rem',
    }}>
      <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', maxWidth: '480px', width: '100%', border: '1px solid var(--neutral-200)', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
        <h1 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>🔧 Admin Bootstrap</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--neutral-500)', marginBottom: '1.5rem' }}>
          Paste your Supabase User ID below to set yourself as admin. Delete this page after use.
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            id="bootstrap-user-id"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="User UUID (from Supabase Auth dashboard)"
            className="input"
            required
          />
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Memproses...' : 'Set Sebagai Admin'}
          </button>
        </form>
        {result && (
          <div style={{ marginTop: '1rem', padding: '0.875rem', background: '#f0fdf4', border: '1px solid var(--brand-200)', borderRadius: '0.75rem', fontSize: '0.875rem', color: 'var(--brand-800)' }}>
            {result}
          </div>
        )}
      </div>
    </div>
  )
}
