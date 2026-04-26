import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

// POST /api/admin/set-role
// Body: { userId: string, role: 'admin' | 'customer' }
// Protected: caller must already be an admin OR this is a one-time bootstrap.
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { userId, role } = body as { userId: string; role: string }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any
    const { data, error } = await admin.auth.admin.updateUserById(userId, {
      app_metadata: { role },
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Also update the profiles table
    await admin.from('profiles').update({ role }).eq('id', userId)

    return NextResponse.json({ success: true, user: data.user })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
