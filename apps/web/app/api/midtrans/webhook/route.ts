/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createHash } from 'crypto'

// Midtrans sends a POST to this URL when a payment status changes.
// We verify the signature and update the order status in Supabase.
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = body

    // ── Signature Verification ────────────────────────────────────────
    // SHA512(order_id + status_code + gross_amount + ServerKey)
    const serverKey = process.env.MIDTRANS_SERVER_KEY!
    const expectedSignature = createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest('hex')

    if (signature_key !== expectedSignature) {
      console.warn('Invalid Midtrans signature for order:', order_id)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }
    // ─────────────────────────────────────────────────────────────────

    const adminClient = createAdminClient() as any

    // Map Midtrans status → our order status
    let newStatus: string | null = null

    if (transaction_status === 'capture') {
      newStatus = fraud_status === 'accept' ? 'paid' : null
    } else if (transaction_status === 'settlement') {
      newStatus = 'paid'
    } else if (
      transaction_status === 'cancel' ||
      transaction_status === 'deny' ||
      transaction_status === 'expire'
    ) {
      newStatus = 'cancelled'
    } else if (transaction_status === 'pending') {
      newStatus = 'pending'
    }

    if (newStatus) {
      const { error } = await adminClient
        .from('orders')
        .update({ status: newStatus })
        .eq('midtrans_order_id', order_id)

      if (error) {
        console.error('Webhook DB update error:', error)
        return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
      }

      console.log(`✅ Order ${order_id} → ${newStatus}`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
