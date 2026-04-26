import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin-sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Check admin role from app_metadata
  const role = (user.app_metadata as Record<string, string>)?.role
  if (role !== 'admin') redirect('/')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--neutral-50)' }}>
      <AdminSidebar userEmail={user.email ?? ''} />
      <main style={{ flex: 1, padding: '2rem', overflow: 'auto', marginLeft: '260px' }}>
        {children}
      </main>
    </div>
  )
}
