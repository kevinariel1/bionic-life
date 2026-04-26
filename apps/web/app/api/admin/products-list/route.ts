import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/admin/products-list — returns minimal product list for dropdowns
// No auth needed since it's just names/ids (products are already public)
export async function GET() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any
  const { data } = await admin.from('products').select('id, name').eq('is_active', true).order('name')
  return NextResponse.json(data ?? [])
}
