// Server action to promote a user to admin via service role key.
// Call this once to set yourself as admin, then protect this endpoint.
'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function setUserAsAdmin(userId: string) {
  const admin = createAdminClient() as any // eslint-disable-line @typescript-eslint/no-explicit-any
  const { data, error } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: { role: 'admin' },
  })
  if (error) throw new Error(error.message)
  return data
}
